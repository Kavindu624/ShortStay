const express = require('express');
const router  = express.Router();
const profileController   = require('../controllers/profile.controller');
const auth                = require('../middleware/auth.middleware');
const role                = require('../middleware/role.middleware');
const uploadProfile       = require('../middleware/uploadProfile.middleware');

// Get full profile (any logged in user)
router.get('/',                   auth,              profileController.getProfile);

// Update basic profile (any logged in user)
router.put('/',                   auth,              profileController.updateBasicProfile);

// Update guest address (guest only)
router.put('/address',            auth, role('guest'), profileController.updateGuestAddress);

// Update host bank details (host only)
router.put('/bank-details',       auth, role('host'),  profileController.updateHostBankDetails);

// Profile picture
router.post('/picture',           auth, uploadProfile.single('profile_picture'), profileController.uploadProfilePicture);
router.delete('/picture',         auth,              profileController.deleteProfilePicture);

// Delete own account (self-service)
router.delete('/account',         auth,              profileController.deleteAccount);

// Admin — view any user profile
router.get('/:user_id',           auth, role('admin'), profileController.getUserProfile);

module.exports = router;