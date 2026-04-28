const { Complaint, Booking } = require('../models/index');

// CREATE COMPLAINT (Guest only)
exports.createComplaint = async (req, res) => {
  try {
    const { booking_id, description, priority } = req.body;

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const complaint = await Complaint.create({
      booking_id,
      description,
      priority: priority || 'low',
      status: 'open',
    });

    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL COMPLAINTS (Admin only)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [{ model: Booking }]
    });

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE COMPLAINT STATUS (Admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.update({ status: req.body.status });
    res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};