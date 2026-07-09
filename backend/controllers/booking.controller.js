const { Booking, Property, User, PropertyAvailability, Notification } = require('../models/index');
const { Op } = require('sequelize');
const { getPlatformSettings } = require('../utils/settings');
const sendEmail = require('../utils/sendEmail');
const updateMembership = require('../utils/membership');
const { markAsBooked, markAsAvailable } = require('./availability.controller');
const logActivity = require('../utils/activityLogger');
const {
  bookingConfirmationEmail,
  bookingApprovedEmail,
  bookingCancelledEmail,
  bookingRejectedEmail,
  bookingExpiredEmail,
  hostNewBookingEmail,
} = require('../utils/emailTemplates');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Push a notification record for a user (fire-and-forget, won't crash callers).
 */
async function notify(user_id, type, title, message, reference_id = null) {
  try {
    await Notification.create({ user_id, type, title, message, reference_id });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
}

/**
 * Generate all DATEONLY strings between checkin (inclusive) and checkout (exclusive).
 */
function getDateRange(checkin_date, checkout_date) {
  const dates = [];
  const current = new Date(checkin_date);
  const end = new Date(checkout_date);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Calculates refund amount and policy label based on how many days remain
 * until check-in.
 *
 * Policy tiers:
 *   ≥ 7 days  → full refund (100%)
 *   3–6 days  → partial refund (50%)
 *   < 3 days  → no refund (0%)
 */
function calcRefund(checkinDate, totalPrice) {
  const now = new Date();
  const checkin = new Date(checkinDate);
  const daysUntilCheckin = Math.ceil((checkin - now) / (1000 * 60 * 60 * 24));

  if (daysUntilCheckin >= 7) {
    return { refund_amount: parseFloat(totalPrice), refund_policy: 'full' };
  } else if (daysUntilCheckin >= 3) {
    return { refund_amount: parseFloat((totalPrice * 0.5).toFixed(2)), refund_policy: 'partial_50' };
  } else {
    return { refund_amount: 0, refund_policy: 'no_refund' };
  }
}

// ─── CREATE BOOKING ──────────────────────────────────────────────────────────

exports.makeBooking = async (req, res) => {
  try {
    const { property_id, checkin_date, checkout_date } = req.body;

    // 1. Validate property
    const property = await Property.findOne({
      where: { property_id, is_approved: true },
    });
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not approved' });
    }

    // 2. Validate dates
    const checkin  = new Date(checkin_date);
    const checkout = new Date(checkout_date);
    const nights   = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    
    // Fetch global settings
    const settings = await getPlatformSettings();

    if (nights <= 0) {
      return res.status(400).json({ message: 'Invalid dates: checkout must be after checkin' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkin < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }
    if (nights < settings.minBookingDays) {
      return res.status(400).json({ message: `Minimum booking duration is ${settings.minBookingDays} nights` });
    }
    
    const daysInAdvance = Math.ceil((checkin - new Date()) / (1000 * 60 * 60 * 24));
    if (daysInAdvance > settings.maxAdvanceBooking) {
      return res.status(400).json({ message: `Cannot book more than ${settings.maxAdvanceBooking} days in advance` });
    }

    // 3. Check availability BEFORE creating booking
    const requiredDates = getDateRange(checkin_date, checkout_date);
    const availableDates = await PropertyAvailability.findAll({
      where: {
        property_id,
        available_date: { [Op.in]: requiredDates },
        is_booked: false,
      },
    });
    if (availableDates.length !== requiredDates.length) {
      return res.status(409).json({
        message: 'Property is not available for the selected dates',
        required_dates: requiredDates.length,
        available_dates: availableDates.length,
      });
    }

    // 4. Prevent double booking — check for overlapping PENDING/CONFIRMED bookings
    const overlap = await Booking.findOne({
      where: {
        property_id,
        status: { [Op.in]: ['pending', 'confirmed'] },
        checkin_date:  { [Op.lt]: checkout_date },
        checkout_date: { [Op.gt]: checkin_date },
      },
    });
    if (overlap) {
      return res.status(409).json({
        message: 'This property already has an active booking overlapping your selected dates',
      });
    }

    // 5. Mark dates as booked and create booking with 24-hour expiry window
    await markAsBooked(property_id, checkin_date, checkout_date);

    const total_price = nights * property.price_per_night;
    const expires_at  = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 h

    const booking = await Booking.create({
      guest_id: req.user.user_id,
      property_id,
      checkin_date,
      checkout_date,
      total_price,
      status: 'pending',
      expires_at,
    });

    // 6. Send guest confirmation email
    const guest = await User.findByPk(req.user.user_id);
    await sendEmail(
      guest.email,
      'Booking Confirmation - ShortStay',
      bookingConfirmationEmail(guest.name, property, booking)
    );

    // 7. Notify & email HOST about new booking
    const host = await User.findByPk(property.host_id);
    if (host) {
      await sendEmail(
        host.email,
        'New Booking Request - ShortStay',
        hostNewBookingEmail(host.name, guest.name, property, booking)
      );
      
      // 8. Notify Admin if configured
      if (settings.notifNewBooking && settings.notifEmail) {
        await sendEmail(
          settings.notifEmail,
          'Admin Alert: New Booking Created',
          `<p>A new booking (ID: ${booking.booking_id}) has been created by ${guest.name} for property "${property.title}".</p>`
        );
      }

      await notify(
        host.user_id,
        'booking_created',
        'New Booking Request',
        `${guest.name} has requested to book "${property.title}" from ${checkin_date} to ${checkout_date}.`,
        booking.booking_id
      );
    }

    // 8. In-app notification for guest
    await notify(
      req.user.user_id,
      'booking_created',
      'Booking Submitted',
      `Your booking request for "${property.title}" has been submitted and is awaiting host approval.`,
      booking.booking_id
    );

    // Log booking creation
    await logActivity({
      user_id:   req.user.user_id,
      action:    'BOOKING_CREATED',
      entity:    'booking',
      entity_id: booking.booking_id,
      req,
      details:   { property_id, checkin_date, checkout_date, total_price },
    });

    res.status(201).json({
      message: 'Booking created successfully. Awaiting host approval.',
      booking,
      expires_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── APPROVE BOOKING ─────────────────────────────────────────────────────────

exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve a booking with status: ${booking.status}` });
    }
    if (booking.expires_at && new Date() > new Date(booking.expires_at)) {
      await booking.update({ status: 'expired' });
      return res.status(400).json({ message: 'Booking has already expired' });
    }

    await booking.update({ status: 'approved' });

    // Update guest membership
    const newMembership = await updateMembership(booking.guest_id);

    // Send approval email to guest
    const guest = await User.findByPk(booking.guest_id);
    await sendEmail(
      guest.email,
      'Booking Approved - ShortStay',
      bookingApprovedEmail(guest.name, booking.property, booking)
    );

    // In-app notification for guest
    await notify(
      booking.guest_id,
      'booking_approved',
      'Booking Approved! ✅',
      `Your booking for "${booking.property.title}" from ${booking.checkin_date} to ${booking.checkout_date} has been approved.`,
      booking.booking_id
    );

    res.status(200).json({
      message: 'Booking approved',
      booking,
      guest_membership: newMembership,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── REJECT BOOKING ──────────────────────────────────────────────────────────

exports.rejectBooking = async (req, res) => {
  try {
    const { rejection_reason } = req.body || {};

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a booking with status: ${booking.status}` });
    }

    await booking.update({
      status: 'rejected',
      rejection_reason: rejection_reason || null,
    });

    // Free up the dates
    await markAsAvailable(booking.property_id, booking.checkin_date, booking.checkout_date);

    // Send rejection email to guest
    const guest = await User.findByPk(booking.guest_id);
    await sendEmail(
      guest.email,
      'Booking Rejected - ShortStay',
      bookingRejectedEmail(guest.name, booking.property, booking, rejection_reason)
    );

    // In-app notification for guest
    await notify(
      booking.guest_id,
      'booking_rejected',
      'Booking Rejected ❌',
      `Your booking request for "${booking.property.title}" from ${booking.checkin_date} to ${booking.checkout_date} was rejected by the host.${rejection_reason ? ` Reason: ${rejection_reason}` : ''}`,
      booking.booking_id
    );

    res.status(200).json({
      message: 'Booking rejected',
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── COMPLETE BOOKING ────────────────────────────────────────────────────────
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: `Cannot complete a booking with status: ${booking.status}. It must be 'confirmed'.` });
    }

    await booking.update({ status: 'completed' });

    // Free up the dates so they are no longer marked as "Booked" on the calendar
    await markAsAvailable(booking.property_id, booking.checkin_date, booking.checkout_date);

    // In-app notification for guest
    await notify(
      booking.guest_id,
      'booking_completed',
      'Booking Completed ✅',
      `Your stay at "${booking.property.title}" is complete. We hope you had a great time! Please leave a review.`,
      booking.booking_id
    );

    res.status(200).json({
      message: 'Booking marked as completed',
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── CANCEL BOOKING ──────────────────────────────────────────────────────────

exports.cancelBooking = async (req, res) => {
  try {
    const { cancellation_reason } = req.body || {};

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (['cancelled', 'rejected', 'expired'].includes(booking.status)) {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    // Capture current status BEFORE updating (status check must happen before update)
    const wasConfirmed = booking.status === 'confirmed';

    // Cancellation policy — calculate refund
    let refund_amount = 0;
    let refund_policy = 'no_payment_made';
    
    if (wasConfirmed) {
      const calc = calcRefund(booking.checkin_date, booking.total_price);
      refund_amount = calc.refund_amount;
      refund_policy = calc.refund_policy;
    }

    await booking.update({
      status: 'cancelled',
      cancellation_reason: cancellation_reason || null,
      refund_amount,
      refund_policy,
    });

    // Free up availability for both pending and confirmed cancelled bookings
    await markAsAvailable(booking.property_id, booking.checkin_date, booking.checkout_date);

    // Update membership after cancellation
    await updateMembership(booking.guest_id);

    // Send cancellation email with refund info
    const guest = await User.findByPk(req.user.user_id);
    await sendEmail(
      guest.email,
      'Booking Cancelled - ShortStay',
      bookingCancelledEmail(guest.name, booking.property, booking)
    );

    // In-app notification for guest
    await notify(
      booking.guest_id,
      'booking_cancelled',
      'Booking Cancelled',
      `Your booking for "${booking.property.title}" has been cancelled.${wasConfirmed ? ` Refund: $${refund_amount} (${refund_policy.replace('_', ' ')}).` : ''}`,
      booking.booking_id
    );

    // Notify host — in-app + email
    const host = await User.findByPk(booking.property.host_id);
    if (host) {
      // In-app
      await notify(
        host.user_id,
        'booking_cancelled',
        'Booking Cancelled by Guest',
        `A guest cancelled their booking for "${booking.property.title}" (Check-in: ${booking.checkin_date}).`,
        booking.booking_id
      );
      // Email
      await sendEmail(
        host.email,
        'Booking Cancelled - ShortStay',
        bookingCancelledEmail(host.name, booking.property, booking)
      );
    }


    res.status(200).json({
      message: 'Booking cancelled',
      booking,
      refund_policy,
      refund_amount,
      refund_message: !wasConfirmed
        ? 'Booking cancelled successfully. No refund is required as no payment was made.'
        : refund_policy === 'full'
        ? `Full refund of $${refund_amount} will be processed.`
        : refund_policy === 'partial_50'
        ? `Partial refund of $${refund_amount} (50%) will be processed.`
        : 'No refund applicable as cancellation is within 3 days of check-in.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET MY BOOKINGS (guest) — full history ───────────────────────────────────

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { guest_id: req.user.user_id },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['property_id', 'title', 'address', 'price_per_night', 'city', 'property_type'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET HOST BOOKINGS ────────────────────────────────────────────────────────

exports.getHostBookings = async (req, res) => {
  try {
    const { status } = req.query; // optional filter: ?status=pending
    const where = {};
    if (status) where.status = status;

    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: Property,
          as: 'property',
          where: { host_id: req.user.user_id },
          attributes: ['property_id', 'title', 'address'],
        },
        {
          model: User,
          as: 'guest',
          attributes: ['name', 'email', 'phone', 'membership_level'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SINGLE BOOKING (full details) ───────────────────────────────────────

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['property_id', 'title', 'address', 'price_per_night', 'city', 'property_type', 'host_id'],
        },
        {
          model: User,
          as: 'guest',
          attributes: ['user_id', 'name', 'email', 'phone', 'membership_level'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only guest or host of this property can view
    const isGuest = booking.guest_id === req.user.user_id;
    const isHost  = booking.property && booking.property.host_id === req.user.user_id;
    const isAdmin = req.user.role === 'admin';
    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};