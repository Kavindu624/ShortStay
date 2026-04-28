const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createBookingValidator } = require('../middleware/validators');

// Guest routes
router.post('/',            auth, role('guest'), createBookingValidator, validate, bookingController.makeBooking);
router.get('/my',           auth, role('guest'), bookingController.getMyBookings);
router.put('/:id/cancel',   auth, role('guest'), bookingController.cancelBooking);

// Host routes
router.get('/host',         auth, role('host'),  bookingController.getHostBookings);
router.put('/:id/approve',  auth, role('host'),  bookingController.approveBooking);

// Shared
router.get('/:id',          auth,                bookingController.getBooking);

module.exports = router;