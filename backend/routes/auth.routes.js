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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully. A verification email is sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Registered successfully. Please verify your email.' }
 *       400:
 *         description: Validation error or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginValidator, validate, authController.login);

// ── Email verification ─────────────────────

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify email address using the token sent by email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Email verification token from the email link
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: 'john@example.com' }
 *     responses:
 *       200:
 *         description: Verification email resent
 *       404:
 *         description: User not found
 */
router.post('/resend-verification', authController.resendVerification);

// ── Forgot / Reset password ────────────────

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send a password reset link to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: 'john@example.com' }
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using the token from email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Password reset token from the email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password, example: 'NewSecret@123' }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password/:token', authController.resetPassword);

// ── Protected routes ───────────────────────

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate the current JWT token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', auth, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently logged-in user's info
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id: { type: integer, example: 1 }
 *                 name:    { type: string, example: 'John Doe' }
 *                 email:   { type: string, example: 'john@example.com' }
 *                 role:    { type: string, example: 'guest' }
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, authController.getMe);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update name or email of logged-in user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string, example: 'Jane Doe' }
 *               email: { type: string, format: email, example: 'jane@example.com' }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/update-profile', auth, updateProfileValidator, validate, authController.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change the password for the logged-in user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password: { type: string, format: password, example: 'OldSecret@123' }
 *               new_password:     { type: string, format: password, example: 'NewSecret@456' }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect current password
 */
router.put('/change-password', auth, changePasswordValidator, validate, authController.changePassword);

/**
 * @swagger
 * /api/auth/delete-account:
 *   delete:
 *     summary: Delete the logged-in user's own account
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete-account', auth, authController.deleteAccount);

/**
 * @swagger
 * /api/auth/membership:
 *   get:
 *     summary: Get membership/loyalty info for the logged-in guest
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Membership details returned
 *       403:
 *         description: Forbidden — guests only
 */
router.get('/membership', auth, role('guest'), authController.getMembership);

// ── Admin only ─────────────────────────────

/**
 * @swagger
 * /api/auth/create-staff:
 *   post:
 *     summary: Create a new staff account (admin only)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:     { type: string, example: 'Staff Member' }
 *               email:    { type: string, format: email, example: 'staff@shortstay.com' }
 *               password: { type: string, format: password, example: 'Staff@123' }
 *               role:     { type: string, enum: [payment_manager, field_inspector], example: 'field_inspector' }
 *     responses:
 *       201:
 *         description: Staff account created
 *       403:
 *         description: Forbidden — admins only
 */
router.post('/create-staff', auth, role('admin'), createStaffValidator, validate, authController.createStaff);

module.exports = router;