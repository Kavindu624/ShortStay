const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const reportsController = require('../controllers/reports.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { processPaymentValidator } = require('../middleware/validators');

// ── Guest routes ──────────────────────────────────────────────────────────────
router.post('/process',              auth, role('guest'),           processPaymentValidator, validate, paymentController.processPayment);
router.get('/receipt/:booking_id',   auth,                          paymentController.getReceipt);

// ── Payment Manager routes ────────────────────────────────────────────────────
router.get('/',                      auth, role('payment_manager'), paymentController.getAllPayments);
router.get('/report',                auth, role('payment_manager'), paymentController.generateReport);

// ── Payment Manager report sub-routes (?format=csv supported) ────────────────
router.get('/reports/monthly',       auth, role('payment_manager'), reportsController.monthlyRevenueReport);
router.get('/reports/by-property',   auth, role('payment_manager'), reportsController.revenueByPropertyReport);
router.get('/reports/by-date',       auth, role('payment_manager'), reportsController.revenueByDateReport);
router.get('/reports/refunds',       auth, role('payment_manager'), reportsController.refundsReport);
router.get('/reports/host-payouts',  auth, role('payment_manager'), reportsController.hostPayoutsReport);

module.exports = router;