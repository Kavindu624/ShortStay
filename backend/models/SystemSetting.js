const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SystemSetting = sequelize.define('system_setting', {
  key: { 
    type: DataTypes.STRING(100), 
    primaryKey: true 
  },
  value: { 
    type: DataTypes.TEXT,
    allowNull: true
  }
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = SystemSetting;
