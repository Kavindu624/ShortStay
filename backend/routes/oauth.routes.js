const express = require('express');
const router  = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// INITIATE GOOGLE LOGIN
// Frontend calls this URL to start Google login
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

// GOOGLE CALLBACK
// Google redirects here after user logs in
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false
  }),
  (req, res) => {
    try {
      const user = req.user;

      // Check if suspended
      if (user.is_suspended) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=suspended`
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          email:   user.email,
          role:    user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user_id=${user.user_id}&role=${user.role}&name=${encodeURIComponent(user.name)}`
      );
    } catch (err) {
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=server_error`
      );
    }
  }
);

module.exports = router;