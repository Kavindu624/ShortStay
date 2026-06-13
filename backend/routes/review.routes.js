const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewValidator } = require('../middleware/validators');

/**
 * @swagger
 * /api/reviews/property/{property_id}:
 *   get:
 *     summary: Get all reviews for a specific property (public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: property_id
 *         required: true
 *         schema: { type: integer }
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/property/:property_id', reviewController.getPropertyReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a review for a completed booking (guest only)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id, rating, comment]
 *             properties:
 *               booking_id: { type: integer, example: 5 }
 *               rating:     { type: integer, minimum: 1, maximum: 5, example: 4 }
 *               comment:    { type: string, example: 'Great place, very clean and quiet!' }
 *     responses:
 *       201:
 *         description: Review submitted
 *       400:
 *         description: Booking not completed or already reviewed
 *       403:
 *         description: Forbidden — guests only
 */
router.post('/', auth, role('guest'), createReviewValidator, validate, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Edit an existing review (guest only — must be own review)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Review ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:  { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string, example: 'Updated: even better than I remembered!' }
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', auth, role('guest'), reviewController.editReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (guest only — must be own review)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', auth, role('guest'), reviewController.deleteReview);

/**
 * @swagger
 * /api/reviews/my:
 *   get:
 *     summary: Get all reviews written by the logged-in guest
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of guest's reviews
 *       403:
 *         description: Forbidden — guests only
 */
router.get('/my', auth, role('guest'), reviewController.getMyReviews);

/**
 * @swagger
 * /api/reviews/{id}/respond:
 *   put:
 *     summary: Host responds to a review on their property
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [response]
 *             properties:
 *               response: { type: string, example: 'Thank you for the kind words!' }
 *     responses:
 *       200:
 *         description: Response added to review
 *       403:
 *         description: Forbidden — hosts only
 */
router.put('/:id/respond', auth, role('host'), reviewController.respondToReview);

/**
 * @swagger
 * /api/reviews/host:
 *   get:
 *     summary: Get all reviews for the host's properties
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews for host's properties
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/host', auth, role('host'), reviewController.getHostReviews);

module.exports = router;