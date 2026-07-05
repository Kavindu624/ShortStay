const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, controller.getSettings);
router.put('/', protect, controller.updateSettings);

module.exports = router;
