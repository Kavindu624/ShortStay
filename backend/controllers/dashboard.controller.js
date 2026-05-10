const {
  User, Property, Booking, Payment,
  Review, Complaint, Inspection, Notification,
} = require('../models/index');
const { Op } = require('sequelize');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const startOfLastMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
};

const endOfLastMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59);
};

// ═══════════════════════════════════════════════════════════════════════════════
// GUEST DASHBOARD  GET /api/dashboard/guest
// ═══════════════════════════════════════════════════════════════════════════════
exports.guestDashboard = async (req, res) => {
  try {
    const guest_id = req.user.user_id;
    const today    = new Date().toISOString().split('T')[0];

    const [allBookings, reviews, complaints, unreadNotifications, guest] = await Promise.all([
      Booking.findAll({
        where: { guest_id },
        include: [
          { model: Property, as: 'property', attributes: ['title', 'address', 'image'] },
          { model: Payment },
        ],
        order: [['booking_id', 'DESC']],
      }),
      Review.findAll({
        include: [{
          model: Booking,
          where: { guest_id },
          required: true,
          include: [{ model: Property, as: 'property', attributes: ['title'] }],
        }],
        order: [['review_id', 'DESC']],
        limit: 5,
      }),
      Complaint.findAll({
        include: [{
          model: Booking,
          where: { guest_id },
          required: true,
        }],
        order: [['complaint_id', 'DESC']],
        limit: 5,
      }),
      Notification.count({ where: { user_id: guest_id, is_read: false } }),
      User.findByPk(guest_id, { attributes: ['name', 'membership_level'] }),
    ]);

    const totalSpent = allBookings.reduce((sum, b) =>
      b.payment ? sum + parseFloat(b.payment.amount) : sum, 0
    );

    // Upcoming bookings: confirmed + checkin_date >= today
    const upcomingBookings = allBookings
      .filter(b => b.status === 'confirmed' && b.checkin_date >= today)
      .slice(0, 5);

    res.status(200).json({
      membership_level: guest.membership_level,
      booking_stats: {
        total:     allBookings.length,
        pending:   allBookings.filter(b => b.status === 'pending').length,
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      },
      total_spent:          parseFloat(totalSpent.toFixed(2)),
      total_reviews:        reviews.length,
      unread_notifications: unreadNotifications,
      upcoming_bookings:    upcomingBookings,        // ← NEW
      recent_bookings:      allBookings.slice(0, 5),
      recent_reviews:       reviews,                 // ← NEW
      recent_complaints:    complaints,              // ← NEW
      // Note: wishlist/saved requires a separate Wishlist model & table.
      // Add: POST /api/wishlist, GET /api/wishlist, DELETE /api/wishlist/:id
      wishlist_count: 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOST DASHBOARD  GET /api/dashboard/host
// ═══════════════════════════════════════════════════════════════════════════════
exports.hostDashboard = async (req, res) => {
  try {
    const host_id = req.user.user_id;

    const [properties, allBookings, payments, unreadNotifications] = await Promise.all([
      Property.findAll({
        where: { host_id },
        include: [{ model: Review }],
      }),
      Booking.findAll({
        include: [{
          model: Property, as: 'property',
          where: { host_id },
          attributes: ['title', 'address', 'property_id'],
        }, {
          model: User, as: 'guest', attributes: ['name'],
        }],
        order: [['booking_id', 'DESC']],
      }),
      Payment.findAll({
        include: [{
          model: Booking,
          include: [{ model: Property, as: 'property', where: { host_id }, required: true }],
        }],
        order: [['payment_id', 'DESC']],
      }),
      Notification.count({ where: { user_id: host_id, is_read: false } }),
    ]);

    const propertyIds   = properties.map(p => p.property_id);
    const allReviews    = properties.flatMap(p => p.reviews || []);
    const totalEarnings = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const avgRating     = allReviews.length > 0
      ? parseFloat((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(2))
      : null;

    // Monthly earnings chart data (last 6 months)
    const monthlyEarnings = {};
    payments.forEach(p => {
      if (!p.payment_date) return;
      const key = new Date(p.payment_date).toLocaleString('default', {
        month: 'short', year: 'numeric',
      });
      monthlyEarnings[key] = parseFloat(
        ((monthlyEarnings[key] || 0) + parseFloat(p.amount)).toFixed(2)
      );
    });

    // Top performing property by earnings
    const earningsByProperty = {};
    payments.forEach(p => {
      if (!p.booking?.property) return;
      const pid   = p.booking.property.property_id;
      const title = p.booking.property.title;
      if (!earningsByProperty[pid]) earningsByProperty[pid] = { property_id: pid, title, total: 0, bookings: 0 };
      earningsByProperty[pid].total    += parseFloat(p.amount);
      earningsByProperty[pid].bookings += 1;
    });
    const topProperty = Object.values(earningsByProperty)
      .sort((a, b) => b.total - a.total)[0] || null;

    // Recent reviews received across all host properties
    const recentReviews = await Review.findAll({
      where: { property_id: { [Op.in]: propertyIds } },
      include: [{
        model: Booking,
        include: [{ model: User, as: 'guest', attributes: ['name'] }],
      }],
      order: [['review_id', 'DESC']],
      limit: 5,
    });

    // Verification request status for host's properties
    const verificationStatus = properties
      .filter(p => p.verification_requested || p.verification_badge)
      .map(p => ({
        property_id:         p.property_id,
        title:               p.title,
        verification_status: p.verification_status,
        verification_badge:  p.verification_badge,
      }));

    res.status(200).json({
      property_stats: {
        total:    properties.length,
        approved: properties.filter(p =>  p.is_approved).length,
        pending:  properties.filter(p => !p.is_approved).length,
        verified: properties.filter(p =>  p.verification_badge).length,
      },
      booking_stats: {
        total:     allBookings.length,
        pending:   allBookings.filter(b => b.status === 'pending').length,   // ← pending_requests_count
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      },
      pending_booking_requests: allBookings.filter(b => b.status === 'pending').length, // ← NEW explicit field
      unread_notifications:     unreadNotifications,   // ← NEW
      total_earnings:           parseFloat(totalEarnings.toFixed(2)),
      average_rating:           avgRating,
      total_reviews:            allReviews.length,
      monthly_earnings_chart:   monthlyEarnings,       // ← NEW
      top_performing_property:  topProperty,           // ← NEW
      recent_bookings:          allBookings.slice(0, 5),
      recent_reviews:           recentReviews,         // ← NEW
      recent_properties:        properties.slice(0, 5).map(p => ({
        property_id:        p.property_id,
        title:              p.title,
        is_approved:        p.is_approved,
        verification_badge: p.verification_badge,
        overall_score:      p.overall_score,
      })),
      verification_request_status: verificationStatus, // ← NEW
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD  GET /api/dashboard/admin
// ═══════════════════════════════════════════════════════════════════════════════
exports.adminDashboard = async (req, res) => {
  try {
    const [
      totalUsers, guests, hosts, suspendedUsers, staff,
      totalProperties, approvedProperties, pendingProperties, pendingVerification,
      totalBookings, pendingBookings, confirmedBookings, cancelledBookings,
      allPayments,
      totalComplaints, openComplaints, resolvedComplaints,
      totalReviews,
      recentBookings, recentComplaints,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'guest' } }),
      User.count({ where: { role: 'host' } }),
      User.count({ where: { is_suspended: true } }),                    // ← NEW
      User.count({ where: { role: { [Op.notIn]: ['guest', 'host'] } } }),

      Property.count(),
      Property.count({ where: { is_approved: true } }),
      Property.count({ where: { is_approved: false } }),               // ← NEW explicit
      Property.count({ where: { verification_requested: true, verification_badge: false } }), // ← NEW

      Booking.count(),
      Booking.count({ where: { status: 'pending' } }),
      Booking.count({ where: { status: 'confirmed' } }),
      Booking.count({ where: { status: 'cancelled' } }),

      Payment.findAll(),

      Complaint.count(),
      Complaint.count({ where: { status: 'open' } }),
      Complaint.count({ where: { status: 'resolved' } }),

      Review.count(),

      Booking.findAll({
        include: [
          { model: Property, as: 'property', attributes: ['title'] },
          { model: User,     as: 'guest',    attributes: ['name'] },
        ],
        order: [['booking_id', 'DESC']],
        limit: 5,
      }),
      Complaint.findAll({
        include: [{
          model: Booking,
          include: [{ model: User, as: 'guest', attributes: ['name'] }],
        }],
        order: [['complaint_id', 'DESC']],
        limit: 5,
      }),
    ]);

    const totalRevenue     = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const thisMonthStart   = startOfMonth();
    const lastMonthStart   = startOfLastMonth();
    const lastMonthEnd     = endOfLastMonth();
    const thisMonthRevenue = allPayments
      .filter(p => p.payment_date && new Date(p.payment_date) >= thisMonthStart)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const lastMonthRevenue = allPayments
      .filter(p => p.payment_date &&
        new Date(p.payment_date) >= lastMonthStart &&
        new Date(p.payment_date) <= lastMonthEnd)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Recent activity log — last 10 notifications across all users (system-level)
    const recentActivity = await Notification.findAll({
      include: [{ model: User, attributes: ['name', 'role'] }],
      order: [['notification_id', 'DESC']],
      limit: 10,
    });

    res.status(200).json({
      user_stats: {
        total:     totalUsers,
        guests,
        hosts,
        staff,
        suspended: suspendedUsers,                     // ← NEW
      },
      property_stats: {
        total:                      totalProperties,
        approved:                   approvedProperties,
        pending_approvals:          pendingProperties, // ← NEW
        pending_verification:       pendingVerification, // ← NEW
      },
      booking_stats: {
        total:     totalBookings,
        pending:   pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
      payment_stats: {
        total_payments: allPayments.length,
        total_revenue:  parseFloat(totalRevenue.toFixed(2)),
      },
      complaint_stats: {
        total:    totalComplaints,
        open:     openComplaints,
        resolved: resolvedComplaints,
      },
      review_stats: { total: totalReviews },
      revenue_summary: {                               // ← NEW
        total_revenue:      parseFloat(totalRevenue.toFixed(2)),
        this_month_revenue: parseFloat(thisMonthRevenue.toFixed(2)),
        last_month_revenue: parseFloat(lastMonthRevenue.toFixed(2)),
      },
      system_health: {                                 // ← NEW
        total_users:      totalUsers,
        active_bookings:  confirmedBookings,
        open_complaints:  openComplaints,
        pending_approvals: pendingProperties,
      },
      recent_activity_logs: recentActivity,            // ← NEW
      recent_bookings:      recentBookings,
      recent_complaints:    recentComplaints,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT MANAGER DASHBOARD  GET /api/dashboard/payment-manager
// ═══════════════════════════════════════════════════════════════════════════════
exports.paymentManagerDashboard = async (req, res) => {
  try {
    const allPayments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title', 'property_id', 'host_id'] },
          { model: User,     as: 'guest',    attributes: ['name', 'email'] },
        ],
      }],
      order: [['payment_id', 'DESC']],
    });

    // All confirmed bookings without a payment record = pending payouts
    const confirmedBookingsWithoutPayment = await Booking.findAll({
      where: { status: 'confirmed' },
      include: [
        { model: Payment },
        { model: Property, as: 'property', attributes: ['title', 'host_id'] },
        { model: User, as: 'guest', attributes: ['name'] },
      ],
    });
    const pendingPayouts = confirmedBookingsWithoutPayment.filter(b => !b.payment);

    // Refunds: bookings that are cancelled and have a refund_amount
    const refundedBookings = await Booking.findAll({
      where: {
        status: 'cancelled',
        refund_amount: { [Op.gt]: 0 },
      },
      include: [
        { model: Property, as: 'property', attributes: ['title'] },
        { model: User, as: 'guest', attributes: ['name'] },
      ],
    });
    const totalRefundAmount = refundedBookings.reduce(
      (sum, b) => sum + parseFloat(b.refund_amount || 0), 0
    );

    const totalRevenue  = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const thisMonthStart = startOfMonth();
    const lastMonthStart = startOfLastMonth();
    const lastMonthEnd   = endOfLastMonth();

    const thisMonthPayments = allPayments.filter(p =>
      p.payment_date && new Date(p.payment_date) >= thisMonthStart
    );
    const lastMonthPayments = allPayments.filter(p =>
      p.payment_date &&
      new Date(p.payment_date) >= lastMonthStart &&
      new Date(p.payment_date) <= lastMonthEnd
    );
    const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Monthly breakdown chart
    const monthlyBreakdown = {};
    allPayments.forEach(p => {
      if (!p.payment_date) return;
      const key = new Date(p.payment_date).toLocaleString('default', {
        month: 'long', year: 'numeric',
      });
      monthlyBreakdown[key] = parseFloat(
        ((monthlyBreakdown[key] || 0) + parseFloat(p.amount)).toFixed(2)
      );
    });

    // Top earning properties
    const propertyEarnings = {};
    allPayments.forEach(p => {
      if (!p.booking?.property) return;
      const pid = p.booking.property.property_id;
      if (!propertyEarnings[pid]) {
        propertyEarnings[pid] = {
          property_id: pid,
          title:       p.booking.property.title,
          host_id:     p.booking.property.host_id,
          total:       0,
          count:       0,
        };
      }
      propertyEarnings[pid].total += parseFloat(p.amount);
      propertyEarnings[pid].count += 1;
    });
    const topProperties = Object.values(propertyEarnings)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(p => ({ ...p, total: parseFloat(p.total.toFixed(2)) }));

    res.status(200).json({
      payment_stats: {
        total_payments: allPayments.length,
        total_revenue:  parseFloat(totalRevenue.toFixed(2)),
        failed_transactions: 0, // Payment model has no status field; all records = successful
      },
      revenue_stats: {
        this_month_revenue:   parseFloat(thisMonthRevenue.toFixed(2)),
        this_month_payments:  thisMonthPayments.length,
        last_month_revenue:   parseFloat(lastMonthRevenue.toFixed(2)),   // ← NEW
        last_month_payments:  lastMonthPayments.length,
        revenue_change_pct:   lastMonthRevenue > 0
          ? parseFloat((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
          : null,
        monthly_breakdown:    monthlyBreakdown,
      },
      pending_payouts: {                                                  // ← NEW
        count:    pendingPayouts.length,
        bookings: pendingPayouts.slice(0, 10),
      },
      refunds: {                                                          // ← NEW
        count:         refundedBookings.length,
        total_amount:  parseFloat(totalRefundAmount.toFixed(2)),
        bookings:      refundedBookings.slice(0, 10),
      },
      top_earning_properties: topProperties,                             // ← NEW
      recent_payments:        allPayments.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD INSPECTOR DASHBOARD  GET /api/dashboard/inspector
// ═══════════════════════════════════════════════════════════════════════════════
exports.inspectorDashboard = async (req, res) => {
  try {
    const inspector_id = req.user.user_id;

    const [allInspections, pendingProperties, unreadNotifications] = await Promise.all([
      Inspection.findAll({
        where: { inspector_id },
        include: [{
          model: Property,
          attributes: ['title', 'address', 'verification_status', 'verification_badge'],
        }],
        order: [['inspection_id', 'DESC']],
      }),
      Property.findAll({
        where: {
          verification_requested: true,
          verification_status:    { [Op.in]: ['requested', 'inspecting'] },
          verification_badge:     false,
        },
        attributes: ['property_id', 'title', 'address', 'verification_status'],
        order: [['property_id', 'DESC']],
        limit: 10,
      }),
      Notification.count({ where: { user_id: inspector_id, is_read: false } }),
    ]);

    const completed  = allInspections.filter(i => i.status === 'completed');
    const scheduled  = allInspections.filter(i => i.status === 'scheduled');

    // Approved / rejected counts among inspector's completed inspections
    const approvedCount = allInspections.filter(
      i => i.property?.verification_badge === true
    ).length;
    const rejectedCount = completed.filter(
      i => i.property?.verification_status === 'rejected'
    ).length;

    // Success rate = approved / total completed * 100
    const successRate = completed.length > 0
      ? parseFloat(((approvedCount / completed.length) * 100).toFixed(1))
      : null;

    // Recently approved properties by this inspector (completed + property verified)
    const recentlyApproved = allInspections
      .filter(i => i.property?.verification_badge === true)
      .slice(0, 5);

    res.status(200).json({
      inspection_stats: {
        total:     allInspections.length,
        scheduled: scheduled.length,
        completed: completed.length,
        approved:  approvedCount,           // ← NEW
        rejected:  rejectedCount,           // ← NEW
      },
      inspection_success_rate:    successRate,           // ← NEW  e.g. 83.3 (%)
      pending_verification_count: pendingProperties.length,
      unread_notifications:       unreadNotifications,   // ← NEW
      recent_inspections:         allInspections.slice(0, 5),
      pending_properties_list:    pendingProperties,
      recently_approved:          recentlyApproved,      // ← NEW
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
