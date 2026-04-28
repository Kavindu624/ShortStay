const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
  createStaffValidator,
} = require('../middleware/validators');

// Public routes
router.post('/register', registerValidator,       validate, authController.register);
router.post('/login',    loginValidator,           validate, authController.login);

// Protected routes
router.get('/me',                auth,                                        authController.getMe);
router.put('/change-password',   auth, changePasswordValidator, validate,     authController.changePassword);
router.put('/update-profile',    auth, updateProfileValidator,  validate,     authController.updateProfile);
router.delete('/delete-account', auth,                                        authController.deleteAccount);

// Staff creation (Admin only)
router.post('/create-staff', auth, role('admin'), createStaffValidator, validate, authController.createStaff);

module.exports = router;

// Get membership level
router.get('/membership', auth, role('guest'), async (req, res) => {
  try {
    const { User } = require('../models/index');
    const { Booking } = require('../models/index');

    const user = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'name', 'email', 'membership_level']
    });

    const totalBookings = await Booking.count({
      where: { 
        guest_id: req.user.user_id,
        status: 'confirmed'
      }
    });

    // Calculate bookings needed for next level
    let nextLevel     = null;
    let bookingsNeeded = 0;

    if (user.membership_level === 'basic') {
      nextLevel      = 'silver';
      bookingsNeeded = 5 - totalBookings;
    } else if (user.membership_level === 'silver') {
      nextLevel      = 'gold';
      bookingsNeeded = 10 - totalBookings;
    } else {
      nextLevel      = 'You are at the highest level!';
      bookingsNeeded = 0;
    }

    res.status(200).json({
      user_id:          user.user_id,
      name:             user.name,
      email:            user.email,
      membership_level: user.membership_level,
      total_bookings:   totalBookings,
      next_level:       nextLevel,
      bookings_needed:  bookingsNeeded > 0 ? bookingsNeeded : 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});