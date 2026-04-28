const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// User management
router.get('/users',                    auth, role('admin'), adminController.getAllUsers);
router.delete('/users/:id',             auth, role('admin'), adminController.deleteUser);

// Property management
router.get('/properties',               auth, role('admin'), adminController.getAllProperties);
router.put('/properties/:id/approve',   auth, role('admin'), adminController.approveListing);
router.put('/properties/:id/reject',    auth, role('admin'), adminController.rejectListing);

// Dashboard and reports
router.get('/dashboard',                auth, role('admin'), adminController.getDashboardStats);
router.get('/report',                   auth, role('admin'), adminController.generateReport);

module.exports = router;