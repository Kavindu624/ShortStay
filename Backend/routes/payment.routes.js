const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { processPaymentValidator } = require('../middleware/validators');

// Guest routes
router.post('/process',              auth, role('guest'),           processPaymentValidator, validate, paymentController.processPayment);
router.get('/receipt/:booking_id',   auth,                          paymentController.getReceipt);

// Payment Manager routes
router.get('/',                      auth, role('payment_manager'), paymentController.getAllPayments);
router.get('/report',                auth, role('payment_manager'), paymentController.generateReport);

module.exports = router;