const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const sequelize = require('../config/db');
const { User } = require('../models/index');
const logActivity = require('../utils/activityLogger');
const notify   = require('../utils/notify');

const sendEmail = require('../utils/sendEmail');
const {
  emailVerificationTemplate,
  forgotPasswordTemplate,
  passwordResetSuccessTemplate,
  welcomeEmail,
} = require('../utils/emailTemplates');
require('dotenv').config();

// Brute-force constants (state is now persisted in the DB on the user record)
const MAX_ATTEMPTS = 5;
const LOCK_TIME    = 15 * 60 * 1000; // 15 minutes in ms

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, address, bank_details } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!['guest', 'host'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Only guest or host can register.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken         = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await sequelize.transaction(async (t) => {
      const user = await User.create({
        name,
        email,
        phone,
        password:                  hashedPassword,
        role,
        is_verified:               false,
        verification_token:        verificationToken,
        verification_token_expires: verificationTokenExpires,
      }, { transaction: t });

      if (role === 'guest') {
        await sequelize.query(
          'INSERT INTO guest (user_id, address) VALUES (?, ?)',
          { replacements: [user.user_id, address || null], transaction: t }
        );
      } else if (role === 'host') {
        await sequelize.query(
          'INSERT INTO host (user_id, bank_details) VALUES (?, ?)',
          { replacements: [user.user_id, bank_details || null], transaction: t }
        );
      }

      return user;
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email - ShortStay',
      emailVerificationTemplate(name, verificationUrl)
    );

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to ShortStay!',
      welcomeEmail(name, role)
    );

    // Notify all admins about the new registration
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(admin =>
      notify(
        admin.user_id,
        'New User Registered 👤',
        `A new ${role} has registered: ${name} (${email}).`,
        'new_user_registered',
        result.user_id
      )
    ));

    // Log registration
    await logActivity({
      user_id:   result.user_id,
      action:    'REGISTER',
      entity:    'user',
      entity_id: result.user_id,
      req,
      details:   { role: result.role, email: result.email },
    });

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        user_id:     result.user_id,
        name:        result.name,
        email:       result.email,
        role:        result.role,
        is_verified: false,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const user = await User.findOne({ 
      where: { verification_token: token } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid verification token' 
      });
    }

    // Check if token is expired
    if (new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).json({ 
        message: 'Verification token has expired. Please request a new one.' 
      });
    }

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({ 
        message: 'Email is already verified' 
      });
    }

    // Verify the user
    await user.update({
      is_verified:                true,
      verification_token:         null,
      verification_token_expires: null,
    });

    res.status(200).json({ 
      message: 'Email verified successfully! You can now login.' 
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// CHECK VERIFICATION STATUS (POLLING)
// ─────────────────────────────────────────
exports.checkVerification = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ isVerified: user.is_verified });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// RESEND VERIFICATION EMAIL
// ─────────────────────────────────────────
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new token
    const verificationToken        = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      verification_token:         verificationToken,
      verification_token_expires: verificationTokenExpires,
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email - ShortStay',
      emailVerificationTemplate(user.name, verificationUrl)
    );

    res.status(200).json({ 
      message: 'Verification email sent! Please check your inbox.' 
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ── DB-persisted brute-force check ──────────────────────────────────
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const remainingTime = Math.ceil(
        (new Date(user.locked_until) - Date.now()) / 60000
      );
      return res.status(429).json({
        message: `Too many failed login attempts. Try again in ${remainingTime} minutes.`,
      });
    }
    // Auto-reset when lock period has passed
    if (user.locked_until && new Date() >= new Date(user.locked_until)) {
      await user.update({ failed_login_count: 0, last_failed_login: null, locked_until: null });
    }

    // Check if suspended
    if (user.is_suspended) {
      return res.status(403).json({ 
        message: 'Your account has been suspended.',
        reason: user.suspended_reason || 'Please contact support.'
      });
    }

    // Block Google-only accounts (no password set) from password login
    if (!user.password) {
      return res.status(400).json({
        message: 'This account uses Google login. Please sign in with Google.',
      });
    }

    // Require email verification only for local-only accounts (no google_id)
    if (!user.google_id && !user.is_verified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in.',
        is_verified: false
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const newCount   = (user.failed_login_count || 0) + 1;
      const updateData = { failed_login_count: newCount, last_failed_login: new Date() };
      if (newCount >= MAX_ATTEMPTS) {
        updateData.locked_until = new Date(Date.now() + LOCK_TIME);
      }
      await user.update(updateData);

      const remainingAttempts = MAX_ATTEMPTS - newCount;
      return res.status(401).json({ 
        message:            'Invalid password',
        remaining_attempts: remainingAttempts > 0 ? remainingAttempts : 0,
      });
    }

    // Reset brute-force counters on successful login
    await user.update({ failed_login_count: 0, last_failed_login: null, locked_until: null });

    const expiresIn = remember_me ? '30d' : '7d';

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Get role specific data
    let roleData = {};
    if (user.role === 'guest') {
      const [guestData] = await sequelize.query(
        'SELECT address FROM guest WHERE user_id = ?',
        { replacements: [user.user_id] }
      );
      roleData = guestData[0] || {};
    } else if (user.role === 'host') {
      const [hostData] = await sequelize.query(
        'SELECT bank_details FROM host WHERE user_id = ?',
        { replacements: [user.user_id] }
      );
      roleData = hostData[0] || {};
    } else if (['admin', 'accountant', 'verifier'].includes(user.role)) {
      const [staffData] = await sequelize.query(
        'SELECT hire_date, role FROM staff WHERE user_id = ?',
        { replacements: [user.user_id] }
      );
      roleData = staffData[0] || {};
    }

    // Log successful login
    await logActivity({
      user_id:  user.user_id,
      action:   'LOGIN',
      entity:   'user',
      entity_id: user.user_id,
      req,
      details:  { role: user.role },
    });

    // Build profile picture URL for the response
    const profilePictureUrl = user.profile_picture
      ? `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/profiles/${user.profile_picture}`
      : null;

    res.status(200).json({
      message:    'Login successful',
      token,
      expires_in: expiresIn,
      user: {
        user_id:          user.user_id,
        name:             user.name,
        email:            user.email,
        phone:            user.phone,
        role:             user.role,
        membership_level: user.membership_level,
        is_verified:      user.is_verified,
        profile_picture:  profilePictureUrl,
        ...roleData
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (user) {
      await user.update({ tokens_valid_after: new Date() });
    }

    // Log logout
    await logActivity({
      user_id:  req.user.user_id,
      action:   'LOGOUT',
      entity:   'user',
      entity_id: req.user.user_id,
      req,
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Always return success even if user not found (security)
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, a reset link has been sent.' 
      });
    }

    // Google users cannot reset password
    if (user.auth_provider === 'google') {
      return res.status(400).json({ 
        message: 'This account uses Google login. Please sign in with Google.' 
      });
    }

    // Generate reset token
    const resetToken        = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      reset_token:         resetToken,
      reset_token_expires: resetTokenExpires,
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Reset Your Password - ShortStay',
      forgotPasswordTemplate(user.name, resetUrl)
    );

    res.status(200).json({ 
      message: 'If an account exists with this email, a reset link has been sent.' 
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token }        = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Find user with this reset token
    const user = await User.findOne({ 
      where: { reset_token: token } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid reset token' 
      });
    }

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ 
        message: 'Reset token has expired. Please request a new one.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and clear reset token
    await user.update({
      password:            hashedPassword,
      reset_token:         null,
      reset_token_expires: null,
    });

    // Send success email
    await sendEmail(
      user.email,
      'Password Reset Successful - ShortStay',
      passwordResetSuccessTemplate(user.name)
    );

    res.status(200).json({ 
      message: 'Password reset successful! You can now login with your new password.' 
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: [
        'password',
        'verification_token',
        'verification_token_expires',
        'reset_token',
        'reset_token_expires',
        'tokens_valid_after',
        'failed_login_count',
        'last_failed_login',
        'locked_until',
      ]}
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name && !phone) {
      return res.status(400).json({ 
        message: 'Please provide name or phone to update' 
      });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (name)  updateData.name  = name;
    if (phone) updateData.phone = phone;

    await user.update(updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        user_id: user.user_id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        role:    user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ 
        message: 'Both old and new password are required' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    if (old_password === new_password) {
      return res.status(400).json({ 
        message: 'New password must be different from old password' 
      });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Google users cannot change password
    if (user.auth_provider === 'google') {
      return res.status(400).json({ 
        message: 'Google account users cannot change password here.' 
      });
    }

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    // Update password and invalidate ALL existing tokens in one DB call
    await user.update({ password: hashed, tokens_valid_after: new Date() });

    res.status(200).json({ 
      message: 'Password changed successfully. Please login again.' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// DELETE ACCOUNT
// ─────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const { Booking, Property } = require('../models/index');
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'guest') {
      const activeBookings = await Booking.count({
        where: {
          guest_id: user.user_id,
          status: ['pending', 'approved', 'confirmed']
        }
      });
      if (activeBookings > 0) {
        return res.status(400).json({ message: 'You cannot delete your account while you have active bookings. Please cancel them first.' });
      }
    } else if (user.role === 'host') {
      const properties = await Property.findAll({ where: { host_id: user.user_id } });
      const propertyIds = properties.map(p => p.property_id);
      
      if (propertyIds.length > 0) {
        const activeBookings = await Booking.count({
          where: {
            property_id: propertyIds,
            status: ['pending', 'approved', 'confirmed']
          }
        });
        if (activeBookings > 0) {
          return res.status(400).json({ message: 'You cannot delete your account while your properties have active bookings. Please manage them first.' });
        }
      }
    }

    await user.destroy();
    // Token naturally invalidated — auth middleware won't find this user_id anymore

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// CREATE STAFF (Admin only)
// ─────────────────────────────────────────
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role, hire_date } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!['admin', 'accountant', 'verifier'].includes(role)) {
      return res.status(400).json({ message: 'Invalid staff role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken         = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await sequelize.transaction(async (t) => {
      const user = await User.create({
        name,
        email,
        phone,
        password:    hashedPassword,
        role,
        is_verified: false,
        verification_token:        verificationToken,
        verification_token_expires: verificationTokenExpires,
      }, { transaction: t });

      await sequelize.query(
        'INSERT INTO staff (user_id, hire_date, role) VALUES (?, ?, ?)',
        { 
          replacements: [user.user_id, hire_date || new Date(), role],
          transaction: t 
        }
      );

      return user;
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Staff Account - ShortStay',
      emailVerificationTemplate(name, verificationUrl)
    );

    res.status(201).json({
      message: 'Staff created! An email has been sent to them for verification.',
      user: {
        user_id: result.user_id,
        name:    result.name,
        email:   result.email,
        role:    result.role,
        is_verified: false,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────
// CHECK MEMBERSHIP
// ─────────────────────────────────────────
exports.getMembership = async (req, res) => {
  try {
    const { Booking } = require('../models/index');

    const user = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'name', 'email', 'membership_level']
    });

    const totalBookings = await Booking.count({
      where: { guest_id: req.user.user_id, status: 'confirmed' }
    });

    let nextLevel      = null;
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
};