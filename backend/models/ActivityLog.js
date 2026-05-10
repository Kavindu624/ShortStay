const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityLog = sequelize.define('activity_log', {
  log_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, defaultValue: null },      // null for system events
  action:     { type: DataTypes.STRING(100), allowNull: false },     // e.g. 'LOGIN', 'BOOKING_CREATED'
  entity:     { type: DataTypes.STRING(50),  defaultValue: null },   // e.g. 'booking', 'property'
  entity_id:  { type: DataTypes.INTEGER,     defaultValue: null },   // e.g. booking_id
  ip_address: { type: DataTypes.STRING(45),  defaultValue: null },
  user_agent: { type: DataTypes.STRING(255), defaultValue: null },
  details:    { type: DataTypes.TEXT,        defaultValue: null },   // JSON extra context
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps:     false,
  freezeTableName: true,
});

module.exports = ActivityLog;
