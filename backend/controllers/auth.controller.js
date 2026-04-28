const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');
const { User } = require('../models/index');
require('dotenv').config();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Only allow guest or host to self-register
    if (!['guest', 'host'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for registration' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use transaction so all inserts succeed or fail together
    const result = await sequelize.transaction(async (t) => {

      // 1. Insert into user table
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      }, { transaction: t });

      // 2. Insert into customer table
      await sequelize.query(
        'INSERT INTO customer (user_id) VALUES (?)',
        { replacements: [user.user_id], transaction: t }
      );

      // 3. Insert into guest or host table
      if (role === 'guest') {
        await sequelize.query(
          'INSERT INTO guest (user_id, address) VALUES (?, ?)',
          { replacements: [user.user_id, req.body.address || null], transaction: t }
        );
      } else if (role === 'host') {
        await sequelize.query(
          'INSERT INTO host (user_id, bank_details) VALUES (?, ?)',
          { replacements: [user.user_id, req.body.bank_details || null], transaction: t }
        );
      }

      return user;
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        user_id: result.user_id,
        name: result.name,
        email: result.email,
        role: result.role,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET CURRENT USER (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CREATE STAFF (Admin only)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role, hire_date } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (!['admin', 'payment_manager', 'field_inspector'].includes(role)) {
      return res.status(400).json({ message: 'Invalid staff role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sequelize.transaction(async (t) => {
      const user = await User.create({
        name, email, phone,
        password: hashedPassword,
        role,
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

    res.status(201).json({
      message: 'Staff created successfully',
      user: {
        user_id: result.user_id,
        name: result.name,
        email: result.email,
        role: result.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    // Validate inputs
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

    // Find user
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    // Hash new password
    const hashed = await bcrypt.hash(new_password, 10);

    // Update password
    await user.update({ password: hashed });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validate inputs
    if (!name && !phone) {
      return res.status(400).json({ 
        message: 'Please provide name or phone to update' 
      });
    }

    // Find user
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only provided fields
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

// DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};