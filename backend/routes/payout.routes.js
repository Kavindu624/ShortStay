const express = require('express');
const router  = express.Router();
const payoutController = require('../controllers/payout.controller');
const auth  = require('../middleware/auth.middleware');
const role  = require('../middleware/role.middleware');

/**
 * @swagger
 * /api/payouts/my-payouts:
 *   get:
 *     summary: Get all payouts for the logged-in host
 *     tags: [Payouts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of host's payouts
 *       403:
 *         description: Forbidden — hosts only
 */
router.get('/my-payouts', auth, role('host'), payoutController.getMyPayouts);

/**
 * @swagger
 * /api/payouts/summary:
 *   get:
 *     summary: Get commission and platform revenue summary (payment_manager only)
 *     tags: [Payouts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Commission summary data
 *       403:
 *         description: Forbidden — payment_manager only
 */
router.get('/summary', auth, role('payment_manager'), payoutController.getCommissionSummary);

/**
 * @swagger
 * /api/payouts:
 *   get:
 *     summary: Get all payouts with optional filters (payment_manager only)
 *     tags: [Payouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, processed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Paginated payout list
 *       403:
 *         description: Forbidden — payment_manager only
 */
router.get('/', auth, role('payment_manager'), payoutController.getAllPayouts);

/**
 * @swagger
 * /api/payouts/host/{host_id}:
 *   get:
 *     summary: Get payouts for a specific host (payment_manager only)
 *     tags: [Payouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: host_id
 *         required: true
 *         schema: { type: integer }
 *         description: Host user ID
 *     responses:
 *       200:
 *         description: Payout list for the host
 *       403:
 *         description: Forbidden — payment_manager only
 */
router.get('/host/:host_id', auth, role('payment_manager'), payoutController.getPayoutsByHost);

/**
 * @swagger
 * /api/payouts/generate/{booking_id}:
 *   post:
 *     summary: Generate a payout record from a completed booking (payment_manager only)
 *     tags: [Payouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Payout record generated
 *       400:
 *         description: Booking not completed or payout already exists
 *       403:
 *         description: Forbidden — payment_manager only
 */
router.post('/generate/:booking_id', auth, role('payment_manager'), payoutController.generatePayout);

/**
 * @swagger
 * /api/payouts/process/{payout_id}:
 *   post:
 *     summary: Process (approve and send) a payout to host (payment_manager only)
 *     tags: [Payouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payout_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payout processed and sent to host
 *       400:
 *         description: Payout already processed
 *       403:
 *         description: Forbidden — payment_manager only
 */
router.post('/process/:payout_id', auth, role('payment_manager'), payoutController.processPayout);

module.exports = router;
