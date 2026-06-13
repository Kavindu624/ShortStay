const express = require('express');
const router  = express.Router();
const profileController   = require('../controllers/profile.controller');
const auth                = require('../middleware/auth.middleware');
const role                = require('../middleware/role.middleware');
const uploadProfile       = require('../middleware/uploadProfile.middleware');

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the full profile of the logged-in user
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *                 role:
 *                   type: string
 *                   example: guest
 *                 profile_picture:
 *                   type: string
 *                   example: "/uploads/profiles/avatar.jpg"
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update basic profile info (any logged-in user)
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string, example: 'Jane Doe' }
 *               phone: { type: string, example: '+94771234567' }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/', auth, profileController.updateBasicProfile);

/**
 * @swagger
 * /api/profile/address:
 *   put:
 *     summary: Update guest address (guest only)
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address_line1: { type: string, example: '123 Main Street' }
 *               city:          { type: string, example: 'Colombo' }
 *               country:       { type: string, example: 'Sri Lanka' }
 *               postal_code:   { type: string, example: '00300' }
 *     responses:
 *       200:
 *         description: Address updated
 *       403:
 *         description: Forbidden — guests only
 */
router.put('/address', auth, role('guest'), profileController.updateGuestAddress);

/**
 * @swagger
 * /api/profile/bank-details:
 *   put:
 *     summary: Update host bank details for payouts (host only)
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bank_name:      { type: string, example: 'Bank of Ceylon' }
 *               account_number: { type: string, example: '0012345678' }
 *               account_holder: { type: string, example: 'John Doe' }
 *     responses:
 *       200:
 *         description: Bank details updated
 *       403:
 *         description: Forbidden — hosts only
 */
router.put('/bank-details', auth, role('host'), profileController.updateHostBankDetails);

/**
 * @swagger
 * /api/profile/picture:
 *   post:
 *     summary: Upload a profile picture
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the profile picture
 *     responses:
 *       200:
 *         description: Profile picture uploaded. Accessible at http://localhost:5000/uploads/profiles/<filename>
 */
router.post('/picture', auth, uploadProfile.single('profile_picture'), profileController.uploadProfilePicture);

/**
 * @swagger
 * /api/profile/picture:
 *   delete:
 *     summary: Delete the profile picture
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture deleted
 */
router.delete('/picture', auth, profileController.deleteProfilePicture);

/**
 * @swagger
 * /api/profile/account:
 *   delete:
 *     summary: Delete the logged-in user's own account
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/account', auth, profileController.deleteAccount);

/**
 * @swagger
 * /api/profile/export:
 *   get:
 *     summary: Export all your personal data (GDPR — right to data portability)
 *     description: |
 *       Returns a downloadable JSON file containing all personal data ShortStay holds
 *       about the logged-in user — profile, bookings, payments, reviews, complaints,
 *       and notifications. Complies with GDPR Article 20 (Right to Data Portability).
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: JSON file containing all personal data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exported_at:       { type: string, format: date-time }
 *                 export_note:       { type: string }
 *                 profile:           { type: object }
 *                 bookings_as_guest: { type: array, items: { type: object } }
 *                 bookings_as_host:  { type: array, items: { type: object } }
 *                 payments:          { type: array, items: { type: object } }
 *                 reviews:           { type: array, items: { type: object } }
 *                 complaints:        { type: array, items: { type: object } }
 *                 notifications:     { type: array, items: { type: object } }
 *       401:
 *         description: Unauthorized
 */
router.get('/export', auth, profileController.exportMyData);


/**
 * @swagger
 * /api/profile/{user_id}:
 *   get:
 *     summary: View any user's profile (admin only)
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *         description: ID of the user to view
 *     responses:
 *       200:
 *         description: User profile data
 *       403:
 *         description: Forbidden — admins only
 *       404:
 *         description: User not found
 */
router.get('/:user_id', auth, role('admin'), profileController.getUserProfile);

module.exports = router;