const express = require('express');
const router  = express.Router();
const authController = require('../controllers/auth.controller');
const auth    = require('../middleware/auth.middleware');
const role    = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
  createStaffValidator,
} = require('../middleware/validators');

// ── Public routes ──────────────────────────
router.post('/register',              registerValidator, validate, authController.register);
router.post('/login',                 loginValidator,    validate, authController.login);

// ── Email verification ─────────────────────
router.get('/verify-email/:token',                       authController.verifyEmail);
router.post('/resend-verification',                      authController.resendVerification);

// ── Forgot / Reset password ────────────────
router.post('/forgot-password',                          authController.forgotPassword);
router.post('/reset-password/:token',                    authController.resetPassword);

// ── Protected routes ───────────────────────
router.post('/logout',                auth,                                        authController.logout);
router.get('/me',                     auth,                                        authController.getMe);
router.put('/update-profile',         auth, updateProfileValidator,  validate,     authController.updateProfile);
router.put('/change-password',        auth, changePasswordValidator, validate,     authController.changePassword);
router.delete('/delete-account',      auth,                                        authController.deleteAccount);
router.get('/membership',             auth, role('guest'),                         authController.getMembership);

// ── Admin only ─────────────────────────────
router.post('/create-staff', auth, role('admin'), createStaffValidator, validate,  authController.createStaff);

module.exports = router;