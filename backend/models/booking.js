const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('booking', {
  booking_id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guest_id:      { type: DataTypes.INTEGER },
  property_id:   { type: DataTypes.INTEGER },
  checkin_date:  { type: DataTypes.DATEONLY },
  checkout_date: { type: DataTypes.DATEONLY },
  total_price:   { type: DataTypes.DECIMAL(10,2) },
  status:        {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'rejected', 'expired'),
    defaultValue: 'pending',
  },
  // Booking expiry — auto-cancel if host doesn't act within 24 h
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Cancellation info
  cancellation_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  refund_policy: {
    type: DataTypes.STRING(100),
    allowNull: true,           // e.g. 'full', 'partial_50', 'no_refund'
  },
  // Host rejection
  rejection_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  timestamps: true,
  freezeTableName: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Booking;