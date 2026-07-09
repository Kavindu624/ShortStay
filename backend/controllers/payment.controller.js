/**
 * payment.controller.js
 *
 * Supports two payment flows:
 *  1. STRIPE — createPaymentIntent → frontend confirms → webhook marks complete
 *  2. MANUAL — processPayment (direct record, for dev / cash scenarios)
 *
 * Endpoints:
 *  Guest:           POST /process          — manual (existing, backward-compat)
 *                   POST /stripe/intent    — create Stripe PaymentIntent
 *                   POST /stripe/confirm   — confirm after frontend card step
 *                   GET  /my-payments      — guest payment history
 *                   GET  /receipt/:booking_id
 *  Accountant: GET  /                 — all payments (filterable)
 *                   GET  /report           — financial summary
 *                   POST /refund/:booking_id — process refund
 *                   PUT  /status/:payment_id — update payment status
 *  Public (Stripe): POST /webhook          — Stripe webhook handler
 */

const { Payment, Booking, Property, User, Dispute, Payout } = require('../models/index');
const { Op }       = require('sequelize');
const sendEmail    = require('../utils/sendEmail');
const {
  paymentSuccessEmail,
  bookingCancelledEmail,
} = require('../utils/emailTemplates');
const logActivity  = require('../utils/activityLogger');
const { getPlatformSettings } = require('../utils/settings');
const notify       = require('../utils/notify');

