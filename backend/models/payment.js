const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD',
  },
  payment_method: {
    type: DataTypes.ENUM('stripe', 'manual'),
    defaultValue: 'manual',
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'completed',
  },
  // Stripe payment intent / charge ID (null for manual payments)
  transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  // Stripe client_secret (returned to frontend for confirmCardPayment)
  client_secret: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  // Refund info
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  refund_transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = Payment;