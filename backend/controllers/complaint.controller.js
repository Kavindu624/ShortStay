const { Complaint, Booking, User } = require('../models/index');
const notify      = require('../utils/notify');
const logActivity = require('../utils/activityLogger');
const sendEmail   = require('../utils/sendEmail');
const {
  complaintSubmittedAdminEmail,
  complaintResolvedEmail,
} = require('../utils/emailTemplates');

// CREATE COMPLAINT (Guest only)
exports.createComplaint = async (req, res) => {
  try {
    const { booking_id, description, priority } = req.body;

    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: User, as: 'guest', attributes: ['user_id', 'name', 'email'] }],
    });
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

    // Notify ALL admins — in-app + email
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(admin => Promise.all([
      // In-app
      notify(
        admin.user_id,
        'New Complaint Submitted 🚨',
        `Guest "${booking.guest?.name}" submitted a complaint (priority: ${priority || 'low'}) for booking #${booking_id}.`,
        'complaint_new',
        complaint.complaint_id
      ),
      // Email
      sendEmail(
        admin.email,
        'New Complaint Submitted - ShortStay Admin',
        complaintSubmittedAdminEmail(
          admin.name,
          booking.guest?.name,
          booking_id,
          description,
          priority || 'low'
        )
      ),
    ])));

    await logActivity({
      user_id:   req.user.user_id,
      action:    'COMPLAINT_SUBMITTED',
      entity:    'complaint',
      entity_id: complaint.complaint_id,
      req,
      details:   { booking_id, priority },
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
        include: [{ model: User, as: 'guest', attributes: ['user_id', 'name', 'email'] }],
      }],
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.update({ status, resolution_note: resolution_note || null });

    const guest = complaint.booking?.guest;
    const guestId = guest?.user_id;

    if (guestId) {
      // Always notify guest on any status change
      await notify(
        guestId,
        'Complaint Status Updated',
        `Your complaint (#${complaint.complaint_id}) status has been updated to: ${status}.${resolution_note ? ` Note: ${resolution_note}` : ''}`,
        'complaint_update',
        complaint.complaint_id
      );

      // If resolved — send dedicated resolved email
      if (status === 'resolved') {
        await notify(
          guestId,
          'Complaint Resolved ✅',
          `Your complaint (#${complaint.complaint_id}) has been resolved.${resolution_note ? ` Resolution: ${resolution_note}` : ''}`,
          'complaint_resolved',
          complaint.complaint_id
        );

        if (guest?.email) {
          await sendEmail(
            guest.email,
            'Your Complaint Has Been Resolved - ShortStay',
            complaintResolvedEmail(guest.name, complaint.complaint_id, resolution_note)
          );
        }
      }
    }

    res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};