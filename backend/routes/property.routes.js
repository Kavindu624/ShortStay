const express = require('express');
const router  = express.Router();
const propertyController = require('../controllers/property.controller');
const auth    = require('../middleware/auth.middleware');
const role    = require('../middleware/role.middleware');
const upload  = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createPropertyValidator } = require('../middleware/validators');

// ── Static named routes MUST come before /:id ──────────────────────────────

// Host routes
router.get('/host/my-properties',
  auth, role('host'),
  propertyController.getMyProperties
);

router.get('/host/earnings',
  auth, role('host'),
  propertyController.getEarnings
);

router.get('/host/dashboard',
  auth, role('host'),
  propertyController.getHostDashboard
);

// Admin routes
router.get('/admin/verification-requests',
  auth, role('admin'),
  propertyController.getVerificationRequests
);

// ── Public routes ──────────────────────────────────
router.get('/',    propertyController.getAllProperties);
router.get('/:id', propertyController.getProperty);

// ── Host routes ────────────────────────────────────
router.post('/',
  auth, role('host'),
  createPropertyValidator, validate,
  propertyController.createProperty
);

router.put('/:id',
  auth, role('host'),
  propertyController.updateProperty
);

router.delete('/:id',
  auth, role('host'),
  propertyController.deleteProperty
);

// ── Image routes ───────────────────────────────────
router.post('/:id/upload',
  auth, role('host'),
  upload.array('images', 10),
  propertyController.uploadImages
);

router.put('/:id/primary-image',
  auth, role('host'),
  propertyController.setPrimaryImage
);

router.delete('/:id/images/:image_id',
  auth, role('host'),
  propertyController.deleteImage
);

// ── Verification routes ────────────────────────────
router.put('/:id/request-verification',
  auth, role('host'),
  propertyController.requestVerification
);

router.delete('/:id/cancel-verification',
  auth, role('host'),
  propertyController.cancelVerification
);

router.put('/:id/verification-status',
  auth, role('admin', 'field_inspector'),
  propertyController.updateVerificationStatus
);

module.exports = router;
