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

// ─────────────────────────────────────────
// ADD MORE DATES (Host only)
// Appends dates without wiping existing ones
// ─────────────────────────────────────────
exports.addDates = async (req, res) => {
  try {
    const { property_id, dates } = req.body;

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

    // Only insert dates that don't already exist (avoid duplicates)
    const existing = await PropertyAvailability.findAll({
      where: { property_id, available_date: { [Op.in]: dates } }
    });
    const existingDates = existing.map(e => {
      const d = e.available_date;
      return (d instanceof Date) ? d.toISOString().split('T')[0] : String(d);
    });
    const newDates = dates.filter(d => !existingDates.includes(d));

    if (newDates.length === 0) {
      return res.status(400).json({ message: 'All provided dates already exist' });
    }

    await PropertyAvailability.bulkCreate(
      newDates.map(date => ({ property_id, available_date: date, is_booked: false }))
    );

    res.status(201).json({
      message: `${newDates.length} date(s) added successfully`,
      added_dates: newDates,
      skipped_dates: existingDates,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// REMOVE SPECIFIC DATES (Host only)
// Deletes specific dates — cannot remove booked dates
// ─────────────────────────────────────────
exports.removeDates = async (req, res) => {
  try {
    const { property_id, dates } = req.body;

    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!dates || dates.length === 0) {
      return res.status(400).json({ message: 'Please provide dates to remove' });
    }

    // Reject if any date is already booked
    const bookedDates = await PropertyAvailability.findAll({
      where: { property_id, available_date: { [Op.in]: dates }, is_booked: true }
    });
    if (bookedDates.length > 0) {
      return res.status(400).json({
        message: 'Cannot remove booked dates',
        booked_dates: bookedDates.map(d => d.available_date),
      });
    }

    const deleted = await PropertyAvailability.destroy({
      where: { property_id, available_date: { [Op.in]: dates }, is_booked: false }
    });

    res.status(200).json({
      message: `${deleted} date(s) removed successfully`,
      removed_dates: dates,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET FULL CALENDAR (available + booked)
// ─────────────────────────────────────────
exports.getCalendar = async (req, res) => {
  try {
    const allDates = await PropertyAvailability.findAll({
      where: {
        property_id: req.params.property_id,
        available_date: { [Op.gte]: new Date() },
      },
      order: [['available_date', 'ASC']],
    });

    const available = allDates.filter(d => !d.is_booked).map(d => d.available_date);
    const booked    = allDates.filter(d =>  d.is_booked).map(d => d.available_date);

    res.status(200).json({
      property_id:     req.params.property_id,
      available_dates: available,
      booked_dates:    booked,
      total_available: available.length,
      total_booked:    booked.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};