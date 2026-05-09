const { Complaint, Booking, User } = require('../models/index');
const notify = require('../utils/notify');

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
      include: [{
        model: Booking,
        include: [{
          model: User,
          as: 'guest',
          attributes: ['name', 'email'],
        }],
      }],
      order: [['complaint_id', 'DESC']],
    });

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE COMPLAINT STATUS (Admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution_note } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{
        model: Booking,
        include: [{ model: User, as: 'guest', attributes: ['user_id', 'name'] }],
      }],
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.update({ status });

    // Notify the guest about the complaint update
    const guestId = complaint.booking?.guest?.user_id;
    if (guestId) {
      await notify(
        guestId,
        'Complaint Status Updated',
        `Your complaint (#${complaint.complaint_id}) status has been updated to: ${status}.${resolution_note ? ` Note: ${resolution_note}` : ''}`,
        'complaint_update',
        complaint.complaint_id
      );
    }

    res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};