const { Property, User } = require('../models/index');
const { Op } = require('sequelize');

// CREATE PROPERTY (Host only)
exports.createProperty = async (req, res) => {
  try {
    const {
      title, description, address,
      price_per_night, max_guests, available_dates
    } = req.body;

    const property = await Property.create({
      host_id: req.user.user_id,
      title,
      description,
      address,
      price_per_night,
      max_guests,
      available_dates,
      is_approved: false,
      verification_badge: false,
    });

    res.status(201).json({ message: 'Property created successfully', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL APPROVED PROPERTIES (Public - Guest search)
exports.getAllProperties = async (req, res) => {
  try {
    const { 
      location, 
      min_price, 
      max_price, 
      guests,
      min_rating,
      checkin_date,
      checkout_date
    } = req.query;

    const where = { is_approved: true };

    if (location) {
      where.address = { [Op.like]: `%${location}%` };
    }
    if (min_price && max_price) {
      where.price_per_night = { [Op.between]: [min_price, max_price] };
    }
    if (guests) {
      where.max_guests = { [Op.gte]: guests };
    }
    if (min_rating) {
      where.overall_score = { [Op.gte]: min_rating };
    }

    let properties = await Property.findAll({
      where,
      include: [{ 
        model: User, 
        as: 'host', 
        attributes: ['name', 'email', 'phone'] 
      }],
    });

    // Filter by date availability
    if (checkin_date && checkout_date) {
      const availableProperties = [];

      for (const property of properties) {
        const { Op } = require('sequelize');
        const { PropertyAvailability } = require('../models/index');

        const start = new Date(checkin_date);
        const end   = new Date(checkout_date);
        const dates = [];

        let current = new Date(start);
        while (current < end) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }

        const availableDates = await PropertyAvailability.findAll({
          where: {
            property_id: property.property_id,
            available_date: { [Op.in]: dates },
            is_booked: false,
          }
        });

        if (availableDates.length === dates.length) {
          availableProperties.push(property);
        }
      }

      return res.status(200).json(availableProperties);
    }

    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE PROPERTY
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{ model: User, as: 'host', attributes: ['name', 'email', 'phone'] }],
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE PROPERTY (Host only)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Make sure only the owner can update
    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await property.update(req.body);
    res.status(200).json({ message: 'Property updated', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE PROPERTY (Host only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await property.destroy();
    res.status(200).json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET HOST'S OWN PROPERTIES
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { host_id: req.user.user_id },
    });

    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// REQUEST VERIFICATION (Host only)
exports.requestVerification = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check host owns this property
    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already verified
    if (property.verification_badge) {
      return res.status(400).json({ message: 'Property is already verified' });
    }

    // Check if already requested
    if (property.verification_requested) {
      return res.status(400).json({ 
        message: `Verification already ${property.verification_status}` 
      });
    }

    await property.update({ 
      verification_requested: true,
      verification_status: 'requested'
    });

    res.status(200).json({ 
      message: 'Verification requested successfully. A field inspector will visit your property.',
      property 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL VERIFICATION REQUESTS (Admin only)
exports.getVerificationRequests = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { verification_requested: true },
      include: [{ 
        model: User, 
        as: 'host', 
        attributes: ['name', 'email', 'phone'] 
      }]
    });

    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE VERIFICATION STATUS (Admin/Inspector only)
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['none','requested','inspecting','approved','rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // If approved give verification badge
    if (status === 'approved') {
      await property.update({ 
        verification_status: status,
        verification_badge: true,
      });
    } else {
      await property.update({ verification_status: status });
    }

    res.status(200).json({ 
      message: `Verification status updated to ${status}`,
      property 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};