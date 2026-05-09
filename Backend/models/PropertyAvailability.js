const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PropertyAvailability = sequelize.define('property_availability', {
  availability_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  property_id:    { type: DataTypes.INTEGER },
  available_date: { type: DataTypes.DATEONLY },
  is_booked:      { type: DataTypes.BOOLEAN, defaultValue: false },
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = PropertyAvailability;