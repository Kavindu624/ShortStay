const { PropertyAvailability, Property, Booking } = require('../models/index');
const { Op } = require('sequelize');

// SET AVAILABLE DATES (Host only)
exports.setAvailability = async (req, res) => {
  try {
    const { property_id, dates } = req.body;
    // dates = ["2026-05-01", "2026-05-02", "2026-05-03"]

    // Check property exists and belongs to host
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!dates || dates.length === 0) {
      return res.status(400).json({ message: 'Please provide dates' });
    }

    // Delete existing availability for this property
    await PropertyAvailability.destroy({ 
      where: { property_id } 
    });

    // Insert new availability dates
    const availabilityData = dates.map(date => ({
      property_id,
      available_date: date,
      is_booked: false,
    }));

    await PropertyAvailability.bulkCreate(availabilityData);

    res.status(201).json({ 
      message: 'Availability set successfully',
      total_dates: dates.length,
      dates 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET AVAILABILITY FOR A PROPERTY (Public)
exports.getAvailability = async (req, res) => {
  try {
    const availability = await PropertyAvailability.findAll({
      where: { 
        property_id: req.params.property_id,
        is_booked: false,
        available_date: { [Op.gte]: new Date() } // only future dates
      },
      order: [['available_date', 'ASC']]
    });

    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CHECK DATE AVAILABILITY (Public)
exports.checkAvailability = async (req, res) => {
  try {
    const { property_id, checkin_date, checkout_date } = req.query;

    if (!property_id || !checkin_date || !checkout_date) {
      return res.status(400).json({ 
        message: 'Please provide property_id, checkin_date and checkout_date' 
      });
    }

    // Get all dates between checkin and checkout
    const start  = new Date(checkin_date);
    const end    = new Date(checkout_date);
    const dates  = [];

    let current = new Date(start);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    // Check if all dates are available
    const availableDates = await PropertyAvailability.findAll({
      where: {
        property_id,
        available_date: { [Op.in]: dates },
        is_booked: false,
      }
    });

    const isAvailable = availableDates.length === dates.length;

    res.status(200).json({
      property_id,
      checkin_date,
      checkout_date,
      is_available: isAvailable,
      available_dates_count: availableDates.length,
      required_dates_count: dates.length,
      message: isAvailable 
        ? 'Property is available for these dates' 
        : 'Property is not available for some dates',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// MARK DATES AS BOOKED (called when booking is confirmed)
exports.markAsBooked = async (property_id, checkin_date, checkout_date) => {
  try {
    const start   = new Date(checkin_date);
    const end     = new Date(checkout_date);
    const dates   = [];

    let current = new Date(start);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    await PropertyAvailability.update(
      { is_booked: true },
      { 
        where: { 
          property_id,
          available_date: { [Op.in]: dates }
        } 
      }
    );

    console.log(`Dates marked as booked for property ${property_id}`);
  } catch (err) {
    console.error('Mark as booked failed:', err.message);
  }
};

// MARK DATES AS AVAILABLE AGAIN (called when booking is cancelled)
exports.markAsAvailable = async (property_id, checkin_date, checkout_date) => {
  try {
    const start   = new Date(checkin_date);
    const end     = new Date(checkout_date);
    const dates   = [];

    let current = new Date(start);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    await PropertyAvailability.update(
      { is_booked: false },
      { 
        where: { 
          property_id,
          available_date: { [Op.in]: dates }
        } 
      }
    );

    console.log(`Dates marked as available for property ${property_id}`);
  } catch (err) {
    console.error('Mark as available failed:', err.message);
  }
};