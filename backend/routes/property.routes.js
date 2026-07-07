const express = require('express');
const router  = express.Router();
const propertyController = require('../controllers/property.controller');
const auth    = require('../middleware/auth.middleware');
const role    = require('../middleware/role.middleware');
const upload  = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createPropertyValidator } = require('../middleware/validators');

// ── Static named routes MUST come before /:id ──────────────────────────────

/**
 * @swagger
 * /api/properties/host/my-properties:
 *   get:
 *     summary: Get all properties listed by the logged-in host
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of host's properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/host/my-properties',
  auth, role('host'),
  propertyController.getMyProperties
);

/**
 * @swagger
 * /api/properties/host/earnings:
 *   get:
 *     summary: Get earnings summary for the logged-in host
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Host earnings data
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/host/earnings',
  auth, role('host'),
  propertyController.getEarnings
);

/**
 * @swagger
 * /api/properties/host/dashboard:
 *   get:
 *     summary: Get host dashboard overview (bookings, revenue, occupancy)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Host dashboard stats
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/host/dashboard',
  auth, role('host'),
  propertyController.getHostDashboard
);

/**
 * @swagger
 * /api/properties/admin/verification-requests:
 *   get:
 *     summary: Get all properties pending verification (admin only)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties awaiting verification
 *       403:
 *         description: Forbidden — admins only
 */
router.get('/admin/verification-requests',
  auth, role('admin'),
  propertyController.getVerificationRequests
);

// ── Public routes ──────────────────────────────────

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all approved properties (public — no auth required)
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *         description: Filter by location keyword
 *       - in: query
 *         name: min_price
 *         schema: { type: number }
 *         description: Minimum price per night
 *       - in: query
 *         name: max_price
 *         schema: { type: number }
 *         description: Maximum price per night
 *       - in: query
 *         name: max_guests
 *         schema: { type: integer }
 *         description: Minimum guest capacity
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 total: { type: integer }
 *                 page:  { type: integer }
 */
router.get('/', propertyController.getAllProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a single property by ID (public)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
router.get('/:id', propertyController.getProperty);

// ── Host routes ────────────────────────────────────

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property listing (host only)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       201:
 *         description: Property created — status is "pending" until approved by admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       403:
 *         description: Forbidden — hosts only
 */
router.post('/',
  auth, role('host'),
  createPropertyValidator, validate,
  propertyController.createProperty
);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property listing (host only — must be owner)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */
router.put('/:id',
  auth, role('host'),
  propertyController.updateProperty
);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property listing (host only — must be owner)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Property deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */
router.delete('/:id',
  auth, role('host'),
  propertyController.deleteProperty
);

// ── Image routes ───────────────────────────────────

/**
 * @swagger
 * /api/properties/{id}/upload:
 *   post:
 *     summary: Upload images for a property (host only — max 10 images)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 description: Image files (max 10)
 *     responses:
 *       200:
 *         description: Images uploaded. Accessible at http://localhost:5000/uploads/<filename>
 *       403:
 *         description: Forbidden
 */
router.post('/:id/upload',
  auth, role('host'),
  upload.array('images', 10),
  propertyController.uploadImages
);

/**
 * @swagger
 * /api/properties/{id}/primary-image:
 *   put:
 *     summary: Set a primary (thumbnail) image for a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image_id]
 *             properties:
 *               image_id: { type: integer, example: 3 }
 *     responses:
 *       200:
 *         description: Primary image updated
 */
router.put('/:id/primary-image',
  auth, role('host'),
  propertyController.setPrimaryImage
);

/**
 * @swagger
 * /api/properties/{id}/images/{image_id}:
 *   delete:
 *     summary: Delete a specific image from a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Property ID
 *       - in: path
 *         name: image_id
 *         required: true
 *         schema: { type: integer }
 *         description: Image ID to delete
 *     responses:
 *       200:
 *         description: Image deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id/images/:image_id',
  auth, role('host'),
  propertyController.deleteImage
);

// ── Verification routes ────────────────────────────

/**
 * @swagger
 * /api/properties/{id}/request-verification:
 *   put:
 *     summary: Request a field inspection/verification for a property
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Verification requested — an inspector will be assigned
 *       403:
 *         description: Forbidden — hosts only
 */
router.put('/:id/request-verification',
  auth, role('host'),
  propertyController.requestVerification
);

/**
 * @swagger
 * /api/properties/{id}/cancel-verification:
 *   delete:
 *     summary: Cancel a pending verification request
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Verification request cancelled
 */
router.delete('/:id/cancel-verification',
  auth, role('host'),
  propertyController.cancelVerification
);

/**
 * @swagger
 * /api/properties/{id}/verification-status:
 *   put:
 *     summary: Update verification status (admin or verifier only)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [approved, rejected], example: 'approved' }
 *               notes:  { type: string, example: 'All requirements met.' }
 *     responses:
 *       200:
 *         description: Verification status updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id/verification-status',
  auth, role('admin', 'verifier'),
  propertyController.updateVerificationStatus
);

module.exports = router;