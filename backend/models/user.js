const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('user', {
  user_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name:     { type: DataTypes.STRING(100) },
  email:    { type: DataTypes.STRING(100), unique: true },
  phone:    { type: DataTypes.STRING(20) },
  password: { 
    type: DataTypes.STRING(255),
    allowNull: true
  },
  role: { 
    type: DataTypes.ENUM(
      'guest',
      'host',
      'admin',
      'accountant',
      'verifier'
    ) 
  },
  membership_level: {
    type: DataTypes.ENUM('basic', 'silver', 'gold', 'platinum'),
    defaultValue: 'basic'
  },
  is_suspended: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  suspended_reason: { 
    type: DataTypes.STRING(255), 
    defaultValue: null 
  },
  google_id: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  verification_token_expires: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  reset_token: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  profile_picture: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  // Persistent token invalidation (replaces in-memory blacklist)
  tokens_valid_after: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  // Persistent brute-force tracking (replaces in-memory Map)
  failed_login_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_failed_login: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  locked_until: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  // Notification preferences — stored as JSON string
  // e.g. {"email_booking":true,"inapp_payment":false,...}
  notification_preferences: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = User;