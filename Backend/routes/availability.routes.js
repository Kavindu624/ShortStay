const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Public routes
router.get('/check',                          availabilityController.checkAvailability);
router.get('/:property_id',                   availabilityController.getAvailability);

// Host routes
router.post('/set',   auth, role('host'),     availabilityController.setAvailability);

module.exports = router;