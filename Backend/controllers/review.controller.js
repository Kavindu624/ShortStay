const { Review, Booking, Property, User } = require('../models/index');
const { updateOverallScore } = require('./property.controller');
const notify = require('../utils/notify');

// ─── HELPER — rating breakdown ───────────────────────────────────────────────
function buildBreakdown(reviews) {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating]++;
  });
  return breakdown;
}

// ─── CREATE REVIEW (Guest only) ───────────────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { booking_id, property_id, rating, comment } = req.body;

    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: Property, as: 'property' }],
    });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Can only review confirmed bookings' });
    }

    // Prevent duplicate reviews for the same booking
    const existing = await Review.findOne({ where: { booking_id } });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
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

    // Update property overall score
    await updateOverallScore(property_id);

    // Notify host that a new review was submitted (Feature 1)
    if (booking.property) {
      await notify(
        booking.property.host_id,
        'New Review Submitted ⭐',
        `A guest left a ${rating}-star review on your property "${booking.property.title}".`,
        'review_submitted',
        review.review_id
      );
    }

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET REVIEWS FOR A PROPERTY (Public) ─────────────────────────────────────
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
      }],
      order: [['review_id', 'DESC']],
    });

    const total_reviews  = reviews.length;
    const average_rating = total_reviews > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews).toFixed(2)
        )
      : null;

    res.status(200).json({
      total_reviews,
      average_rating,
      rating_breakdown: buildBreakdown(reviews), // Feature 6
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── DELETE REVIEW (Guest only) ───────────────────────────────────────────────
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

    const propertyId = review.property_id;
    await review.destroy();

    // Update property score after deletion
    await updateOverallScore(propertyId);

    res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── EDIT REVIEW (Guest only) — Feature 3 ────────────────────────────────────
exports.editReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findByPk(req.params.id, {
      include: [{ model: Booking }]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const updateData = {};
    if (rating  !== undefined) updateData.rating  = rating;
    if (comment !== undefined) updateData.comment = comment;

    await review.update(updateData);

    // Recalculate overall score if rating changed
    if (rating !== undefined) {
      await updateOverallScore(review.property_id);
    }

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── HOST RESPOND TO REVIEW (Host only) ──────────────────────────────────────
exports.respondToReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property' }]
      }]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.booking.property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (review.host_response) {
      return res.status(400).json({ message: 'Already responded to this review' });
    }

    await review.update({ 
      host_response: req.body.response,
      response_date: new Date(),
    });

    // Notify the guest that the host replied (Feature 2)
    await notify(
      review.booking.guest_id,
      'Host Responded to Your Review 💬',
      `The host of "${review.booking.property.title}" replied to your review.`,
      'review_response',
      review.review_id
    );

    res.status(200).json({ message: 'Response added successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET MY REVIEWS (Guest only) — Feature 4 ─────────────────────────────────
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{
        model: Booking,
        where: { guest_id: req.user.user_id },
        include: [{ model: Property, as: 'property', attributes: ['title', 'address'] }]
      }],
      order: [['review_id', 'DESC']],
    });

    res.status(200).json({
      total_reviews: reviews.length,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL REVIEWS FOR HOST PROPERTIES (Host only) — Feature 5 ─────────────
exports.getHostReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{
        model: Booking,
        include: [{
          model: Property,
          as: 'property',
          where: { host_id: req.user.user_id },
          attributes: ['title', 'address', 'property_id'],
        }, {
          model: User,
          as: 'guest',
          attributes: ['name'],
        }]
      }],
      order: [['review_id', 'DESC']],
    });

    const total_reviews  = reviews.length;
    const average_rating = total_reviews > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews).toFixed(2)
        )
      : null;

    res.status(200).json({
      total_reviews,
      average_rating,
      rating_breakdown: buildBreakdown(reviews),
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};