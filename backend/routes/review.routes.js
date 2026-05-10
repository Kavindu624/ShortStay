const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewValidator } = require('../middleware/validators');

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/property/:property_id',                        reviewController.getPropertyReviews);

// ── Guest ────────────────────────────────────────────────────────────────────
router.post('/',         auth, role('guest'), createReviewValidator, validate, reviewController.createReview);
router.put('/:id',       auth, role('guest'), reviewController.editReview);
router.delete('/:id',    auth, role('guest'), reviewController.deleteReview);
router.get('/my',        auth, role('guest'), reviewController.getMyReviews);

// ── Host ─────────────────────────────────────────────────────────────────────
router.put('/:id/respond', auth, role('host'), reviewController.respondToReview);
router.get('/host',        auth, role('host'), reviewController.getHostReviews);

module.exports = router;