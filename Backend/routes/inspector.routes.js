const express  = require('express');
const router   = express.Router();
const inspectorController  = require('../controllers/inspector.controller');
const auth     = require('../middleware/auth.middleware');
const role     = require('../middleware/role.middleware');
const uploadInspection = require('../middleware/uploadInspection.middleware');

// ── Field Inspector routes ────────────────────────────────────────────────────
router.get('/pending',          auth, role('field_inspector'), inspectorController.getPendingProperties);
router.get('/dashboard',        auth, role('field_inspector'), inspectorController.getInspectorDashboard);
router.get('/history',          auth, role('field_inspector'), inspectorController.getInspectionHistory);
router.get('/',                 auth, role('field_inspector'), inspectorController.getInspections);

router.post('/submit',          auth, role('field_inspector'), inspectorController.submitInspection);
router.put('/badge/:property_id', auth, role('field_inspector'), inspectorController.approveBadge);

// Image upload for a specific inspection report
router.post(
  '/:inspection_id/images',
  auth, role('field_inspector'),
  uploadInspection.array('images', 5),
  inspectorController.uploadInspectionImages
);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post('/assign',          auth, role('admin'),           inspectorController.assignInspector);
router.get('/all',              auth, role('admin'),           inspectorController.getAllInspections);

module.exports = router;