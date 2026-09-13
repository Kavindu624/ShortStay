const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/index');
const sequelize = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email   = profile.emails[0].value;
      const googleId = profile.id;

      // Check if user exists with Google ID
      let user = await User.findOne({ where: { google_id: googleId } });

      if (user) {
        return done(null, user);
      }

      // Check if email already registered with local account
      user = await User.findOne({ where: { email } });

      if (user) {
        if (!user.is_verified) {
          // This account was never email-verified — we cannot assume whoever
          // originally registered this address is the same person completing
          // Google sign-in right now. (An attacker can pre-register any email
          // with a password of their choosing and simply never verify it,
          // hoping the real owner later links it via Google and inherits a
          // "verified" account the attacker's password still opens.)
          //
          // Google HAS just proven that the person in front of us controls
          // this mailbox, so we honor that: link the account and mark it
          // verified. But we must not let a password nobody has proven
          // ownership of keep working — so it's cleared, forcing anyone who
          // wants password login to go through "forgot password" (which
          // itself requires access to this same, now Google-confirmed inbox).
          // Any existing session token for this account is invalidated too.
          await user.update({
            google_id: googleId,
            is_verified: true,
            password: null,
            tokens_valid_after: new Date(),
          });
        } else {
          // Already-verified account (owner proved email control at
          // registration time) — safe to just add Google as a login method.
          await user.update({ google_id: googleId });
        }
        return done(null, user);
      }

      // Get role and action from state
      const stateParts = (req.query.state || '').split('|');
      const requestedRole = stateParts[0] === 'host' ? 'host' : 'guest';
      const action = stateParts[1] || 'login';

      if (action === 'login') {
        return done(null, false, { message: 'Account_not_found._Please_register_first.' });
      }

      // Create new user
      const result = await sequelize.transaction(async (t) => {
        const newUser = await User.create({
          name:          profile.displayName,
          email:         email,
          phone:         null,
          password:      null,
          role:          requestedRole,
          google_id:     googleId,
          auth_provider: 'google',
          is_verified:   true, // Google has already verified this email
        }, { transaction: t });

        if (requestedRole === 'guest') {
          await sequelize.query(
            'INSERT INTO guest (user_id, address) VALUES (?, ?)',
            { replacements: [newUser.user_id, null], transaction: t }
          );
        } else if (requestedRole === 'host') {
          await sequelize.query(
            'INSERT INTO host (user_id, bank_details) VALUES (?, ?)',
            { replacements: [newUser.user_id, null], transaction: t }
          );
        }

        return newUser;
      });

      return done(null, result);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;