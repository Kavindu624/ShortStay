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
  password: { type: DataTypes.STRING(255) },
  role: { 
    type: DataTypes.ENUM('guest','host','admin','payment_manager','field_inspector') 
  },
  membership_level: {
    type: DataTypes.ENUM('basic','silver','gold'),
    defaultValue: 'basic'
  },
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = User;