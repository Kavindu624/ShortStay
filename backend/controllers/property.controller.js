const { 
  Property, 
  User, 
  Review, 
  PropertyAvailability,
  PropertyImage,
  Booking,
  Payment
} = require('../models/index');
const { Op }    = require('sequelize');
const path      = require('path');
const fs        = require('fs');
const sequelize = require('../config/db');
const logActivity = require('../utils/activityLogger');

// ─────────────────────────────────────────
// HELPER — Calculate distance between 2 coordinates (km)
// ─────────────────────────────────────────
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns km
};

// ─────────────────────────────────────────
// HELPER — Auto update overall score from reviews
// ─────────────────────────────────────────
exports.updateOverallScore = async (property_id) => {
  try {
    const reviews = await Review.findAll({ where: { property_id } });

    if (reviews.length === 0) {
      await Property.update(
        { overall_score: null },
        { where: { property_id } }
      );
      return;
    }

    const avgRating = reviews.reduce(
      (sum, r) => sum + r.rating, 0
    ) / reviews.length;

    await Property.update(
      { overall_score: parseFloat(avgRating.toFixed(2)) },
      { where: { property_id } }
    );
  } catch (err) {
    console.error('Score update failed:', err.message);
  }
};

// ─────────────────────────────────────────
// CREATE PROPERTY (Host only)
// ─────────────────────────────────────────
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      price_per_night,
      max_guests,
      bedrooms,
      property_type,
      latitude,
      longitude,
    } = req.body;

    const property = await Property.create({
      host_id:            req.user.user_id,
      title,
      description,
      address,
      price_per_night,
      max_guests,
      bedrooms:           bedrooms      || 1,
      property_type:      property_type || 'apartment',
      latitude:           latitude      || null,
      longitude:          longitude     || null,
      is_approved:        false,
      verification_badge: false,
    });

    // Log property creation
    await logActivity({
      user_id:   req.user.user_id,
      action:    'PROPERTY_CREATED',
      entity:    'property',
      entity_id: property.property_id,
      req,
      details:   { title, address, property_type },
    });

    res.status(201).json({ 
      message: 'Property created successfully. Waiting for admin approval.',
      property 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET ALL APPROVED PROPERTIES WITH FILTERS
// ─────────────────────────────────────────
exports.getAllProperties = async (req, res) => {
  try {
    const { 
      // Search params
      location, 
      checkin_date,
      checkout_date,
      guests,

      // Filter params
      min_price,
      max_price,
      property_type,
      verification_status,  // 'all', 'verified', 'not_verified'
      availability_status,  // 'all', 'available', 'booked'
      min_rating,
      max_rating,

      // Distance filter
      // ── Google Maps API Integration Point ─────────────────────────────────────
      // The frontend uses the Google Maps Geocoding API to convert a user-typed
      // location string (e.g. "Colombo") into latitude/longitude coordinates.
      // Those coordinates are then passed to this backend as location_lat / location_lng.
      // The backend performs Haversine distance calculation to filter nearby properties.
      // This clean separation keeps API keys on the frontend and math on the backend.
      // ──────────────────────────────────────────────────────────────────────────
      location_lat,    // latitude of searched location (from Google Maps Geocoding)
      location_lng,    // longitude of searched location (from Google Maps Geocoding)
      distance_radius, // in km: 0.5, 1, 2, 3, 5
    } = req.query;

    // Base filter
    const where = { is_approved: true };

    // Location text filter (for when no lat/lng available)
    if (location && !location_lat) {
      where.address = { [Op.like]: `%${location}%` };
    }

    // Guests filter
    if (guests) {
      where.max_guests = { [Op.gte]: parseInt(guests) };
    }

    // Price filter
    if (min_price && max_price) {
      where.price_per_night = { 
        [Op.between]: [parseFloat(min_price), parseFloat(max_price)] 
      };
    } else if (min_price) {
      where.price_per_night = { [Op.gte]: parseFloat(min_price) };
    } else if (max_price) {
      where.price_per_night = { [Op.lte]: parseFloat(max_price) };
    }

    // Property type filter
    if (property_type && property_type !== 'all') {
      where.property_type = property_type;
    }

    // Verification status filter
    if (verification_status === 'verified') {
      where.verification_badge = true;
    } else if (verification_status === 'not_verified') {
      where.verification_badge = false;
    }

    // Rating range filter
    if (min_rating && max_rating) {
      where.overall_score = { 
        [Op.between]: [parseFloat(min_rating), parseFloat(max_rating)] 
      };
    } else if (min_rating) {
      where.overall_score = { [Op.gte]: parseFloat(min_rating) };
    }

    // Get all properties matching basic filters
    let properties = await Property.findAll({
      where,
      include: [
        { 
          model: User, 
          as: 'host', 
          attributes: ['name', 'email', 'phone'] 
        },
        {
          model: PropertyImage,
          as: 'images',
          required: false,
        }
      ],
      order: [['overall_score', 'DESC']]
    });

    // ── Distance Filter ───────────────────────────
    // Frontend sends location_lat, location_lng from Google Maps
    // Backend filters properties within distance_radius
    if (location_lat && location_lng && distance_radius) {
      const searchLat    = parseFloat(location_lat);
      const searchLng    = parseFloat(location_lng);
      const maxRadiusKm  = parseFloat(distance_radius); // 0.5, 1, 2, 3, 5

      properties = properties
        .filter(property => {
          const prop = property.toJSON ? property.toJSON() : property;

          // Skip properties without coordinates
          if (!prop.latitude || !prop.longitude) return false;

          const dist = calculateDistance(
            searchLat,
            searchLng,
            parseFloat(prop.latitude),
            parseFloat(prop.longitude)
          );

          // Attach distance to property for frontend display
          property.dataValues.distance_km = parseFloat(dist.toFixed(2));
          property.dataValues.distance_m  = Math.round(dist * 1000);

          return dist <= maxRadiusKm;
        })
        // Sort by closest first
        .sort((a, b) => 
          (a.dataValues.distance_km || 0) - (b.dataValues.distance_km || 0)
        );
    }

    // ── Date Availability Filter ──────────────────
    if (checkin_date && checkout_date) {
      const start = new Date(checkin_date);
      const end   = new Date(checkout_date);
      const dates = [];

      let current = new Date(start);
      while (current < end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      const availableProperties = [];

      for (const property of properties) {
        const prop = property.toJSON ? property.toJSON() : property;

        const availableDates = await PropertyAvailability.findAll({
          where: {
            property_id:    prop.property_id,
            available_date: { [Op.in]: dates },
            is_booked:      false,
          }
        });

        const isAvailable = availableDates.length === dates.length;

        if (availability_status === 'available' && isAvailable) {
          availableProperties.push({ ...prop, is_available: true });
        } else if (availability_status === 'booked' && !isAvailable) {
          availableProperties.push({ ...prop, is_available: false });
        } else if (!availability_status || availability_status === 'all') {
          availableProperties.push({ ...prop, is_available: isAvailable });
        }
      }

      properties = availableProperties;

    } else {
      // No dates — apply availability filter differently
      if (availability_status === 'available') {
        const filteredProperties = [];
        for (const property of properties) {
          const prop = property.toJSON ? property.toJSON() : property;
          const availableCount = await PropertyAvailability.count({
            where: {
              property_id:    prop.property_id,
              is_booked:      false,
              available_date: { [Op.gte]: new Date() }
            }
          });
          if (availableCount > 0) filteredProperties.push(property);
        }
        properties = filteredProperties;

      } else if (availability_status === 'booked') {
        const filteredProperties = [];
        for (const property of properties) {
          const prop = property.toJSON ? property.toJSON() : property;
          const availableCount = await PropertyAvailability.count({
            where: {
              property_id:    prop.property_id,
              is_booked:      false,
              available_date: { [Op.gte]: new Date() }
            }
          });
          if (availableCount === 0) filteredProperties.push(property);
        }
        properties = filteredProperties;
      }
    }

    res.status(200).json({
      total:      properties.length,
      properties,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET SINGLE PROPERTY (Public)
// ─────────────────────────────────────────
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'host', 
          attributes: ['name', 'email', 'phone'] 
        },
        {
          model: PropertyImage,
          as: 'images',
        },
        {
          model: Review,
          include: [{
            model: Booking,
            include: [{ 
              model: User, 
              as: 'guest', 
              attributes: ['name'] 
            }]
          }]
        },
        {
          model: PropertyAvailability,
          as: 'availability',
          where: { 
            is_booked:      false,
            available_date: { [Op.gte]: new Date() }
          },
          required: false,
          order: [['available_date', 'ASC']]
        }
      ],
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// UPDATE PROPERTY (Host only)
// ─────────────────────────────────────────
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      title,
      description,
      address,
      price_per_night,
      max_guests,
      bedrooms,
      property_type,
      latitude,
      longitude,
    } = req.body;

    const updateData = {};
    if (title)           updateData.title           = title;
    if (description)     updateData.description     = description;
    if (address)         updateData.address         = address;
    if (price_per_night) updateData.price_per_night = price_per_night;
    if (max_guests)      updateData.max_guests      = max_guests;
    if (bedrooms)        updateData.bedrooms        = bedrooms;
    if (property_type)   updateData.property_type   = property_type;
    if (latitude)        updateData.latitude        = latitude;
    if (longitude)       updateData.longitude       = longitude;

    await property.update(updateData);

    res.status(200).json({ 
      message: 'Property updated successfully', 
      property 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// DELETE PROPERTY (Host only)
// ─────────────────────────────────────────
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete property images from folder
    const images = await PropertyImage.findAll({
      where: { property_id: req.params.id }
    });

    images.forEach(img => {
      const filePath = path.join(
        __dirname, '../uploads/properties', img.image_url
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await property.destroy();
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET HOST'S OWN PROPERTIES
// ─────────────────────────────────────────
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { host_id: req.user.user_id },
      include: [
        { model: PropertyImage, as: 'images' },
        { model: Review }
      ],
      order: [['property_id', 'DESC']]
    });

    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// UPLOAD MULTIPLE PROPERTY IMAGES (Host only)
// ─────────────────────────────────────────
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check existing images count
    const existingImages = await PropertyImage.count({
      where: { property_id: req.params.id }
    });

    if (existingImages + req.files.length > 10) {
      return res.status(400).json({ 
        message: `Maximum 10 images allowed. You have ${existingImages} images.` 
      });
    }

    const savedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file      = req.files[i];
      const isPrimary = existingImages === 0 && i === 0;

      const image = await PropertyImage.create({
        property_id: req.params.id,
        image_url:   file.filename,
        is_primary:  isPrimary,
      });

      savedImages.push({
        image_id:   image.image_id,
        image_url:  `http://localhost:5000/uploads/properties/${file.filename}`,
        is_primary: isPrimary,
      });
    }

    // Update main image column with primary image
    if (existingImages === 0) {
      await property.update({ image: savedImages[0].image_url });
    }

    res.status(200).json({
      message: `${req.files.length} image(s) uploaded successfully`,
      images:  savedImages,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// SET PRIMARY IMAGE (Host only)
// ─────────────────────────────────────────
exports.setPrimaryImage = async (req, res) => {
  try {
    const { image_id } = req.body;

    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove primary from all images of this property
    await PropertyImage.update(
      { is_primary: false },
      { where: { property_id: req.params.id } }
    );

    // Set new primary
    await PropertyImage.update(
      { is_primary: true },
      { where: { image_id, property_id: req.params.id } }
    );

    // Get updated image url
    const image = await PropertyImage.findByPk(image_id);
    await property.update({ 
      image: `http://localhost:5000/uploads/properties/${image.image_url}` 
    });

    res.status(200).json({ message: 'Primary image updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// DELETE PROPERTY IMAGE (Host only)
// ─────────────────────────────────────────
exports.deleteImage = async (req, res) => {
  try {
    const image = await PropertyImage.findByPk(req.params.image_id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const property = await Property.findByPk(image.property_id);

    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from folder
    const filePath = path.join(
      __dirname, '../uploads/properties', image.image_url
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.destroy();
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// REQUEST VERIFICATION (Host only)
// Also handles re-request after rejection
// ─────────────────────────────────────────
exports.requestVerification = async (req, res) => {
  try {
    const notify = require('../utils/notify');

    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (property.verification_badge) {
      return res.status(400).json({ message: 'Property is already verified' });
    }

    // Block if already pending (requested or inspecting) — but ALLOW re-request after rejection
    const blockedStatuses = ['requested', 'inspecting'];
    if (property.verification_requested && blockedStatuses.includes(property.verification_status)) {
      return res.status(400).json({
        message: `Verification is already ${property.verification_status}. Please wait.`
      });
    }

    await property.update({
      verification_requested: true,
      verification_status:    'requested'
    });

    // Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(admin =>
      notify(
        admin.user_id,
        property.verification_status === 'rejected'
          ? 'Re-Verification Request 🏠'
          : 'New Verification Request 🏠',
        `Host has requested verification for property "${property.title}". Please assign a field inspector.`,
        'verification_requested',
        property.property_id
      )
    ));

    res.status(200).json({
      message: 'Verification requested. A field inspector will visit your property.',
      property
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// CANCEL VERIFICATION REQUEST (Host only)
// Only allowed when status is 'requested' (not yet assigned)
// ─────────────────────────────────────────
exports.cancelVerification = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!property.verification_requested) {
      return res.status(400).json({ message: 'No pending verification request to cancel' });
    }
    if (property.verification_status === 'inspecting') {
      return res.status(400).json({
        message: 'Inspection already in progress. Cannot cancel at this stage.'
      });
    }
    if (property.verification_badge) {
      return res.status(400).json({ message: 'Property is already verified' });
    }

    await property.update({
      verification_requested: false,
      verification_status:    'none',
    });

    res.status(200).json({
      message: 'Verification request cancelled successfully.',
      property,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET VERIFICATION REQUESTS (Admin only)
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// UPDATE VERIFICATION STATUS (Admin/Inspector)
// ─────────────────────────────────────────
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status }         = req.body;
    const sendEmail          = require('../utils/sendEmail');
    const createNotification = require('../utils/notify');

    const validStatuses = ['none','requested','inspecting','approved','rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const property = await Property.findByPk(req.params.id, {
      include: [{ 
        model: User, 
        as: 'host', 
        attributes: ['name', 'email'] 
      }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (status === 'approved') {
      await property.update({ 
        verification_status: status,
        verification_badge:  true,
      });
    } else {
      await property.update({ verification_status: status });
    }

    // Notify host
    await createNotification(
      property.host_id,
      'Verification Status Updated',
      `Your property "${property.title}" verification status: ${status}`
    );

    // Send email
    await sendEmail(
      property.host.email,
      'Property Verification Update - ShortStay',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: ${status === 'approved' ? '#27ae60' : '#e74c3c'}; 
                    padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">ShortStay</h2>
        </div>
        <div style="background: #f8f8f8; padding: 20px;">
          <h3>Property Verification Update</h3>
          <p>Dear <strong>${property.host.name}</strong>,</p>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <p><strong>Property:</strong> ${property.title}</p>
            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
            ${status === 'approved' 
              ? '<p style="color:green;">🎉 Your property has been verified!</p>'
              : status === 'rejected'
              ? '<p style="color:red;">Your property did not meet our standards.</p>'
              : `<p>Your property is currently being ${status}.</p>`
            }
          </div>
        </div>
        <div style="background:#333; padding:10px; 
                    border-radius:0 0 8px 8px; text-align:center;">
          <p style="color:white; margin:0; font-size:12px;">© 2026 ShortStay</p>
        </div>
      </div>
      `
    );

    res.status(200).json({ 
      message: `Verification status updated to ${status}`,
      property 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET HOST EARNINGS
// ─────────────────────────────────────────
exports.getEarnings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'confirmed' },
      include: [
        { 
          model: Property, 
          as: 'property',
          where: { host_id: req.user.user_id },
          attributes: ['title', 'address']
        },
        { model: Payment }
      ],
      order: [['booking_id', 'DESC']]
    });

    const totalEarnings = bookings.reduce((sum, booking) => {
      if (booking.payment) {
        return sum + parseFloat(booking.payment.amount);
      }
      return sum;
    }, 0);

    // Monthly breakdown
    const monthlyEarnings = {};
    bookings.forEach(booking => {
      if (booking.payment) {
        const month = booking.payment.payment_date
          ? new Date(booking.payment.payment_date).toLocaleString('default', { 
              month: 'long', 
              year:  'numeric' 
            })
          : 'Unknown';

        if (!monthlyEarnings[month]) monthlyEarnings[month] = 0;
        monthlyEarnings[month] += parseFloat(booking.payment.amount);
      }
    });

    res.status(200).json({
      total_earnings:   totalEarnings.toFixed(2),
      total_bookings:   bookings.length,
      monthly_earnings: monthlyEarnings,
      bookings: bookings.map(b => ({
        booking_id:    b.booking_id,
        property:      b.property.title,
        checkin_date:  b.checkin_date,
        checkout_date: b.checkout_date,
        total_price:   b.total_price,
        amount_paid:   b.payment ? b.payment.amount : 0,
        payment_date:  b.payment ? b.payment.payment_date : null,
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET HOST DASHBOARD
// ─────────────────────────────────────────
exports.getHostDashboard = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { host_id: req.user.user_id }
    });

    const propertyIds = properties.map(p => p.property_id);

    const bookings = await Booking.findAll({
      include: [{
        model: Property,
        as: 'property',
        where: { host_id: req.user.user_id }
      }]
    });

    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [{
          model: Property,
          as: 'property',
          where: { host_id: req.user.user_id }
        }]
      }]
    });

    const reviews = await Review.findAll({
      where: { property_id: { [Op.in]: propertyIds } }
    });

    const totalEarnings = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.status(200).json({
      properties: {
        total:    properties.length,
        approved: properties.filter(p => p.is_approved).length,
        pending:  properties.filter(p => !p.is_approved).length,
        verified: properties.filter(p => p.verification_badge).length,
      },
      bookings: {
        total:     bookings.length,
        pending:   bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      },
      earnings: {
        total: totalEarnings.toFixed(2),
      },
      reviews: {
        total:      reviews.length,
        avg_rating: avgRating,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};