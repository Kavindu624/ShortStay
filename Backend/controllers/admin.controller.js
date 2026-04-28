const { User, Property, Booking, Payment, Review, Complaint } = require('../models/index');

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

// GET ALL PROPERTIES (including unapproved)
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// APPROVE PROPERTY LISTING
exports.approveListing = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({ is_approved: true });
    res.status(200).json({ message: 'Property approved', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// REJECT PROPERTY LISTING
exports.rejectListing = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({ is_approved: false });
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