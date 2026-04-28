const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewValidator } = require('../middleware/validators');

router.post('/',                      auth, role('guest'), createReviewValidator, validate, reviewController.createReview);
router.get('/property/:property_id',                       reviewController.getPropertyReviews);
router.delete('/:id',                 auth, role('guest'), reviewController.deleteReview);
router.put('/:id/respond',            auth, role('host'),  reviewController.respondToReview);

module.exports = router;