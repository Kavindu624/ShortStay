const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id:   { type: DataTypes.INTEGER, allowNull: false },
  type:      { type: DataTypes.STRING(50),  allowNull: false }, // booking_created, booking_approved, booking_rejected, booking_cancelled, booking_expired
  title:     { type: DataTypes.STRING(150), allowNull: false },
  message:   { type: DataTypes.TEXT,        allowNull: false },
  is_read:   { type: DataTypes.BOOLEAN,     defaultValue: false },
  reference_id: { type: DataTypes.INTEGER,  allowNull: true }, // booking_id
}, {
  timestamps: true,
  freezeTableName: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Notification;
