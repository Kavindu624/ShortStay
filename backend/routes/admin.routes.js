const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const reportsController = require('../controllers/reports.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// User management

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *         description: Filter by role (guest, host, admin, etc.)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of all users
 *       403:
 *         description: Forbidden — admins only
 */
router.get('/users', auth, role('admin'), adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user account (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Forbidden — admins only
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', auth, role('admin'), adminController.deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/suspend:
 *   put:
 *     summary: Suspend a user account (admin only)
 *     tags: [Admin]
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
 *             type: object
 *             properties:
 *               reason: { type: string, example: 'Repeated policy violations' }
 *     responses:
 *       200:
 *         description: User suspended
 *       403:
 *         description: Forbidden — admins only
 */
router.put('/users/:id/suspend', auth, role('admin'), adminController.suspendUser);

/**
 * @swagger
 * /api/admin/users/{id}/unsuspend:
 *   put:
 *     summary: Unsuspend a user account (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User unsuspended
 *       403:
 *         description: Forbidden — admins only
 */
router.put('/users/:id/unsuspend', auth, role('admin'), adminController.unsuspendUser);

// Property management

/**
 * @swagger
 * /api/admin/properties:
 *   get:
 *     summary: Get all properties including pending ones (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *     responses:
 *       200:
 *         description: List of all properties
 */
router.get('/properties', auth, role('admin'), adminController.getAllProperties);

/**
 * @swagger
 * /api/admin/properties/{id}/approve:
 *   put:
 *     summary: Approve a property listing (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Property approved — now visible to public
 *       403:
 *         description: Forbidden
 */
router.put('/properties/:id/approve', auth, role('admin'), adminController.approveListing);

/**
 * @swagger
 * /api/admin/properties/{id}/reject:
 *   put:
 *     summary: Reject a property listing (admin only)
 *     tags: [Admin]
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
 *             type: object
 *             properties:
 *               reason: { type: string, example: 'Images do not match the description' }
 *     responses:
 *       200:
 *         description: Property rejected
 *       403:
 *         description: Forbidden
 */
router.put('/properties/:id/reject', auth, role('admin'), adminController.rejectListing);

// Dashboard and system monitoring

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System-wide statistics (users, bookings, revenue, etc.)
 *       403:
 *         description: Forbidden — admins only
 */
router.get('/dashboard', auth, role('admin'), adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/report:
 *   get:
 *     summary: Generate a full system report (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Full system report
 */
router.get('/report', auth, role('admin'), adminController.generateReport);

/**
 * @swagger
 * /api/admin/monitor:
 *   get:
 *     summary: Get system health and performance metrics (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System monitoring data
 */
router.get('/monitor', auth, role('admin'), adminController.getSystemMonitor);

/**
 * @swagger
 * /api/admin/user-activity-report:
 *   get:
 *     summary: Get user activity report (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User activity data
 */
router.get('/user-activity-report', auth, role('admin'), adminController.getUserActivityReport);

// Granular reports

/**
 * @swagger
 * /api/admin/reports/bookings:
 *   get:
 *     summary: Booking trends report (admin only, ?format=csv supported)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv] }
 *     responses:
 *       200:
 *         description: Booking report
 */
router.get('/reports/bookings', auth, role('admin'), reportsController.bookingReport);

/**
 * @swagger
 * /api/admin/reports/users:
 *   get:
 *     summary: User registration trend report (admin only, ?format=csv supported)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User registration data
 */
router.get('/reports/users', auth, role('admin'), reportsController.userRegistrationReport);

/**
 * @swagger
 * /api/admin/reports/properties:
 *   get:
 *     summary: Property approval report (admin only, ?format=csv supported)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Property approval/rejection statistics
 */
router.get('/reports/properties', auth, role('admin'), reportsController.propertyApprovalReport);

/**
 * @swagger
 * /api/admin/reports/complaints:
 *   get:
 *     summary: Complaint resolution report (admin only, ?format=csv supported)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Complaint resolution data
 */
router.get('/reports/complaints', auth, role('admin'), reportsController.complaintResolutionReport);

/**
 * @swagger
 * /api/admin/reports/activity:
 *   get:
 *     summary: Platform activity log report (admin only, ?format=csv supported)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Platform activity log
 */
router.get('/reports/activity', auth, role('admin'), reportsController.activityLogReport);

module.exports = router;