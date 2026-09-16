const express = require('express');
const router  = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [OAuth]
 *     description: |
 *       **Do NOT call this with axios/fetch.** The frontend must redirect the browser to this URL:
 *       ```
 *       window.location.href = 'http://localhost:5000/api/auth/google';
 *       ```
 *       Google handles the authentication and redirects back to `/api/auth/google/callback`.
 *     responses:
 *       302:
 *         description: Redirects browser to Google login page
 */
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback (handled by backend — do not call directly)
 *     tags: [OAuth]
 *     description: |
 *       Google redirects here after the user logs in. The backend then redirects to the frontend:
 *
 *       **On success:**
 *       ```
 *       {FRONTEND_URL}/auth/callback?token=<jwt>&user_id=<id>&role=<role>&name=<name>
 *       ```
 *       The frontend must read `token` from the URL and store it in `localStorage`.
 *
 *       **On failure:**
 *       ```
 *       {FRONTEND_URL}/login?error=google_failed
 *       ```
 *       **If user is suspended:**
 *       ```
 *       {FRONTEND_URL}/login?error=suspended
 *       ```
 *       **If the matched account isn't email-verified yet** (Google login is only
 *       allowed for already-verified users):
 *       ```
 *       {FRONTEND_URL}/login?error=not_verified
 *       ```
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *         description: Authorization code from Google (handled automatically)
 *     responses:
 *       302:
 *         description: Redirects to frontend with token or error
 */
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

      // Google login is only allowed for already-verified users — an
      // unverified account (found by matching email, not yet linked to
      // this Google ID) must complete normal email verification first.
      if (!user.is_verified) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=not_verified`
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

      // Redirect to frontend with the token in the URL FRAGMENT, not the query
      // string. Fragments (#...) are never sent to servers/proxies/CDNs, so
      // they never end up in access logs along the redirect chain — unlike a
      // query string, which would leak this 7-day session token into any log
      // that records full request URLs.
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback#token=${token}&user_id=${user.user_id}&role=${user.role}&name=${encodeURIComponent(user.name)}`
      );
    } catch (err) {
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=server_error`
      );
    }
  }
);

module.exports = router;