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
        // Link Google to existing account — only add google_id.
        // auth_provider is intentionally NOT changed so the user
        // can still login with their local password.
        await user.update({ google_id: googleId });
        return done(null, user);
      }

      // Get role from state, default to guest
      const requestedRole = req.query.state === 'host' ? 'host' : 'guest';

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