const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PropertyImage = sequelize.define('property_images', {
  image_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  property_id: { type: DataTypes.INTEGER },
  image_url:   { type: DataTypes.STRING(255) },
  is_primary:  { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = PropertyImage;