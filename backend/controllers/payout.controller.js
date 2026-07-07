/**
 * payout.controller.js
 *
 * Handles host payout management with commission calculation.
 *
 * Platform commission: default 10% (configurable via PLATFORM_COMMISSION_RATE env var)
 *
 * Endpoints (all Accountant only unless noted):
 *   POST /api/payouts/generate/:booking_id  — create payout record for a booking
 *   POST /api/payouts/process/:payout_id    — mark payout as processed/sent
 *   GET  /api/payouts                       — all payouts (filterable)
 *   GET  /api/payouts/host/:host_id         — payouts for a specific host
 *   GET  /api/payouts/my-payouts            — host sees their own payouts
 *   GET  /api/payouts/summary               — commission + payout totals
 */

const { Payout, Payment, Booking, Property, User } = require('../models/index');
const { Op }       = require('sequelize');
const notify       = require('../utils/notify');
const sendEmail    = require('../utils/sendEmail');
const logActivity  = require('../utils/activityLogger');
const { getPlatformSettings } = require('../utils/settings');

// Platform commission rate (default 10%)
const COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '10');

// ─────────────────────────────────────────────────────────────────────────────
//  GENERATE PAYOUT RECORD FOR A BOOKING
//  POST /api/payouts/generate/:booking_id
//  Creates a pending payout after a guest payment clears.
// ─────────────────────────────────────────────────────────────────────────────
exports.generatePayout = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const settings = await getPlatformSettings();
    const commissionRate  = parseFloat(req.body.commission_rate || settings.commissionRate);

    // Find completed payment for this booking
    const payment = await Payment.findOne({
      where: { booking_id, payment_status: 'completed' },
    });
    if (!payment) {
      return res.status(404).json({ message: 'No completed payment found for this booking' });
    }

    // Prevent duplicate payout records
    const existingPayout = await Payout.findOne({ where: { booking_id } });
    if (existingPayout) {
      return res.status(400).json({ message: 'Payout already exists for this booking', payout: existingPayout });
    }

    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: Property, as: 'property', attributes: ['title', 'host_id'] }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const grossAmount      = parseFloat(payment.amount);
    let commissionAmount = parseFloat((grossAmount * commissionRate / 100).toFixed(2));
    
    // Apply minimum commission floor
    if (commissionAmount < settings.minCommission) {
      commissionAmount = settings.minCommission;
    }
    
    const payoutAmount     = parseFloat((grossAmount - commissionAmount).toFixed(2));
    const hostId           = booking.property?.host_id;

    const payout = await Payout.create({
      host_id:          hostId,
      payment_id:       payment.payment_id,
      booking_id:       parseInt(booking_id),
      gross_amount:     grossAmount,
      commission_rate:  commissionRate,
      commission_amount: commissionAmount,
      payout_amount:    payoutAmount,
      currency:         payment.currency || 'USD',
      status:           'pending',
    });

    await logActivity({
      user_id:   req.user.user_id,
      action:    'PAYOUT_GENERATED',
      entity:    'payout',
      entity_id: payout.payout_id,
      req,
      details:   { booking_id, gross_amount: grossAmount, payout_amount: payoutAmount, commission_rate: commissionRate },
    });

    res.status(201).json({ message: 'Payout record created', payout });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PROCESS (APPROVE + SEND) A PAYOUT
