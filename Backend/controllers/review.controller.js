const { Review, Booking, Property, User } = require('../models/index');

// CREATE REVIEW (Guest only)
exports.createReview = async (req, res) => {
  try {
    const { booking_id, property_id, rating, comment } = req.body;

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only review confirmed bookings' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({
      booking_id,
      property_id,
      rating,
      comment,
      review_date: new Date(),
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET REVIEWS FOR A PROPERTY (Public)
exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { property_id: req.params.property_id },
      include: [{
        model: Booking,
        include: [{ 
          model: User, 
          as: 'guest', 
          attributes: ['name'] 
        }]
      }]
    });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE REVIEW (Guest only)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{ model: Booking }]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.destroy();
    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// HOST RESPOND TO REVIEW (Host only) ← NEW
exports.respondToReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{
        model: Booking,
        include: [{
          model: Property,
          as: 'property'
        }]
      }]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check host owns the property
    if (review.booking.property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already responded
    if (review.host_response) {
      return res.status(400).json({ message: 'Already responded to this review' });
    }

    await review.update({ 
      host_response: req.body.response,
      response_date: new Date(),
    });

    res.status(200).json({ message: 'Response added successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};