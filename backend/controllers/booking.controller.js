const { Booking, Property, User } = require('../models/index');
const sendEmail = require('../utils/sendEmail');
const updateMembership = require('../utils/membership');
const { markAsBooked, markAsAvailable } = require('./availability.controller');
const { 
  bookingConfirmationEmail,
  bookingApprovedEmail,
  bookingCancelledEmail 
} = require('../utils/emailTemplates');

// CREATE BOOKING
exports.makeBooking = async (req, res) => {
  try {
    const { property_id, checkin_date, checkout_date } = req.body;

    const property = await Property.findOne({
      where: { property_id, is_approved: true }
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or not approved' });
    }

    const checkin  = new Date(checkin_date);
    const checkout = new Date(checkout_date);
    const nights   = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ message: 'Invalid dates' });
    }

    const total_price = nights * property.price_per_night;

    const booking = await Booking.create({
      guest_id: req.user.user_id,
      property_id,
      checkin_date,
      checkout_date,
      total_price,
      status: 'pending',
    });

    // Send confirmation email
    const guest = await User.findByPk(req.user.user_id);
    await sendEmail(
      guest.email,
      'Booking Confirmation - ShortStay',
      bookingConfirmationEmail(guest.name, property, booking)
    );

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// APPROVE BOOKING
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await booking.update({ status: 'confirmed' });

    // Mark dates as booked ← NEW
    await markAsBooked(
      booking.property_id,
      booking.checkin_date,
      booking.checkout_date
    );

    // Update guest membership
    const newMembership = await updateMembership(booking.guest_id);

    // Send approval email
    const guest = await User.findByPk(booking.guest_id);
    await sendEmail(
      guest.email,
      'Booking Approved - ShortStay',
      bookingApprovedEmail(guest.name, booking.property, booking)
    );

    res.status(200).json({ 
      message: 'Booking approved',
      booking,
      guest_membership: newMembership
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    await booking.update({ status: 'cancelled' });

    // Mark dates as available again ← NEW
    await markAsAvailable(
      booking.property_id,
      booking.checkin_date,
      booking.checkout_date
    );

    // Update membership after cancellation
    await updateMembership(booking.guest_id);

    // Send cancellation email
    const guest = await User.findByPk(req.user.user_id);
    await sendEmail(
      guest.email,
      'Booking Cancelled - ShortStay',
      bookingCancelledEmail(guest.name, booking.property, booking)
    );

    res.status(200).json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { guest_id: req.user.user_id },
      include: [{ 
        model: Property, 
        as: 'property',
        attributes: ['title', 'address', 'price_per_night'] 
      }],
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET HOST BOOKINGS
exports.getHostBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ 
        model: Property,
        as: 'property',
        where: { host_id: req.user.user_id },
        attributes: ['title', 'address'],
      },
      { 
        model: User, 
        as: 'guest',
        attributes: ['name', 'email', 'phone', 'membership_level'] 
      }],
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE BOOKING
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Property, as: 'property', attributes: ['title', 'address'] },
        { model: User, as: 'guest', attributes: ['name', 'email', 'membership_level'] },
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};