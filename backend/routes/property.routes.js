const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createPropertyValidator } = require('../middleware/validators');
const { Property } = require('../models/index');

// Public routes
router.get('/',     propertyController.getAllProperties);
router.get('/:id',  propertyController.getProperty);

// Host routes
router.post('/',      auth, role('host'), createPropertyValidator, validate, propertyController.createProperty);
router.put('/:id',    auth, role('host'), propertyController.updateProperty);
router.delete('/:id', auth, role('host'), propertyController.deleteProperty);
router.get('/host/my-properties', auth, role('host'), propertyController.getMyProperties);

// Verification routes
router.put('/:id/request-verification',  auth, role('host'),                    propertyController.requestVerification);
router.get('/admin/verification-requests', auth, role('admin'),                  propertyController.getVerificationRequests);
router.put('/:id/verification-status',   auth, role('admin','field_inspector'), propertyController.updateVerificationStatus);

// Image upload
router.post('/:id/upload', auth, role('host'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.host_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await property.update({ image: req.file.filename });
    res.status(200).json({ 
      message: 'Image uploaded successfully', 
      image_url: `http://localhost:5000/uploads/${req.file.filename}` 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;