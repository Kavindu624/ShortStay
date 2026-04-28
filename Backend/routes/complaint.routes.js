const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createComplaintValidator } = require('../middleware/validators');

router.post('/',    auth, role('guest'), createComplaintValidator, validate, complaintController.createComplaint);
router.get('/',     auth, role('admin'), complaintController.getAllComplaints);
router.put('/:id',  auth, role('admin'), complaintController.updateComplaintStatus);

module.exports = router;