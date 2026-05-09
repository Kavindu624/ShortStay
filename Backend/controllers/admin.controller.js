const { User, Property, Booking, Payment, Review, Complaint } = require('../models/index');
const sendEmail = require('../utils/sendEmail');
const notify   = require('../utils/notify');

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

    await user.destroy();
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

    // Notify the user
    await notify(
      user.user_id,
      'Account Suspended',
      `Your account has been suspended. Reason: ${reason || 'Please contact support.'}`,
      'account_suspended'
    );

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

    // Notify the user
    await notify(
      user.user_id,
      'Account Reinstated',
      'Your account suspension has been lifted. You can now log in.',
      'account_reinstated'
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
      include: [{ model: User, as: 'host', attributes: ['name', 'email', 'phone'] }]
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
        role: ['admin', 'payment_manager', 'field_inspector'] 
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
      include: [{ 
        model: User, 
        as: 'host', 
        attributes: ['name', 'email'] 
      }]
    });

    // All complaints
    const complaints = await Complaint.findAll({
      include: [{ model: Booking }]
    });

    // Revenue calculation
    const payments     = await Payment.findAll();
    const totalRevenue = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    res.status(200).json({
      generated_at: new Date(),
      total_revenue: totalRevenue.toFixed(2),
      recent_bookings: recentBookings,
      recent_payments: recentPayments,
      top_properties: topProperties,
      complaints: complaints,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};