const express  = require('express');
const router   = express.Router();
const inspectorController  = require('../controllers/inspector.controller');
const reportsController    = require('../controllers/reports.controller');
const auth     = require('../middleware/auth.middleware');
const role     = require('../middleware/role.middleware');
const uploadInspection = require('../middleware/uploadInspection.middleware');

// ── Verifier routes ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/inspector/pending:
 *   get:
 *     summary: Get all properties pending inspection (verifier only)
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties awaiting inspection
 *       403:
 *         description: Forbidden — verifier only
 */
router.get('/pending', auth, role('verifier'), inspectorController.getPendingProperties);

/**
 * @swagger
 * /api/inspector/dashboard:
 *   get:
 *     summary: Get inspector dashboard overview
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inspector dashboard stats (assigned, completed, pending)
 *       403:
 *         description: Forbidden — verifier only
 */
router.get('/dashboard', auth, role('verifier'), inspectorController.getInspectorDashboard);

/**
 * @swagger
 * /api/inspector/history:
 *   get:
 *     summary: Get inspection history for the logged-in inspector
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Past inspection records
 *       403:
 *         description: Forbidden — verifier only
 */
router.get('/history', auth, role('verifier'), inspectorController.getInspectionHistory);

/**
 * @swagger
 * /api/inspector:
 *   get:
 *     summary: Get all inspections assigned to the logged-in inspector
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned inspections
 *       403:
 *         description: Forbidden — verifier only
 */
router.get('/', auth, role('verifier'), inspectorController.getInspections);

/**
 * @swagger
 * /api/inspector/submit:
 *   post:
 *     summary: Submit an inspection report for a property
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, result, notes]
 *             properties:
 *               property_id: { type: integer, example: 3 }
 *               result:      { type: string, enum: [passed, failed], example: 'passed' }
 *               notes:       { type: string, example: 'All safety standards met. Cleanliness is excellent.' }
 *     responses:
 *       201:
 *         description: Inspection report submitted
 *       403:
 *         description: Forbidden — verifier only
 */
router.post('/submit', auth, role('verifier'), inspectorController.submitInspection);

/**
 * @swagger
 * /api/inspector/badge/{property_id}:
 *   put:
 *     summary: Approve a verified badge for a property
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: property_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Badge approved — property is_verified becomes true
 *       403:
 *         description: Forbidden — verifier only
 */
router.put('/badge/:property_id', auth, role('verifier'), inspectorController.approveBadge);

/**
 * @swagger
 * /api/inspector/{inspection_id}/images:
 *   post:
 *     summary: Upload images for an inspection report (max 5)
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inspection_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Inspection evidence images (max 5)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post(
  '/:inspection_id/images',
  auth, role('verifier'),
  uploadInspection.array('images', 5),
  inspectorController.uploadInspectionImages
);

// ── Inspector report routes ──────────────────────────────────────────────────

/**
 * @swagger
 * /api/inspector/reports/inspections:
 *   get:
 *     summary: Inspection report by date range (verifier only, ?format=csv supported)
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv] }
 *         description: Response format
 *     responses:
 *       200:
 *         description: Inspection report
 */
router.get('/reports/inspections', auth, role('verifier'), reportsController.inspectionByDateReport);

/**
 * @swagger
 * /api/inspector/reports/success-rate:
 *   get:
 *     summary: Inspection pass/fail success rate report
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success rate statistics
 */
router.get('/reports/success-rate', auth, role('verifier'), reportsController.inspectionSuccessRateReport);

/**
 * @swagger
 * /api/inspector/reports/approved-vs-rejected:
 *   get:
 *     summary: Approved vs rejected properties report
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Approved vs rejected comparison data
 */
router.get('/reports/approved-vs-rejected', auth, role('verifier'), reportsController.approvedVsRejectedReport);

// ── Admin routes ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/inspector/assign:
 *   post:
 *     summary: Assign a verifier to a property (admin only)
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, inspector_id]
 *             properties:
 *               property_id:  { type: integer, example: 3 }
 *               inspector_id: { type: integer, example: 7 }
 *     responses:
 *       200:
 *         description: Inspector assigned
 *       403:
 *         description: Forbidden — admins only
 */
router.post('/assign', auth, role('admin'), inspectorController.assignInspector);

/**
 * @swagger
 * /api/inspector/all:
 *   get:
 *     summary: Get all inspections system-wide (admin only)
 *     tags: [Inspector]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All inspection records
 *       403:
 *         description: Forbidden — admins only
 */
router.get('/all', auth, role('admin'), inspectorController.getAllInspections);

module.exports = router;