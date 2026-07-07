const express = require('express');
const router  = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

/**
 * @swagger
 * /api/dashboard/guest:
 *   get:
 *     summary: Get guest dashboard (upcoming bookings, spending, etc.)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Guest dashboard data
 *       403:
 *         description: Forbidden — guests only
 */
router.get('/guest', auth, role('guest'), dashboardController.guestDashboard);

/**
 * @swagger
 * /api/dashboard/host:
 *   get:
 *     summary: Get host dashboard (properties, bookings, earnings overview)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Host dashboard data
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/host', auth, role('host'), dashboardController.hostDashboard);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard (system-wide stats, pending approvals)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *       403:
 *         description: Forbidden — admins only
 */
router.get('/admin', auth, role('admin'), dashboardController.adminDashboard);

/**
 * @swagger
 * /api/dashboard/payment-manager:
 *   get:
 *     summary: Get accountant dashboard (payments, disputes, payouts)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment manager dashboard data
 *       403:
 *         description: Forbidden — accountant only
 */
router.get('/payment-manager', auth, role('accountant'), dashboardController.paymentManagerDashboard);

/**
 * @swagger
 * /api/dashboard/inspector:
 *   get:
 *     summary: Get verifier dashboard (assigned inspections, completed count)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inspector dashboard data
 *       403:
 *         description: Forbidden — verifier only
 */
router.get('/inspector', auth, role('verifier'), dashboardController.inspectorDashboard);

module.exports = router;