//  POST /api/payouts/process/:payout_id
//  Body: { notes }  — marks as completed + notifies host
// ─────────────────────────────────────────────────────────────────────────────
exports.processPayout = async (req, res) => {
  try {
    const { payout_id } = req.params;
    const { notes }     = req.body;

    const payout = await Payout.findByPk(payout_id, {
      include: [
        { model: User,    as: 'host',    attributes: ['user_id', 'name', 'email'] },
        { model: Booking, include: [{ model: Property, as: 'property', attributes: ['title'] }] },
      ],
    });
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    if (payout.status === 'completed') {
      return res.status(400).json({ message: 'Payout already processed' });
    }

    await payout.update({
      status:       'completed',
      processed_by: req.user.user_id,
      processed_at: new Date(),
      notes:        notes || null,
    });

    const host = payout.host;
    if (host) {
      // In-app notification
      await notify(
        host.user_id,
        'Payout Processed 💰',
        `Your payout of $${payout.payout_amount} for "${payout.booking?.property?.title}" has been processed.`,
        'payout_processed',
        payout.payout_id
      );

      // Email notification
      await sendEmail(
        host.email,
        'Payout Processed - ShortStay',
        payoutEmailTemplate(
          host.name,
          payout.payout_amount,
          payout.gross_amount,
          payout.commission_amount,
          payout.commission_rate,
          payout.booking?.property?.title,
          payout.currency
        )
      );
    }

    await logActivity({
      user_id:   req.user.user_id,
      action:    'PAYOUT_PROCESSED',
      entity:    'payout',
      entity_id: payout.payout_id,
      req,
      details:   { payout_amount: payout.payout_amount, host_id: payout.host_id },
    });

    res.status(200).json({ message: 'Payout processed', payout });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ALL PAYOUTS (Accountant — filterable + paginated)
//  GET /api/payouts?status=pending&from=2026-01-01&to=2026-12-31&page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllPayouts = async (req, res) => {
  try {
    const { status, from, to, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to)   where.created_at[Op.lte] = new Date(to + 'T23:59:59');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: payouts } = await Payout.findAndCountAll({
      where,
      include: [
        { model: User,    as: 'host',    attributes: ['name', 'email'] },
        { model: Booking, include: [{ model: Property, as: 'property', attributes: ['title'] }] },
      ],
      order:  [['created_at', 'DESC']],
      limit:  Math.min(parseInt(limit), 100),
      offset,
    });

    const totalPaidOut   = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.payout_amount), 0);
    const totalCommission = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.commission_amount), 0);

    res.status(200).json({
      total:             count,
      page:              parseInt(page),
      limit:             parseInt(limit),
      pages:             Math.ceil(count / parseInt(limit)),
      total_paid_out:    parseFloat(totalPaidOut.toFixed(2)),
      total_commission:  parseFloat(totalCommission.toFixed(2)),
      payouts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET PAYOUTS FOR A SPECIFIC HOST (Accountant)
//  GET /api/payouts/host/:host_id
// ─────────────────────────────────────────────────────────────────────────────
exports.getPayoutsByHost = async (req, res) => {
  try {
    const payouts = await Payout.findAll({
      where: { host_id: req.params.host_id },
      include: [
        { model: Booking, include: [{ model: Property, as: 'property', attributes: ['title'] }] },
      ],
      order: [['created_at', 'DESC']],
    });

    const total = payouts.reduce((s, p) => s + parseFloat(p.payout_amount), 0);

    res.status(200).json({
      host_id:     req.params.host_id,
      total_payouts: payouts.length,
      total_received: parseFloat(total.toFixed(2)),
      payouts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  HOST — VIEW OWN PAYOUTS
//  GET /api/payouts/my-payouts?status=&page=1&limit=10
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { host_id: req.user.user_id };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: payouts } = await Payout.findAndCountAll({
      where,
      include: [
        { model: Booking, include: [{ model: Property, as: 'property', attributes: ['title', 'address'] }] },
      ],
      order:  [['created_at', 'DESC']],
      limit:  Math.min(parseInt(limit), 50),
      offset,
    });

    const totalReceived = payouts
      .filter(p => p.status === 'completed')
      .reduce((s, p) => s + parseFloat(p.payout_amount), 0);

    res.status(200).json({
      total:          count,
      page:           parseInt(page),
      limit:          parseInt(limit),
      pages:          Math.ceil(count / parseInt(limit)),
      total_received: parseFloat(totalReceived.toFixed(2)),
      payouts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM COMMISSION SUMMARY (Accountant)
//  GET /api/payouts/summary?from=&to=
// ─────────────────────────────────────────────────────────────────────────────
exports.getCommissionSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = { status: 'completed' };
    if (from || to) {
      where.processed_at = {};
      if (from) where.processed_at[Op.gte] = new Date(from);
      if (to)   where.processed_at[Op.lte] = new Date(to + 'T23:59:59');
    }

    const payouts = await Payout.findAll({ where });

    const totalGross      = payouts.reduce((s, p) => s + parseFloat(p.gross_amount), 0);
    const totalCommission = payouts.reduce((s, p) => s + parseFloat(p.commission_amount), 0);
    const totalPaidOut    = payouts.reduce((s, p) => s + parseFloat(p.payout_amount), 0);

    res.status(200).json({
      generated_at:         new Date(),
      commission_rate:      `${COMMISSION_RATE}%`,
      total_payouts_processed: payouts.length,
      total_gross_collected:parseFloat(totalGross.toFixed(2)),
      total_commission:     parseFloat(totalCommission.toFixed(2)),
      total_paid_to_hosts:  parseFloat(totalPaidOut.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  INLINE EMAIL TEMPLATE — payout notification
// ─────────────────────────────────────────────────────────────────────────────
function payoutEmailTemplate(hostName, payoutAmount, grossAmount, commissionAmount, commissionRate, propertyTitle, currency) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
      <h2 style="color: white; margin: 0;">ShortStay — Payout Processed</h2>
    </div>
    <div style="background: #f8f8f8; padding: 20px;">
      <h3>Your Payout Has Been Sent 💰</h3>
      <p>Dear <strong>${hostName}</strong>,</p>
      <p>Great news! Your payout for the following booking has been processed.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
        <p><strong>Property:</strong> ${propertyTitle || 'N/A'}</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p><strong>Gross Booking Amount:</strong> ${currency} ${grossAmount}</p>
        <p style="color: #e74c3c;"><strong>Platform Commission (${commissionRate}%):</strong> - ${currency} ${commissionAmount}</p>
        <p style="color: #27ae60; font-size: 18px;"><strong>Net Payout to You:</strong> ${currency} ${payoutAmount}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">
        Please allow 2–5 business days for the funds to appear in your bank account.
      </p>
    </div>
    <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay. All rights reserved.</p>
    </div>
  </div>`;
}
