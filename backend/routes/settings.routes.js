const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, controller.getSettings);
router.put('/', auth, controller.updateSettings);

module.exports = router;
