const express = require('express');
const router  = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/guest',           auth, role('guest'),           dashboardController.guestDashboard);
router.get('/host',            auth, role('host'),            dashboardController.hostDashboard);
router.get('/admin',           auth, role('admin'),           dashboardController.adminDashboard);
router.get('/payment-manager', auth, role('payment_manager'), dashboardController.paymentManagerDashboard);
router.get('/inspector',       auth, role('field_inspector'), dashboardController.inspectorDashboard);

module.exports = router;
