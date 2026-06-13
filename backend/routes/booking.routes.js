const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createBookingValidator } = require('../middleware/validators');

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Make a booking for a property (guest only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created — status is "pending" until host approves
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Property not available for selected dates
 *       403:
 *         description: Forbidden — guests only
 */
router.post('/', auth, role('guest'), createBookingValidator, validate, bookingController.makeBooking);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Get all bookings made by the logged-in guest
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of guest's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Forbidden — guests only
 */
router.get('/my', auth, role('guest'), bookingController.getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking (guest only — must be own booking)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       403:
 *         description: Forbidden or booking cannot be cancelled
 *       404:
 *         description: Booking not found
 */
router.put('/:id/cancel', auth, role('guest'), bookingController.cancelBooking);

/**
 * @swagger
 * /api/bookings/host:
 *   get:
 *     summary: Get all bookings for the host's properties
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings for host's properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/host', auth, role('host'), bookingController.getHostBookings);

/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   put:
 *     summary: Approve a pending booking (host only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking approved
 *       403:
 *         description: Forbidden — hosts only
 *       404:
 *         description: Booking not found
 */
router.put('/:id/approve', auth, role('host'), bookingController.approveBooking);

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   put:
 *     summary: Reject a pending booking (host only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking rejected
 *       403:
 *         description: Forbidden — hosts only
 *       404:
 *         description: Booking not found
 */
router.put('/:id/reject', auth, role('host'), bookingController.rejectBooking);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a specific booking by ID (guest or host involved in the booking)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.get('/:id', auth, bookingController.getBooking);

module.exports = router;