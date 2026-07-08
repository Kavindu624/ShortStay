const express = require('express');
const router  = express.Router();
const pc  = require('../controllers/payment.controller');
const rc  = require('../controllers/reports.controller');
const auth    = require('../middleware/auth.middleware');
const role    = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { processPaymentValidator, stripeIntentValidator, refundValidator } = require('../middleware/validators');

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe webhook endpoint (called by Stripe — do not call manually)
 *     tags: [Payments]
 *     description: |
 *       This endpoint receives raw webhook events from Stripe. It is NOT called by the frontend.
 *       Stripe calls this automatically after payment events (payment_intent.succeeded, etc.)
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/webhook', pc.stripeWebhook);

// ── Guest routes ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Process a payment for a booking (guest only — non-Stripe flow)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id, payment_method]
 *             properties:
 *               booking_id:     { type: integer, example: 5 }
 *               payment_method: { type: string, example: 'card' }
 *     responses:
 *       200:
 *         description: Payment processed
 *       403:
 *         description: Forbidden — guests only
 */
router.post('/process', auth, role('guest'), processPaymentValidator, validate, pc.processPayment);

/**
 * @swagger
 * /api/payments/stripe/intent:
 *   post:
 *     summary: Create a Stripe PaymentIntent (guest only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Returns a `clientSecret` that the frontend uses with Stripe Elements to confirm payment.
 *       ```js
 *       const { clientSecret } = await api.post('/payments/stripe/intent', { booking_id });
 *       // Then use stripe.confirmCardPayment(clientSecret, { payment_method: ... })
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id]
 *             properties:
 *               booking_id: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: PaymentIntent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret: { type: string, example: 'pi_3xxx_secret_yyy' }
 *       403:
 *         description: Forbidden — guests only
 */
router.post('/stripe/intent', auth, role('guest'), stripeIntentValidator, validate, pc.createPaymentIntent);

/**
 * @swagger
 * /api/payments/stripe/confirm:
 *   post:
 *     summary: Confirm a Stripe payment after frontend completes card entry
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payment_intent_id]
 *             properties:
 *               payment_intent_id: { type: string, example: 'pi_3xxx' }
 *     responses:
 *       200:
 *         description: Payment confirmed and booking updated
 */
router.post('/stripe/confirm', auth, role('guest'), pc.confirmStripePayment);

/**
 * @swagger
 * /api/payments/retry/{payment_id}:
 *   post:
 *     summary: Retry a failed payment (guest only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment retried
 */
router.post('/retry/:payment_id', auth, role('guest'), pc.retryPayment);

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Get payment history for the logged-in user
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments made by the user
 */
router.get('/my-payments', auth, pc.getMyPayments);

/**
 * @swagger
 * /api/payments/receipt/{booking_id}:
 *   get:
 *     summary: Get payment receipt for a specific booking
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Receipt data
 *       404:
 *         description: Receipt not found
 */
router.get('/receipt/:booking_id', auth, pc.getReceipt);

// ── Dispute routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/payments/disputes:
 *   post:
 *     summary: Raise a payment dispute (guest only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id, reason]
 *             properties:
 *               booking_id: { type: integer, example: 5 }
 *               reason:     { type: string, example: 'Property did not match the description' }
 *     responses:
 *       201:
 *         description: Dispute raised
 *       403:
 *         description: Forbidden — guests only
 */
router.post('/disputes', auth, role('guest'), pc.raiseDispute);

/**
 * @swagger
 * /api/payments/disputes:
 *   get:
 *     summary: Get all disputes (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all disputes
 *       403:
 *         description: Forbidden — accountant only
 */
router.get('/disputes', auth, role('accountant'), pc.getAllDisputes);

/**
 * @swagger
 * /api/payments/disputes/{id}/resolve:
 *   put:
 *     summary: Resolve a dispute (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Dispute ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution]
 *             properties:
 *               resolution: { type: string, example: 'Refund approved after review' }
 *     responses:
 *       200:
 *         description: Dispute resolved
 */
router.put('/disputes/:id/resolve', auth, role('accountant'), pc.resolveDispute);

// ── Accountant routes ──────────────────────────────────────────────────

/**
 * @swagger
 * /api/payments/failed:
 *   get:
 *     summary: Get all failed payments (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of failed payments
 */
router.get('/failed', auth, role('accountant'), pc.getFailedPayments);

/**
 * @swagger
 * /api/payments/pending:
 *   get:
 *     summary: Get all pending payments (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending payments
 */
router.get('/pending', auth, role('accountant'), pc.getPendingPayments);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
 */
router.get('/', auth, role('accountant', 'admin'), pc.getAllPayments);

/**
 * @swagger
 * /api/payments/report:
 *   get:
 *     summary: Generate payment report (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment report data
 */
router.get('/report', auth, role('admin', 'accountant'), pc.generateReport);

/**
 * @swagger
 * /api/payments/refund/{booking_id}:
 *   post:
 *     summary: Issue a full refund for a booking (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: 'Host cancelled last minute' }
 *     responses:
 *       200:
 *         description: Refund issued
 */
router.post('/refund/:booking_id', auth, role('accountant'), refundValidator, validate, pc.refundPayment);

/**
 * @swagger
 * /api/payments/refund/{booking_id}/partial:
 *   post:
 *     summary: Issue a partial refund (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 50.00 }
 *               reason: { type: string, example: 'Partial service failure' }
 *     responses:
 *       200:
 *         description: Partial refund issued
 */
router.post('/refund/:booking_id/partial', auth, role('accountant'), pc.partialRefund);

/**
 * @swagger
 * /api/payments/status/{payment_id}:
 *   put:
 *     summary: Manually update payment status (accountant only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payment_id
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
 *               status: { type: string, enum: [pending, completed, failed, refunded], example: 'completed' }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/status/:payment_id', auth, role('accountant'), pc.updatePaymentStatus);

// ── Accountant report sub-routes ──────────────────────────────────────

/**
 * @swagger
 * /api/payments/reports/monthly:
 *   get:
 *     summary: Monthly revenue report (admin & accountant)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly revenue data
 */
router.get('/reports/monthly', auth, role('admin', 'accountant'), rc.monthlyRevenueReport);

/**
 * @swagger
 * /api/payments/reports/by-property:
 *   get:
 *     summary: Revenue breakdown by property (admin & accountant)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue per property
 */
router.get('/reports/by-property', auth, role('admin', 'accountant'), rc.revenueByPropertyReport);

/**
 * @swagger
 * /api/payments/reports/by-date:
 *   get:
 *     summary: Revenue breakdown by date range (admin & accountant)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Revenue by date
 */
router.get('/reports/by-date', auth, role('admin', 'accountant'), rc.revenueByDateReport);

/**
 * @swagger
 * /api/payments/reports/refunds:
 *   get:
 *     summary: Refund activity report (admin & accountant)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Refund data
 */
router.get('/reports/refunds', auth, role('admin', 'accountant'), rc.refundsReport);

/**
 * @swagger
 * /api/payments/reports/host-payouts:
 *   get:
 *     summary: Host payout report (admin & accountant)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Host payout history
 */
router.get('/reports/host-payouts', auth, role('admin', 'accountant'), rc.hostPayoutsReport);

module.exports = router;