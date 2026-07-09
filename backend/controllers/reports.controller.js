/**
 * reports.controller.js
 *
 * Handles all granular report endpoints:
 *  Admin:          booking report, user registration report, property approval report,
 *                  complaint resolution report, date-range filtering, CSV export
 *  Payment Mgr:    monthly revenue, revenue by property/date, refunds, host payouts, CSV export
 *  Verifier: inspection report by date, success rate, approved vs rejected
 *
 * CSV generation uses a tiny inline helper — no extra dependency needed.
 */

const {
  User, Property, Booking, Payment,
  Complaint, Inspection, Review, ActivityLog,
} = require('../models/index');
const { Op } = require('sequelize');

// ─── Helper: build WHERE with optional date range ────────────────────────────
function dateWhere(field, from, to) {
  if (!from && !to) return {};
  const cond = {};
  if (from) cond[Op.gte] = new Date(from);
  if (to)   cond[Op.lte] = new Date(`${to}T23:59:59`);
  return { [field]: cond };
}

// ─── Helper: convert array of objects to CSV string ─────────────────────────
function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines   = [headers.join(',')];
  rows.forEach(row => {
    lines.push(
      headers.map(h => {
        const v = row[h] ?? '';
        const s = String(v).replace(/"/g, '""');
        return /[,"\n]/.test(s) ? `"${s}"` : s;
      }).join(',')
    );
  });
  return lines.join('\n');
}

// ─── Helper: send as CSV or JSON ────────────────────────────────────────────
function sendReport(req, res, filename, data, extraMeta = {}) {
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(toCSV(Array.isArray(data) ? data : [data]));
  }
  res.status(200).json({ generated_at: new Date(), ...extraMeta, data });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/reports/bookings?from=&to=&format=csv
exports.bookingReport = async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const where = {
      ...dateWhere('createdAt', from, to),
      ...(status ? { status } : {}),
    };

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Property, as: 'property', attributes: ['title', 'address'] },
        { model: User,     as: 'guest',    attributes: ['name', 'email'] },
        { model: Payment },
      ],
      order: [['booking_id', 'DESC']],
    });

    const flat = bookings.map(b => ({
      booking_id:    b.booking_id,
      guest:         b.guest?.name,
      guest_email:   b.guest?.email,
      property:      b.property?.title,
      address:       b.property?.address,
      checkin_date:  b.checkin_date,
      checkout_date: b.checkout_date,
      total_price:   b.total_price,
      status:        b.status,
      paid:          b.payment ? 'Yes' : 'No',
      created_at:    b.createdAt,
    }));

    const summary = {
      total:     bookings.length,
      pending:   bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      expired:   bookings.filter(b => b.status === 'expired').length,
    };

    sendReport(req, res, 'booking_report', flat, { summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/reports/users?from=&to=&role=&format=csv
exports.userRegistrationReport = async (req, res) => {
  try {
    const { from, to, role } = req.query;
    const where = {
      ...dateWhere('createdAt', from, to),
      ...(role ? { role } : {}),
    };

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password', 'reset_token', 'verification_token'] },
      order: [['user_id', 'DESC']],
    });

    const flat = users.map(u => ({
      user_id:          u.user_id,
      name:             u.name,
      email:            u.email,
      role:             u.role,
      membership_level: u.membership_level,
      is_verified:      u.is_verified,
      is_suspended:     u.is_suspended,
      auth_provider:    u.auth_provider,
    }));

    const summary = {
      total:     users.length,
      guests:    users.filter(u => u.role === 'guest').length,
      hosts:     users.filter(u => u.role === 'host').length,
      suspended: users.filter(u => u.is_suspended).length,
    };

    sendReport(req, res, 'user_registration_report', flat, { summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/reports/properties?from=&to=&is_approved=&format=csv
exports.propertyApprovalReport = async (req, res) => {
  try {
    const { from, to, is_approved } = req.query;
    const where = {
      ...dateWhere('createdAt', from, to),
    };
    if (is_approved !== undefined) where.is_approved = is_approved === 'true';

    const properties = await Property.findAll({
      where,
      include: [{ model: User, as: 'host', attributes: ['name', 'email'] }],
      order: [['property_id', 'DESC']],
    });

    const flat = properties.map(p => ({
      property_id:        p.property_id,
      title:              p.title,
      address:            p.address,
      host:               p.host?.name,
      host_email:         p.host?.email,
      property_type:      p.property_type,
      price_per_night:    p.price_per_night,
      is_approved:        p.is_approved,
      verification_badge: p.verification_badge,
      verification_status: p.verification_status,
      overall_score:      p.overall_score,
    }));

    const summary = {
      total:    properties.length,
      approved: properties.filter(p =>  p.is_approved).length,
      pending:  properties.filter(p => !p.is_approved).length,
      verified: properties.filter(p =>  p.verification_badge).length,
    };

    sendReport(req, res, 'property_approval_report', flat, { summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/reports/complaints?from=&to=&status=&format=csv
exports.complaintResolutionReport = async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const where = {
      ...dateWhere('createdAt', from, to),
      ...(status ? { status } : {}),
    };

    const complaints = await Complaint.findAll({
      where,
      include: [{
        model: Booking,
        include: [{ model: User, as: 'guest', attributes: ['name', 'email'] }],
      }],
      order: [['complaint_id', 'DESC']],
    });

    const flat = complaints.map(c => ({
      complaint_id: c.complaint_id,
      guest:        c.booking?.guest?.name,
      guest_email:  c.booking?.guest?.email,
      booking_id:   c.booking_id,
      description:  c.description,
      priority:     c.priority,
      status:       c.status,
    }));

    const summary = {
      total:       complaints.length,
      open:        complaints.filter(c => c.status === 'open').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      resolved:    complaints.filter(c => c.status === 'resolved').length,
      closed:      complaints.filter(c => c.status === 'closed').length,
    };

    sendReport(req, res, 'complaint_resolution_report', flat, { summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/reports/activity?from=&to=&action=&user_id=&page=1&limit=50&format=csv
exports.activityLogReport = async (req, res) => {
  try {
    const { from, to, action, user_id, page = 1, limit = 50 } = req.query;
    const where = {
      ...dateWhere('created_at', from, to),
      ...(action  ? { action } : {}),
      ...(user_id ? { user_id } : {}),
    };

    const offset  = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: logs } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['name', 'email', 'role'] }],
      order: [['log_id', 'DESC']],
      limit:  Math.min(parseInt(limit), 200),
      offset,
    });

    const summary = {};
    logs.forEach(l => { summary[l.action] = (summary[l.action] || 0) + 1; });

    const flat = logs.map(l => ({
      log_id:     l.log_id,
      user:       l.user?.name,
      email:      l.user?.email,
      role:       l.user?.role,
      action:     l.action,
      entity:     l.entity,
      entity_id:  l.entity_id,
      ip_address: l.ip_address,
      details:    l.details,
      created_at: l.created_at,
    }));

    sendReport(req, res, 'activity_log_report', flat, {
      total: count,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit)),
      action_summary: summary,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PAYMENT MANAGER REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/payments/reports/monthly?year=2026&format=csv
exports.monthlyRevenueReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property', attributes: ['title', 'property_id'] }],
      }],
    });

    const monthly = {};
    for (let m = 1; m <= 12; m++) {
      monthly[m] = { month: m, year, payments: 0, revenue: 0 };
    }

    payments.forEach(p => {
      if (!p.payment_date) return;
      const d = new Date(p.payment_date);
      if (d.getFullYear() !== year) return;
      const m = d.getMonth() + 1;
      monthly[m].payments += 1;
      monthly[m].revenue  += parseFloat(p.amount);
    });

    const rows = Object.values(monthly).map(r => ({
      ...r,
      revenue: parseFloat(r.revenue.toFixed(2)),
    }));

    sendReport(req, res, `monthly_revenue_${year}`, rows, {
      year,
      total_revenue: parseFloat(rows.reduce((s, r) => s + r.revenue, 0).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/payments/reports/by-property?format=csv
exports.revenueByPropertyReport = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property', attributes: ['title', 'property_id', 'address'] }],
      }],
    });

    const byProp = {};
    payments.forEach(p => {
      if (!p.booking?.property) return;
      const pid = p.booking.property.property_id;
      if (!byProp[pid]) {
        byProp[pid] = {
          property_id: pid,
          title:       p.booking.property.title,
          address:     p.booking.property.address,
          payments:    0,
          revenue:     0,
        };
      }
      byProp[pid].payments += 1;
      byProp[pid].revenue  += parseFloat(p.amount);
    });

    const rows = Object.values(byProp)
      .map(r => ({ ...r, revenue: parseFloat(r.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue);

    sendReport(req, res, 'revenue_by_property', rows, {
      total_properties: rows.length,
      total_revenue: parseFloat(rows.reduce((s, r) => s + r.revenue, 0).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/payments/reports/by-date?from=&to=&format=csv
exports.revenueByDateReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = dateWhere('payment_date', from, to);

    const payments = await Payment.findAll({
      where,
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title'] },
          { model: User,     as: 'guest',    attributes: ['name'] },
        ],
      }],
      order: [['payment_date', 'DESC']],
    });

    const flat = payments.map(p => ({
      payment_id:    p.payment_id,
      booking_id:    p.booking_id,
      guest:         p.booking?.guest?.name,
      property:      p.booking?.property?.title,
      amount:        p.amount,
      payment_date:  p.payment_date,
    }));

    sendReport(req, res, 'revenue_by_date', flat, {
      total_payments: flat.length,
      total_revenue: parseFloat(payments.reduce((s, p) => s + parseFloat(p.amount), 0).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/payments/reports/refunds?from=&to=&format=csv
exports.refundsReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {
      status: 'cancelled',
      refund_amount: { [Op.gt]: 0 },
      ...dateWhere('updatedAt', from, to),
    };

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Property, as: 'property', attributes: ['title'] },
        { model: User,     as: 'guest',    attributes: ['name', 'email'] },
      ],
      order: [['booking_id', 'DESC']],
    });

    const flat = bookings.map(b => ({
      booking_id:    b.booking_id,
      guest:         b.guest?.name,
      guest_email:   b.guest?.email,
      property:      b.property?.title,
      total_price:   b.total_price,
      refund_amount: b.refund_amount,
      refund_policy: b.refund_policy,
      checkin_date:  b.checkin_date,
    }));

    const totalRefunds = bookings.reduce((s, b) => s + parseFloat(b.refund_amount || 0), 0);

    sendReport(req, res, 'refunds_report', flat, {
      total_refunds: flat.length,
      total_refund_amount: parseFloat(totalRefunds.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/payments/reports/host-payouts?format=csv
exports.hostPayoutsReport = async (req, res) => {
  try {
    // Confirmed and completed bookings that have been paid (payment exists)
    const paidBookings = await Booking.findAll({
      where: { status: { [Op.in]: ['confirmed', 'completed'] } },
      include: [
        { model: Payment },
        { model: Property, as: 'property', include: [{ model: User, as: 'host', attributes: ['name', 'email'] }] },
      ],
    });

    const paid    = paidBookings.filter(b =>  b.payment);
    const pending = paidBookings.filter(b => !b.payment);

    const payoutByHost = {};
    paid.forEach(b => {
      const hid = b.property?.host_id;
      if (!hid) return;
      if (!payoutByHost[hid]) {
        payoutByHost[hid] = {
          host_id:        hid,
          host_name:      b.property?.host?.name,
          host_email:     b.property?.host?.email,
          booking_count:  0,
          total_earnings: 0,
        };
      }
      payoutByHost[hid].booking_count   += 1;
      payoutByHost[hid].total_earnings  += parseFloat(b.payment?.amount || 0);
    });

    // Sort by earnings descending
    const rows = Object.values(payoutByHost)
      .map(r => ({
        ...r,
        total_earnings: parseFloat(r.total_earnings.toFixed(2)),
      }))
      .sort((a, b) => b.total_earnings - a.total_earnings);

    sendReport(req, res, 'host_payouts_report', rows, {
      total_hosts:          rows.length,
      total_amount:         parseFloat(rows.reduce((s, r) => s + r.total_earnings, 0).toFixed(2)),
      pending_payout_count: pending.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  FIELD INSPECTOR REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/inspector/reports/inspections?from=&to=&format=csv
exports.inspectionByDateReport = async (req, res) => {
  try {
    const inspector_id = req.user.user_id;
    const { from, to } = req.query;
    const where = {
      inspector_id,
      ...dateWhere('completed_date', from, to),
    };

    const inspections = await Inspection.findAll({
      where,
      include: [{
        model: Property,
        attributes: ['title', 'address', 'verification_status', 'verification_badge'],
      }],
      order: [['inspection_id', 'DESC']],
    });

    const flat = inspections.map(i => ({
      inspection_id:      i.inspection_id,
      property:           i.property?.title,
      address:            i.property?.address,
      status:             i.status,
      recommendation:     i.recommendation,
      score:              i.score,
      notes:              i.notes,
      completed_date:     i.completed_date,
      verification_badge: i.property?.verification_badge,
    }));

    sendReport(req, res, 'inspection_report', flat, {
      total:     flat.length,
      completed: flat.filter(i => i.status === 'completed').length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/inspector/reports/success-rate
exports.inspectionSuccessRateReport = async (req, res) => {
  try {
    const inspector_id = req.user.user_id;

    const inspections = await Inspection.findAll({
      where: { inspector_id },
      include: [{
        model: Property,
        attributes: ['verification_status', 'verification_badge'],
      }],
    });

    const total     = inspections.length;
    const completed = inspections.filter(i => i.status === 'completed').length;
    const approved  = inspections.filter(i => i.property?.verification_badge === true).length;
    const rejected  = inspections.filter(i => i.property?.verification_status === 'rejected').length;
    const rate      = completed > 0 ? parseFloat(((approved / completed) * 100).toFixed(1)) : null;

    res.status(200).json({
      generated_at: new Date(),
      total_assigned:   total,
      total_completed:  completed,
      total_approved:   approved,
      total_rejected:   rejected,
      success_rate_pct: rate,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/inspector/reports/approved-vs-rejected?format=csv
exports.approvedVsRejectedReport = async (req, res) => {
  try {
    const inspector_id = req.user.user_id;

    const inspections = await Inspection.findAll({
      where: { inspector_id, status: 'completed' },
      include: [{
        model: Property,
        attributes: ['title', 'address', 'verification_status', 'verification_badge'],
      }],
      order: [['inspection_id', 'DESC']],
    });

    const approved = inspections.filter(i => i.property?.verification_badge === true);
    const rejected = inspections.filter(i => i.property?.verification_status === 'rejected');

    const flatApproved = approved.map(i => ({
      inspection_id: i.inspection_id,
      property:      i.property?.title,
      address:       i.property?.address,
      outcome:       'approved',
      completed_date: i.completed_date,
    }));
    const flatRejected = rejected.map(i => ({
      inspection_id: i.inspection_id,
      property:      i.property?.title,
      address:       i.property?.address,
      outcome:       'rejected',
      completed_date: i.completed_date,
    }));

    const all = [...flatApproved, ...flatRejected];

    sendReport(req, res, 'approved_vs_rejected', all, {
      total_completed: inspections.length,
      approved:        approved.length,
      rejected:        rejected.length,
      approval_rate:   inspections.length > 0
        ? parseFloat(((approved.length / inspections.length) * 100).toFixed(1))
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