// ─── Stripe (lazy-load so server starts even without STRIPE_SECRET_KEY) ───────
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in .env');
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MANUAL PAYMENT (backward-compatible)
//  POST /api/payments/process
// ─────────────────────────────────────────────────────────────────────────────
exports.processPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;

    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: Property, as: 'property', attributes: ['title', 'address', 'host_id'] }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guest_id !== req.user.user_id)
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'approved')
      return res.status(400).json({ message: 'Payment can only be made for approved bookings' });

    const existingPayment = await Payment.findOne({ where: { booking_id, payment_status: 'completed' } });
    if (existingPayment) {
      if (booking.status === 'approved') {
        await booking.update({ status: 'confirmed' });
      }
      return res.status(200).json({ message: 'Payment already processed successfully', payment: existingPayment });
    }

    const guestUser = await User.findByPk(booking.guest_id);
    let discountPct = 0;
    if (guestUser?.membership_level === 'silver') discountPct = 0.01;
    else if (guestUser?.membership_level === 'gold') discountPct = 0.02;
    else if (guestUser?.membership_level === 'platinum') discountPct = 0.03;

    const discountAmount = booking.total_price * discountPct;
    const finalAmount = booking.total_price - discountAmount;

    const payment = await Payment.create({
      booking_id,
      amount:         finalAmount,
      currency:       'USD',
      payment_method: 'manual',
      payment_status: 'completed',
      payment_date:   new Date(),
    });

    await _postPaymentSuccess(payment, booking, req.user.user_id, req);

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STRIPE — CREATE PAYMENT INTENT
//  POST /api/payments/stripe/intent
//  Body: { booking_id }
//  Returns: { client_secret, payment_id } for frontend to call confirmCardPayment
// ─────────────────────────────────────────────────────────────────────────────
exports.createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    const { booking_id } = req.body;

    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: Property, as: 'property', attributes: ['title', 'address', 'host_id'] }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guest_id !== req.user.user_id)
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'approved')
      return res.status(400).json({ message: 'Payment can only be made for approved bookings' });

    const existingPayment = await Payment.findOne({ where: { booking_id, payment_status: 'completed' } });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    const guestUser = await User.findByPk(booking.guest_id);
    let discountPct = 0;
    if (guestUser?.membership_level === 'silver') discountPct = 0.01;
    else if (guestUser?.membership_level === 'gold') discountPct = 0.02;
    else if (guestUser?.membership_level === 'platinum') discountPct = 0.03;

    const discountAmount = booking.total_price * discountPct;
    const finalAmount = booking.total_price - discountAmount;

    // Convert to cents for stripe
    const amountCents = Math.round(finalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        booking_id: String(booking_id),
        guest_id:   String(req.user.user_id),
      },
      description: `ShortStay Booking #${booking_id} — ${booking.property?.title}`,
    });

    // Create a pending payment record
    const payment = await Payment.create({
      booking_id,
      amount:         finalAmount,
      currency:       'USD',
      payment_method: 'stripe',
      payment_status: 'pending',
      transaction_id: paymentIntent.id,
      client_secret:  paymentIntent.client_secret,
      payment_date:   new Date(),
    });

    res.status(201).json({
      message:       'Payment intent created',
      client_secret: paymentIntent.client_secret,
      payment_id:    payment.payment_id,
      amount:        finalAmount,
      currency:      'USD',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STRIPE — CONFIRM PAYMENT (after frontend confirmCardPayment succeeds)
//  POST /api/payments/stripe/confirm
//  Body: { payment_id }
// ─────────────────────────────────────────────────────────────────────────────
exports.confirmStripePayment = async (req, res) => {
  try {
    const stripe = getStripe();
    const { payment_id } = req.body;

    const payment = await Payment.findByPk(payment_id, {
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property', attributes: ['title', 'address', 'host_id'] }],
      }],
    });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    if (payment.booking?.guest_id !== req.user.user_id)
      return res.status(403).json({ message: 'Not authorized' });

    // Verify with Stripe that the intent is actually succeeded
    const intent = await stripe.paymentIntents.retrieve(payment.transaction_id);

    if (intent.status !== 'succeeded') {
      await payment.update({ payment_status: 'failed' });
      return res.status(400).json({
        message: `Payment not confirmed. Stripe status: ${intent.status}`,
      });
    }

    await payment.update({
      payment_status: 'completed',
      client_secret:  null, // clear — no longer needed
    });

    await _postPaymentSuccess(payment, payment.booking, req.user.user_id, req);

    res.status(200).json({ message: 'Payment confirmed', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STRIPE WEBHOOK
//  POST /api/payments/webhook    (no auth — verified by Stripe signature)
// ─────────────────────────────────────────────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent  = event.data.object;
      const payment = await Payment.findOne({
        where: { transaction_id: intent.id },
        include: [{
          model: Booking,
          include: [{ model: Property, as: 'property', attributes: ['title', 'address', 'host_id'] }],
        }],
      });

      if (payment && payment.payment_status !== 'completed') {
        await payment.update({ payment_status: 'completed', client_secret: null });
        const booking = payment.booking;
        if (booking) {
          await _postPaymentSuccess(payment, booking, booking.guest_id, null);
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent  = event.data.object;
      const payment = await Payment.findOne({
        where: { transaction_id: intent.id },
        include: [{ model: Booking }],
      });
      if (payment) {
        await payment.update({ payment_status: 'failed' });
        // Notify guest
        const guestId = payment.booking?.guest_id;
        if (guestId) {
          await notify(
            guestId,
            'Payment Failed ❌',
            `Your payment of $${payment.amount} could not be processed. Please retry or use a different card.`,
            'payment_failed',
            payment.payment_id
          );
        }
        
        // Notify Admin if configured
        const settings = await getPlatformSettings();
        if (settings.notifPayment && settings.notifEmail) {
          await sendEmail(
            settings.notifEmail,
            'Admin Alert: Payment Failed',
            `<p>A payment (ID: ${payment.payment_id}) for $${payment.amount} has failed.</p>`
          );
        }
      }
    }

    if (event.type === 'charge.refunded') {
      const charge  = event.data.object;
      const intent  = charge.payment_intent;
      const payment = await Payment.findOne({ where: { transaction_id: intent } });
      if (payment) {
        await payment.update({
          payment_status:        'refunded',
          refunded_at:           new Date(),
          refund_transaction_id: charge.id,
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  REFUND PAYMENT
//  POST /api/payments/refund/:booking_id   (Accountant only)
//  Body: { reason }
// ─────────────────────────────────────────────────────────────────────────────
exports.refundPayment = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { reason }     = req.body;

    const payment = await Payment.findOne({
      where: { booking_id, payment_status: 'completed' },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title'] },
          { model: User,     as: 'guest',    attributes: ['name', 'email', 'user_id'] },
        ],
      }],
    });

    if (!payment) {
      return res.status(404).json({ message: 'No completed payment found for this booking' });
    }
    if (payment.payment_status === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }

    let refundTransactionId = null;

    // Attempt Stripe refund if payment was made via Stripe
    if (payment.payment_method === 'stripe' && payment.transaction_id) {
      try {
        const stripe = getStripe();
        const refund = await stripe.refunds.create({
          payment_intent: payment.transaction_id,
          reason:         'requested_by_customer',
        });
        refundTransactionId = refund.id;
      } catch (stripeErr) {
        console.error('[Refund] Stripe refund failed:', stripeErr.message);
        // Continue and mark as refunded manually (accountant decision)
      }
    }

    await payment.update({
      payment_status:        'refunded',
      refunded_at:           new Date(),
      refund_transaction_id: refundTransactionId,
      notes:                 reason || 'Refunded by accountant',
    });

    // In-app + email notification to guest
    const guest = payment.booking?.guest;
    if (guest) {
      await notify(
        guest.user_id,
        'Refund Processed 💰',
        `Your refund of $${payment.amount} for "${payment.booking?.property?.title}" has been processed.`,
        'refund_processed',
        payment.payment_id
      );

      await sendEmail(
        guest.email,
        'Refund Processed - ShortStay',
        refundConfirmationEmail(
          guest.name,
          payment.amount,
          payment.booking?.property?.title,
          reason
        )
      );
    }

    await logActivity({
      user_id:   req.user.user_id,
      action:    'REFUND_PROCESSED',
      entity:    'payment',
      entity_id: payment.payment_id,
      req,
      details:   { booking_id, amount: payment.amount, reason },
    });

    res.status(200).json({ message: 'Refund processed', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE PAYMENT STATUS (Accountant only)
//  PUT /api/payments/status/:payment_id
//  Body: { status, notes }
// ─────────────────────────────────────────────────────────────────────────────
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_id }            = req.params;
    const { status, notes }         = req.body;
    const validStatuses             = ['pending', 'completed', 'failed', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const payment = await Payment.findByPk(payment_id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    await payment.update({ payment_status: status, notes: notes || payment.notes });

    await logActivity({
      user_id:   req.user.user_id,
      action:    'PAYMENT_STATUS_UPDATED',
      entity:    'payment',
      entity_id: payment.payment_id,
      req,
      details:   { old_status: payment.payment_status, new_status: status },
    });

    res.status(200).json({ message: 'Payment status updated', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GUEST — MY PAYMENT HISTORY
//  GET /api/payments/my-payments?status=&page=1&limit=10
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Join through booking → filter by guest_id
    const where = {};
    if (status) where.payment_status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [{
        model: Booking,
        where:   { guest_id: req.user.user_id },
        include: [{ model: Property, as: 'property', attributes: ['title', 'address'] }],
      }],
      order:  [['payment_date', 'DESC'], ['payment_id', 'DESC']],
      limit:  Math.min(parseInt(limit), 50),
      offset,
    });

    const totalSpent = payments
      .filter(p => p.payment_status === 'completed')
      .reduce((s, p) => s + parseFloat(p.amount), 0);

    res.status(200).json({
      total:       count,
      page:        parseInt(page),
      limit:       parseInt(limit),
      pages:       Math.ceil(count / parseInt(limit)),
      total_spent: parseFloat(totalSpent.toFixed(2)),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET PAYMENT RECEIPT (enriched)
//  GET /api/payments/receipt/:booking_id
// ─────────────────────────────────────────────────────────────────────────────
exports.getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { booking_id: req.params.booking_id },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title', 'address', 'property_type'] },
          { model: User,     as: 'guest',    attributes: ['name', 'email'] },
        ],
      }],
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Guests may only see their own receipt
    if (
      req.user.role === 'guest' &&
      payment.booking?.guest_id !== req.user.user_id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      receipt: {
        receipt_number:    `SS-${String(payment.payment_id).padStart(6, '0')}`,
        payment_id:        payment.payment_id,
        booking_id:        payment.booking_id,
        guest:             payment.booking?.guest?.name,
        guest_email:       payment.booking?.guest?.email,
        property:          payment.booking?.property?.title,
        address:           payment.booking?.property?.address,
        property_type:     payment.booking?.property?.property_type,
        checkin_date:      payment.booking?.checkin_date,
        checkout_date:     payment.booking?.checkout_date,
        amount:            payment.amount,
        currency:          payment.currency,
        payment_method:    payment.payment_method,
        payment_status:    payment.payment_status,
        transaction_id:    payment.transaction_id,
        payment_date:      payment.payment_date,
        refunded_at:       payment.refunded_at,
        refund_tx_id:      payment.refund_transaction_id,
        issued_at:         new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ALL PAYMENTS (Accountant — with filters + pagination)
//  GET /api/payments?status=&method=&from=&to=&page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const { status, method, from, to, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.payment_status = status;
    if (method) where.payment_method = method;
    if (from || to) {
      where.payment_date = {};
      if (from) where.payment_date[Op.gte] = from;
      if (to)   where.payment_date[Op.lte] = to;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          include: [
            { 
              model: Property, as: 'property', attributes: ['title', 'address'],
              include: [{ model: User, as: 'host', attributes: ['name', 'email'] }]
            },
            { model: User,     as: 'guest',    attributes: ['name', 'email'] },
          ],
        },
        { model: Payout }
      ],
      order:  [['payment_id', 'DESC']],
      limit:  Math.min(parseInt(limit), 100),
      offset,
    });

    const totalRevenue = payments
      .filter(p => p.payment_status === 'completed')
      .reduce((s, p) => s + parseFloat(p.amount), 0);

    res.status(200).json({
      total:         count,
      page:          parseInt(page),
      limit:         parseInt(limit),
      pages:         Math.ceil(count / parseInt(limit)),
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GENERATE FINANCIAL REPORT  (Accountant)
//  GET /api/payments/report
// ─────────────────────────────────────────────────────────────────────────────
exports.generateReport = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property', attributes: ['title'] }],
      }],
    });

    const completed = payments.filter(p => p.payment_status === 'completed');
    const refunded  = payments.filter(p => p.payment_status === 'refunded');
    const failed    = payments.filter(p => p.payment_status === 'failed');
    const pending   = payments.filter(p => p.payment_status === 'pending');

    const totalRevenue  = completed.reduce((s, p) => s + parseFloat(p.amount), 0);
    const totalRefunded = refunded.reduce((s, p)  => s + parseFloat(p.amount), 0);
    const netRevenue    = totalRevenue - totalRefunded;

    const byMethod = {};
    payments.forEach(p => {
      const m = p.payment_method;
      if (!byMethod[m]) byMethod[m] = { count: 0, amount: 0 };
      byMethod[m].count  += 1;
      byMethod[m].amount += parseFloat(p.amount);
    });

    res.status(200).json({
      generated_at:    new Date(),
      total_payments:  payments.length,
      completed:       completed.length,
      refunded:        refunded.length,
      failed:          failed.length,
      pending:         pending.length,
      total_revenue:   parseFloat(totalRevenue.toFixed(2)),
      total_refunded:  parseFloat(totalRefunded.toFixed(2)),
      net_revenue:     parseFloat(netRevenue.toFixed(2)),
      by_method:       Object.entries(byMethod).reduce((acc, [k, v]) => {
        acc[k] = { ...v, amount: parseFloat(v.amount.toFixed(2)) };
        return acc;
      }, {}),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED HELPER — actions after a successful payment
// ─────────────────────────────────────────────────────────────────────────────
async function _postPaymentSuccess(payment, booking, guestUserId, req) {
  try {
    const guest = await User.findByPk(guestUserId);

    // Auto-generate payout for the host if not already exists
    if (booking && booking.property) {
      const { Payout } = require('../models/index');
      const { getPlatformSettings } = require('../utils/settings');
      const settings = await getPlatformSettings();
      
      const existingPayout = await Payout.findOne({ where: { booking_id: booking.booking_id } });
      if (!existingPayout) {
        const grossAmount = parseFloat(payment.amount);
        const commissionRate = parseFloat(settings.commissionRate || '10');
        let commissionAmount = parseFloat((grossAmount * commissionRate / 100).toFixed(2));
        if (commissionAmount < settings.minCommission) {
          commissionAmount = settings.minCommission;
        }
        const payoutAmount = parseFloat((grossAmount - commissionAmount).toFixed(2));

        await Payout.create({
          host_id: booking.property.host_id,
          payment_id: payment.payment_id,
          booking_id: booking.booking_id,
          gross_amount: grossAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          payout_amount: payoutAmount,
          currency: payment.currency || 'USD',
          status: 'pending',
        });
      }
    }

    // If the booking was 'approved' by the host, paying for it confirms it.
    if (booking && booking.status === 'approved') {
      await booking.update({ status: 'confirmed' });
    }

    // Email
    if (guest) {
      await sendEmail(
        guest.email,
        'Payment Successful - ShortStay',
        paymentSuccessEmail(guest.name, payment, booking)
      );
    }

    // In-app notification
    await notify(
      guestUserId,
      'Payment Successful 💳',
      `Your payment of $${payment.amount} for "${booking.property?.title}" (Booking #${booking.booking_id}) was processed successfully.`,
      'payment_successful',
      payment.payment_id
    );

    // Activity log
    if (req) {
      await logActivity({
        user_id:   guestUserId,
        action:    'PAYMENT_PROCESSED',
        entity:    'payment',
        entity_id: payment.payment_id,
        req,
        details:   { booking_id: booking.booking_id, amount: payment.amount },
      });
    }
  } catch (err) {
    console.error('[postPaymentSuccess] Error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  INLINE EMAIL TEMPLATE — refund confirmation
// ─────────────────────────────────────────────────────────────────────────────
function refundConfirmationEmail(name, amount, propertyTitle, reason) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #2c3e7a; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Refund Processed 💰</h3>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your refund has been successfully processed.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; border-left: 4px solid #27ae60;">
        <p><strong>Refund Amount:</strong> $${amount}</p>
        <p><strong>Property:</strong> ${propertyTitle || 'N/A'}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p style="margin-top: 20px; color: #666;">
        Please allow 5–10 business days for the refund to appear in your account depending on your bank.
      </p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PARTIAL REFUND (based on booking cancellation policy)
//  POST /api/payments/refund/:booking_id/partial
//  Body: { reason }
//  Refund % is determined by booking.refund_policy:
//    'full'        → 100%  |  'partial_50' → 50%  |  'no_refund' → 0%
// ─────────────────────────────────────────────────────────────────────────────
exports.partialRefund = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { reason }     = req.body;

    const payment = await Payment.findOne({
      where: { booking_id, payment_status: 'completed' },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title'] },
          { model: User,     as: 'guest',    attributes: ['name', 'email', 'user_id'] },
        ],
      }],
    });
    if (!payment) return res.status(404).json({ message: 'No completed payment found' });

    const policy = payment.booking?.refund_policy || 'no_refund';
    const policyMap = { full: 1.0, partial_50: 0.5, no_refund: 0.0 };
    const refundPct = policyMap[policy] ?? 0;

    if (refundPct === 0) {
      return res.status(400).json({ message: `No refund applicable under policy: ${policy}` });
    }

    const refundAmount = parseFloat((parseFloat(payment.amount) * refundPct).toFixed(2));

    let refundTransactionId = null;
    if (payment.payment_method === 'stripe' && payment.transaction_id) {
      try {
        const stripe = getStripe();
        const refund = await stripe.refunds.create({
          payment_intent: payment.transaction_id,
          amount: Math.round(refundAmount * 100), // cents
          reason: 'requested_by_customer',
        });
        refundTransactionId = refund.id;
      } catch (stripeErr) {
        console.error('[PartialRefund] Stripe error:', stripeErr.message);
      }
    }

    await payment.update({
      payment_status:        refundPct === 1.0 ? 'refunded' : 'refunded',
      refunded_at:           new Date(),
      refund_transaction_id: refundTransactionId,
      notes: `${policy} refund (${refundPct * 100}%): ${reason || 'cancellation'}`,
    });

    // Update booking refund_amount
    await payment.booking?.update({ refund_amount: refundAmount });

    const guest = payment.booking?.guest;
    if (guest) {
      await notify(
        guest.user_id,
        `Refund Processed 💰 (${refundPct * 100}%)`,
        `A refund of $${refundAmount} has been processed based on your cancellation policy (${policy}).`,
        'refund_processed',
        payment.payment_id
      );
      await sendEmail(
        guest.email,
        'Refund Processed - ShortStay',
        refundConfirmationEmail(guest.name, refundAmount, payment.booking?.property?.title, reason)
      );
    }

    res.status(200).json({
      message:        `Partial refund processed (${refundPct * 100}%)`,
      refund_amount:  refundAmount,
      policy,
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  RETRY FAILED PAYMENT
//  POST /api/payments/retry/:payment_id   (Guest only)
//  Creates a new Stripe PaymentIntent for the same booking
// ─────────────────────────────────────────────────────────────────────────────
exports.retryPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.payment_id, {
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property', attributes: ['title'] }],
      }],
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.booking?.guest_id !== req.user.user_id)
      return res.status(403).json({ message: 'Not authorized' });
    if (payment.payment_status !== 'failed')
      return res.status(400).json({ message: 'Only failed payments can be retried' });

    const stripe      = getStripe();
    const amountCents = Math.round(parseFloat(payment.amount) * 100);

    const intent = await stripe.paymentIntents.create({
      amount:      amountCents,
      currency:    (payment.currency || 'USD').toLowerCase(),
      metadata:    { booking_id: String(payment.booking_id), guest_id: String(req.user.user_id) },
      description: `Retry — ShortStay Booking #${payment.booking_id}`,
    });

    await payment.update({
      payment_status: 'pending',
      transaction_id: intent.id,
      client_secret:  intent.client_secret,
    });

    res.status(200).json({
      message:       'Payment retry initiated',
      client_secret: intent.client_secret,
      payment_id:    payment.payment_id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET FAILED / PENDING PAYMENTS (Accountant)
//  GET /api/payments/failed   |   GET /api/payments/pending
// ─────────────────────────────────────────────────────────────────────────────
exports.getFailedPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { payment_status: 'failed' },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title'] },
          { model: User,     as: 'guest',    attributes: ['name', 'email'] },
        ],
      }],
      order: [['payment_id', 'DESC']],
    });
    res.status(200).json({ total: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPendingPayments = async (req, res) => {
  try {
    const TIMEOUT_MINUTES = parseInt(process.env.PAYMENT_TIMEOUT_MINUTES || '30');
    const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

    const payments = await Payment.findAll({
      where: { payment_status: 'pending' },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title'] },
          { model: User,     as: 'guest',    attributes: ['name', 'email'] },
        ],
      }],
      order: [['payment_id', 'DESC']],
    });

    // Flag timed-out payments
    const withTimeout = payments.map(p => ({
      ...p.toJSON(),
      timed_out: p.payment_date && new Date(p.payment_date) < cutoff,
    }));

    res.status(200).json({ total: payments.length, timeout_minutes: TIMEOUT_MINUTES, payments: withTimeout });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DISPUTES
//  POST /api/payments/disputes            — raise dispute (Guest)
//  GET  /api/payments/disputes            — all disputes (Accountant)
//  PUT  /api/payments/disputes/:id/resolve — resolve dispute (Accountant)
// ─────────────────────────────────────────────────────────────────────────────
exports.raiseDispute = async (req, res) => {
  try {
    const { payment_id, reason } = req.body;

    const payment = await Payment.findByPk(payment_id, {
      include: [{ model: Booking }],
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.booking?.guest_id !== req.user.user_id)
      return res.status(403).json({ message: 'Not authorized' });

    const dispute = await Dispute.create({
      payment_id,
      raised_by: req.user.user_id,
      reason,
    });

    // Notify all admins & accountants
    const managers = await User.findAll({
      where: { role: ['admin', 'accountant'] },
    });
    await Promise.all(managers.map(m =>
      notify(m.user_id, 'New Payment Dispute 🚨',
        `Guest raised a dispute for Payment #${payment_id}. Reason: ${reason}`,
        'dispute_raised', dispute.dispute_id)
    ));

    await logActivity({
      user_id: req.user.user_id, action: 'DISPUTE_RAISED',
      entity: 'dispute', entity_id: dispute.dispute_id, req,
      details: { payment_id, reason },
    });

    res.status(201).json({ message: 'Dispute raised', dispute });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const disputes = await Dispute.findAll({
      where,
      include: [
        { model: Payment, include: [{ model: Booking, include: [{ model: Property, as: 'property', attributes: ['title'] }] }] },
        { model: User, as: 'raised_by_user', attributes: ['name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ total: disputes.length, disputes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { resolution } = req.body;
    const dispute = await Dispute.findByPk(req.params.id, {
      include: [{ model: User, as: 'raised_by_user', attributes: ['user_id', 'name', 'email'] }],
    });
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    await dispute.update({
      status:      'resolved',
      resolution,
      resolved_by: req.user.user_id,
      resolved_at: new Date(),
    });

    // Notify guest
    const guest = dispute.raised_by_user;
    if (guest) {
      await notify(guest.user_id, 'Dispute Resolved ✅',
        `Your payment dispute (#${dispute.dispute_id}) has been resolved. Resolution: ${resolution}`,
        'dispute_resolved', dispute.dispute_id);
    }

    await logActivity({
      user_id: req.user.user_id, action: 'DISPUTE_RESOLVED',
      entity: 'dispute', entity_id: dispute.dispute_id, req,
      details: { resolution },
    });

    res.status(200).json({ message: 'Dispute resolved', dispute });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};