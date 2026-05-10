const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const reportsController = require('../controllers/reports.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// User management
router.get('/users',                        auth, role('admin'), adminController.getAllUsers);
router.delete('/users/:id',                 auth, role('admin'), adminController.deleteUser);
router.put('/users/:id/suspend',            auth, role('admin'), adminController.suspendUser);
router.put('/users/:id/unsuspend',          auth, role('admin'), adminController.unsuspendUser);

// Property management
router.get('/properties',                   auth, role('admin'), adminController.getAllProperties);
router.put('/properties/:id/approve',       auth, role('admin'), adminController.approveListing);
router.put('/properties/:id/reject',        auth, role('admin'), adminController.rejectListing);

// Dashboard and system monitoring
router.get('/dashboard',                    auth, role('admin'), adminController.getDashboardStats);
router.get('/report',                       auth, role('admin'), adminController.generateReport);
router.get('/monitor',                      auth, role('admin'), adminController.getSystemMonitor);
router.get('/user-activity-report',         auth, role('admin'), adminController.getUserActivityReport);

// Granular reports (?format=csv supported)
router.get('/reports/bookings',             auth, role('admin'), reportsController.bookingReport);
router.get('/reports/users',                auth, role('admin'), reportsController.userRegistrationReport);
router.get('/reports/properties',           auth, role('admin'), reportsController.propertyApprovalReport);
router.get('/reports/complaints',           auth, role('admin'), reportsController.complaintResolutionReport);
router.get('/reports/activity',             auth, role('admin'), reportsController.activityLogReport);

module.exports = router;
