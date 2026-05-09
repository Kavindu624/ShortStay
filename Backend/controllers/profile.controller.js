const { User } = require('../models/index');
const sequelize = require('../config/db');
const path      = require('path');
const fs        = require('fs');

// GET FULL PROFILE (with role specific data)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { 
        exclude: [
          'password',
          'verification_token',
          'verification_token_expires',
          'reset_token',
          'reset_token_expires',
          'tokens_valid_after',
          'failed_login_count',
          'last_failed_login',
          'locked_until',
        ] 
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    } else if (['admin', 'payment_manager', 'field_inspector'].includes(user.role)) {
      const [staffData] = await sequelize.query(
        'SELECT hire_date, role, department, area_assigned, transaction_limit, employee_code FROM staff WHERE user_id = ?',
        { replacements: [user.user_id] }
      );
      roleData = staffData[0] || {};
    }

    // Build profile picture URL
    const profilePictureUrl = user.profile_picture
      ? `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/profiles/${user.profile_picture}`
      : null;

    res.status(200).json({
      user_id:          user.user_id,
      name:             user.name,
      email:            user.email,
      phone:            user.phone,
      role:             user.role,
      membership_level: user.membership_level,
      is_verified:      user.is_verified,
      is_suspended:     user.is_suspended,
      auth_provider:    user.auth_provider,
      profile_picture:  profilePictureUrl,
      ...roleData
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE BASIC PROFILE (name, phone)
exports.updateBasicProfile = async (req, res) => {
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

// UPDATE GUEST ADDRESS
exports.updateGuestAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    // Check if guest record exists
    const [guestData] = await sequelize.query(
      'SELECT * FROM guest WHERE user_id = ?',
      { replacements: [req.user.user_id] }
    );

    if (guestData.length === 0) {
      return res.status(404).json({ message: 'Guest profile not found' });
    }

    // Update address
    await sequelize.query(
      'UPDATE guest SET address = ? WHERE user_id = ?',
      { replacements: [address, req.user.user_id] }
    );

    res.status(200).json({
      message:  'Address updated successfully',
      address,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE HOST BANK DETAILS
exports.updateHostBankDetails = async (req, res) => {
  try {
    const { bank_details } = req.body;

    if (!bank_details) {
      return res.status(400).json({ message: 'Bank details are required' });
    }

    // Check if host record exists
    const [hostData] = await sequelize.query(
      'SELECT * FROM host WHERE user_id = ?',
      { replacements: [req.user.user_id] }
    );

    if (hostData.length === 0) {
      return res.status(404).json({ message: 'Host profile not found' });
    }

    // Update bank details
    await sequelize.query(
      'UPDATE host SET bank_details = ? WHERE user_id = ?',
      { replacements: [bank_details, req.user.user_id] }
    );

    res.status(200).json({
      message:      'Bank details updated successfully',
      bank_details,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPLOAD PROFILE PICTURE
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profile_picture) {
      const oldPath = path.join(__dirname, '../uploads/profiles', user.profile_picture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new profile picture filename
    await user.update({ profile_picture: req.file.filename });

    const profilePictureUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/profiles/${req.file.filename}`;

    res.status(200).json({
      message:         'Profile picture uploaded successfully',
      profile_picture: profilePictureUrl,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE PROFILE PICTURE
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profile_picture) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Delete file from uploads folder
    const filePath = path.join(__dirname, '../uploads/profiles', user.profile_picture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    await user.update({ profile_picture: null });

    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ANY USER PROFILE (Admin only)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id, {
      attributes: { 
        exclude: [
          'password',
          'verification_token',
          'verification_token_expires',
          'reset_token',
          'reset_token_expires',
          'tokens_valid_after',
          'failed_login_count',
          'last_failed_login',
          'locked_until',
        ] 
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    } else if (['admin', 'payment_manager', 'field_inspector'].includes(user.role)) {
      const [staffData] = await sequelize.query(
        'SELECT hire_date, role FROM staff WHERE user_id = ?',
        { replacements: [user.user_id] }
      );
      roleData = staffData[0] || {};
    }

    const profilePictureUrl = user.profile_picture
      ? `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/profiles/${user.profile_picture}`
      : null;

    res.status(200).json({
      ...user.toJSON(),
      profile_picture: profilePictureUrl,
      ...roleData
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};