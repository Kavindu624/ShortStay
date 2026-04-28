const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Property = sequelize.define('property', {
  property_id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  host_id:                 { type: DataTypes.INTEGER },
  title:                   { type: DataTypes.STRING(150) },
  description:             { type: DataTypes.TEXT },
  address:                 { type: DataTypes.STRING(255) },
  price_per_night:         { type: DataTypes.DECIMAL(10,2) },
  max_guests:              { type: DataTypes.INTEGER },
  verification_badge:      { type: DataTypes.BOOLEAN, defaultValue: false },
  is_approved:             { type: DataTypes.BOOLEAN, defaultValue: false },
  available_dates:         { type: DataTypes.TEXT },
  overall_score:           { type: DataTypes.DECIMAL(3,2) },
  recommendations:         { type: DataTypes.TEXT },
  image:                   { type: DataTypes.STRING(255), defaultValue: null },
  verification_requested:  { type: DataTypes.BOOLEAN, defaultValue: false },  // NEW
  verification_status: {                                                        // NEW
    type: DataTypes.ENUM('none','requested','inspecting','approved','rejected'),
    defaultValue: 'none'
  },
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = Property;