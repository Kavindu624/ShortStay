const express = require('express');
const router = express.Router();
const inspectorController = require('../controllers/inspector.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/',                     auth, role('field_inspector'), inspectorController.getInspections);
router.post('/',                    auth, role('field_inspector'), inspectorController.submitInspection);
router.put('/badge/:property_id',   auth, role('field_inspector'), inspectorController.approveBadge);

module.exports = router;