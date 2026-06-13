const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Dispute model — tracks payment disputes raised by guests or flagged by payment managers
 */
const Dispute = sequelize.define('dispute', {
  dispute_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  raised_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'user_id of the guest or staff who raised this dispute',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'under_review', 'resolved', 'closed'),
    defaultValue: 'open',
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  resolved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: 'user_id of the payment_manager who resolved this',
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  // Stripe dispute ID (if chargeback was initiated through Stripe)
  stripe_dispute_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
}, {
  timestamps: true,
  freezeTableName: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Dispute;
