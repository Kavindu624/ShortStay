const { Payment, Booking, Property, User } = require('../models/index');
const sendEmail = require('../utils/sendEmail');
const { paymentSuccessEmail } = require('../utils/emailTemplates');
const logActivity = require('../utils/activityLogger');
const notify = require('../utils/notify');

// PROCESS PAYMENT (Guest only)
exports.processPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;

    // Check booking exists
    const booking = await Booking.findByPk(booking_id, {
      include: [
        { model: Property, as: 'property', attributes: ['title', 'address'] },
      ]
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure the guest owns this booking
    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Booking must be confirmed (approved by host) before payment
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        message: 'Payment can only be made for confirmed (host-approved) bookings',
      });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({ where: { booking_id } });
    if (existingPayment) {
      return res.status(400).json({ message: 'Already paid for this booking' });
    }

    // Create payment record
    const payment = await Payment.create({
      booking_id,
      amount: booking.total_price,
      payment_date: new Date(),
    });

    // Send payment success email to guest
    const guest = await User.findByPk(req.user.user_id);
    await sendEmail(
      guest.email,
      'Payment Successful - ShortStay',
      paymentSuccessEmail(guest.name, payment, booking)
    );

    // In-app notification for guest
    await notify(
      req.user.user_id,
      'Payment Successful 💳',
      `Your payment of $${payment.amount} for "${booking.property?.title}" (Booking #${booking_id}) was processed successfully.`,
      'payment_successful',
      payment.payment_id
    );

    // Log payment activity
    await logActivity({
      user_id:   req.user.user_id,
      action:    'PAYMENT_PROCESSED',
      entity:    'payment',
      entity_id: payment.payment_id,
      req,
      details:   { booking_id, amount: payment.amount },
    });

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL PAYMENTS (Payment Manager only)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title', 'address'] },
          { model: User, as: 'guest', attributes: ['name', 'email'] },
        ]
      }]
    });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE PAYMENT RECEIPT
exports.getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { booking_id: req.params.booking_id },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title', 'address'] },
          { model: User, as: 'guest', attributes: ['name', 'email'] },
        ]
      }]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GENERATE FINANCIAL REPORT (Payment Manager only)
exports.generateReport = async (req, res) => {
  try {
    const payments = await Payment.findAll();

    const totalRevenue = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    res.status(200).json({
      total_payments: payments.length,
      total_revenue: totalRevenue.toFixed(2),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};