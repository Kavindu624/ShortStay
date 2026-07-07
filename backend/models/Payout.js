const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Payout model — tracks host payouts by the accountant
 *
 * Commission flow:
 *   booking.total_price  → guest pays this
 *   commission_amount    → platform keeps (e.g. 10%)
 *   payout_amount        → host receives (total - commission)
 */
const Payout = sequelize.define('payout', {
  payout_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  host_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gross_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Full booking amount paid by guest',
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00,
    comment: 'Platform commission % (e.g. 10.00 = 10%)',
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Amount kept by platform',
  },
  payout_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Net amount sent to host = gross - commission',
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  payout_method: {
    type: DataTypes.ENUM('bank_transfer', 'manual'),
    defaultValue: 'manual',
  },
  // Stripe Transfer / Payout ID (if using Stripe Connect)
  stripe_transfer_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: 'user_id of the accountant who processed this',
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  timestamps: true,
  freezeTableName: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Payout;
