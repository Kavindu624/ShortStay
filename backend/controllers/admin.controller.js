const { User, Property, Booking, Payment, Review, Complaint, ActivityLog } = require('../models/index');
const { Op }   = require('sequelize');
const sendEmail = require('../utils/sendEmail');
const notify   = require('../utils/notify');
const logActivity = require('../utils/activityLogger');
const { markAsAvailable } = require('./availability.controller');
const { accountSuspendedEmail, accountReinstatedEmail } = require('../utils/emailTemplates');

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const force = req.query.force === 'true';

    if (user.role === 'guest') {
      const activeBookings = await Booking.findAll({
        where: {
          guest_id: user.user_id,
          status: ['pending', 'approved', 'confirmed']
        }
      });
      if (activeBookings.length > 0) {
        if (!force) {
          return res.status(400).json({ message: 'Cannot delete user: Guest has active bookings. Please cancel them first.' });
        }
        for (const booking of activeBookings) {
          await booking.update({ status: 'cancelled' });
          await markAsAvailable(booking.property_id, booking.checkin_date, booking.checkout_date);
        }
      }
    } else if (user.role === 'host') {
      const properties = await Property.findAll({ where: { host_id: user.user_id } });
      const propertyIds = properties.map(p => p.property_id);
      
      if (propertyIds.length > 0) {
        const activeBookings = await Booking.findAll({
          where: {
            property_id: propertyIds,
            status: ['pending', 'approved', 'confirmed']
          }
        });
        if (activeBookings.length > 0) {
          if (!force) {
            return res.status(400).json({ message: 'Cannot delete user: Host properties have active bookings. Please manage them first.' });
          }
          for (const booking of activeBookings) {
            await booking.update({ status: 'cancelled' });
            await markAsAvailable(booking.property_id, booking.checkin_date, booking.checkout_date);
          }
        }
      }
    }

    const deletedInfo = { user_id: user.user_id, name: user.name, email: user.email, role: user.role };
    await user.destroy();

    await logActivity({
      user_id:  req.user.user_id,
      action:   'ADMIN_DELETE_USER',
      entity:   'user',
      entity_id: parseInt(req.params.id),
      req,
      details:  deletedInfo,
    });

    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// SUSPEND USER
exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_suspended) {
      return res.status(400).json({ message: 'User is already suspended' });
    }

    await user.update({
      is_suspended:     true,
      suspended_reason: reason || 'Suspended by admin',
    });

    // Notify the user — in-app + email
    await notify(
      user.user_id,
      'Account Suspended',
      `Your account has been suspended. Reason: ${reason || 'Please contact support.'}`,
      'account_suspended'
    );
    await sendEmail(
      user.email,
      'Account Suspended - ShortStay',
      accountSuspendedEmail(user.name, reason)
    );

    await logActivity({
      user_id:   req.user.user_id,
      action:    'ADMIN_SUSPEND_USER',
      entity:    'user',
      entity_id: user.user_id,
      req,
      details:   { reason, target_email: user.email },
    });

    res.status(200).json({ message: 'User suspended', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UNSUSPEND USER
exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.is_suspended) {
      return res.status(400).json({ message: 'User is not suspended' });
    }

    await user.update({
      is_suspended:     false,
      suspended_reason: null,
    });

    // Notify the user — in-app + email
    await notify(
      user.user_id,
      'Account Reinstated',
      'Your account suspension has been lifted. You can now log in.',
      'account_reinstated'
    );
    await sendEmail(
      user.email,
      'Account Reinstated - ShortStay',
      accountReinstatedEmail(user.name)
    );

    res.status(200).json({ message: 'User unsuspended', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL PROPERTIES (including unapproved)
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: [
        { model: User, as: 'host', attributes: ['name', 'email', 'phone'] },
        { model: require('../models/PropertyImage'), as: 'images' }
      ]
    });
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// APPROVE PROPERTY LISTING
exports.approveListing = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{ model: User, as: 'host', attributes: ['name', 'email', 'user_id'] }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({ is_approved: true });

    // Notify host in-app
    await notify(
      property.host_id,
      'Property Approved ✅',
      `Your property "${property.title}" has been approved and is now listed publicly.`,
      'property_approved',
      property.property_id
    );

    // Email host
    await sendEmail(
      property.host.email,
      'Your Property Has Been Approved - ShortStay',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">ShortStay</h2>
        </div>
        <div style="background: #f8f8f8; padding: 20px;">
          <h3>Property Approved! ✅</h3>
          <p>Dear <strong>${property.host.name}</strong>,</p>
          <p>Great news! Your property listing has been reviewed and approved.</p>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
            <p><strong>Property:</strong> ${property.title}</p>
            <p><strong>Status:</strong> APPROVED &amp; LIVE</p>
          </div>
          <p style="color: #27ae60; font-weight: bold;">Your property is now visible to guests!</p>
        </div>
        <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">&copy; 2026 ShortStay</p>
        </div>
      </div>
      `
    );

    res.status(200).json({ message: 'Property approved', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// REJECT PROPERTY LISTING
exports.rejectListing = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findByPk(req.params.id, {
      include: [{ model: User, as: 'host', attributes: ['name', 'email', 'user_id'] }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({ is_approved: false });

    // Notify host in-app
    await notify(
      property.host_id,
      'Property Listing Rejected',
      `Your property "${property.title}" was not approved.${reason ? ` Reason: ${reason}` : ' Please contact support.'}`,
      'property_rejected',
      property.property_id
    );

    // Email host
    await sendEmail(
      property.host.email,
      'Property Listing Update - ShortStay',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #e74c3c; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">ShortStay</h2>
        </div>
        <div style="background: #f8f8f8; padding: 20px;">
          <h3>Property Listing Not Approved</h3>
          <p>Dear <strong>${property.host.name}</strong>,</p>
          <p>We reviewed your property listing and unfortunately it could not be approved at this time.</p>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
            <p><strong>Property:</strong> ${property.title}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          <p style="color: #666;">Please make the necessary changes and resubmit, or contact our support team.</p>
        </div>
        <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">&copy; 2026 ShortStay</p>
        </div>
      </div>
      `
    );

    res.status(200).json({ message: 'Property rejected', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET DASHBOARD STATS (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Users
    const totalUsers      = await User.count();
    const totalGuests     = await User.count({ where: { role: 'guest' }});
    const totalHosts      = await User.count({ where: { role: 'host' }});
    const totalStaff      = await User.count({ 
      where: { 
        role: ['admin', 'accountant', 'verifier'] 
      }
    });

    // Properties
    const totalProperties   = await Property.count();
    const approvedProperties = await Property.count({ where: { is_approved: true }});
    const pendingProperties  = await Property.count({ where: { is_approved: false }});
    const verifiedProperties = await Property.count({ where: { verification_badge: true }});

    // Bookings
    const totalBookings     = await Booking.count();
    const pendingBookings   = await Booking.count({ where: { status: 'pending' }});
    const confirmedBookings = await Booking.count({ where: { status: 'confirmed' }});
    const cancelledBookings = await Booking.count({ where: { status: 'cancelled' }});

    // Payments
    const payments     = await Payment.findAll();
    const totalRevenue = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    // Reviews
    const totalReviews = await Review.count();

    // Complaints
    const totalComplaints = await Complaint.count();
    const openComplaints  = await Complaint.count({ where: { status: 'open' }});
    const closedComplaints = await Complaint.count({ where: { status: 'closed' }});

    res.status(200).json({
      users: {
        total: totalUsers,
        guests: totalGuests,
        hosts: totalHosts,
        staff: totalStaff,
      },
      properties: {
        total: totalProperties,
        approved: approvedProperties,
        pending: pendingProperties,
        verified: verifiedProperties,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
      },
      payments: {
        total: payments.length,
        total_revenue: totalRevenue.toFixed(2),
      },
      reviews: {
        total: totalReviews,
      },
      complaints: {
        total: totalComplaints,
        open: openComplaints,
        closed: closedComplaints,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GENERATE FULL SYSTEM REPORT (Admin only)
exports.generateReport = async (req, res) => {
  try {
    // Recent bookings
    const recentBookings = await Booking.findAll({
      limit: 10,
      order: [['booking_id', 'DESC']],
      include: [
        { model: Property, as: 'property', attributes: ['title'] },
        { model: User, as: 'guest', attributes: ['name', 'email'] },
      ]
    });

    // Recent payments
    const recentPayments = await Payment.findAll({
      limit: 10,
      order: [['payment_id', 'DESC']],
      include: [{
        model: Booking,
        include: [
          { model: User, as: 'guest', attributes: ['name', 'email'] },
          { model: Property, as: 'property', attributes: ['title'] },
        ]
      }]
    });

    // Top rated properties
    const topProperties = await Property.findAll({
      where: { is_approved: true },
      order: [['overall_score', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'host', attributes: ['name', 'email'] }]
    });

    // Open complaints
    const openComplaints = await Complaint.findAll({
      where: { status: 'open' },
      include: [{ model: Booking }],
      order: [['complaint_id', 'DESC']],
      limit: 10,
    });

    // Revenue
    const payments     = await Payment.findAll();
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Recent activity logs
    const recentActivityLogs = await ActivityLog.findAll({
      include: [{ model: User, attributes: ['name', 'role'] }],
      order: [['log_id', 'DESC']],
      limit: 20,
    });

    res.status(200).json({
      generated_at:       new Date(),
      total_revenue:      totalRevenue.toFixed(2),
      recent_bookings:    recentBookings,
      recent_payments:    recentPayments,
      top_properties:     topProperties,
      open_complaints:    openComplaints,
      recent_activity_logs: recentActivityLogs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// SYSTEM MONITOR  GET /api/admin/monitor
exports.getSystemMonitor = async (req, res) => {
  try {
    const [
      totalUsers, suspendedUsers,
      totalProperties, pendingProperties,
      totalBookings, activeBookings,
      openComplaints,
      totalPayments,
      recentLogs,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { is_suspended: true } }),
      Property.count(),
      Property.count({ where: { is_approved: false } }),
      Booking.count(),
      Booking.count({ where: { status: { [Op.in]: ['pending', 'confirmed'] } } }),
      Complaint.count({ where: { status: 'open' } }),
      Payment.findAll(),
      ActivityLog.findAll({
        include: [{ model: User, attributes: ['name', 'role'] }],
        order: [['log_id', 'DESC']],
        limit: 10,
      }),
    ]);

    const totalRevenue = totalPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.status(200).json({
      system_health: {
        total_users:       totalUsers,
        suspended_users:   suspendedUsers,
        total_properties:  totalProperties,
        pending_approvals: pendingProperties,
        total_bookings:    totalBookings,
        active_bookings:   activeBookings,
        open_complaints:   openComplaints,
        total_revenue:     parseFloat(totalRevenue.toFixed(2)),
        total_payments:    totalPayments.length,
      },
      recent_activity_logs: recentLogs,
      generated_at: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// USER ACTIVITY REPORT  GET /api/admin/user-activity-report
exports.getUserActivityReport = async (req, res) => {
  try {
    const { user_id, action, limit = 50 } = req.query;

    const where = {};
    if (user_id) where.user_id  = user_id;
    if (action)  where.action   = action;

    const logs = await ActivityLog.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email', 'role'] }],
      order: [['log_id', 'DESC']],
      limit: Math.min(parseInt(limit), 200),
    });

    // Action summary
    const summary = {};
    logs.forEach(l => {
      summary[l.action] = (summary[l.action] || 0) + 1;
    });

    res.status(200).json({
      total:    logs.length,
      summary,
      logs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};