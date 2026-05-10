const express  = require('express');
const router   = express.Router();
const inspectorController  = require('../controllers/inspector.controller');
const reportsController    = require('../controllers/reports.controller');
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

// ── Inspector report routes (?format=csv supported) ──────────────────────────
router.get('/reports/inspections',         auth, role('field_inspector'), reportsController.inspectionByDateReport);
router.get('/reports/success-rate',        auth, role('field_inspector'), reportsController.inspectionSuccessRateReport);
router.get('/reports/approved-vs-rejected',auth, role('field_inspector'), reportsController.approvedVsRejectedReport);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post('/assign',          auth, role('admin'),           inspectorController.assignInspector);
router.get('/all',              auth, role('admin'),           inspectorController.getAllInspections);

module.exports = router;