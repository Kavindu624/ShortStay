const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inspection = sequelize.define('inspection', {
  inspection_id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  property_id:        { type: DataTypes.INTEGER },
  inspector_id:       { type: DataTypes.INTEGER },
  scheduled_date:     { type: DataTypes.DATEONLY },
  completed_date:     { type: DataTypes.DATEONLY, defaultValue: null },
  overall_score:      { type: DataTypes.DECIMAL(3,2) },
  recommendation:     { type: DataTypes.TEXT },
  notes:              { type: DataTypes.TEXT, defaultValue: null },
  status:             { type: DataTypes.STRING(30) },
  // Stored as JSON array of filenames e.g. ["img1.jpg","img2.jpg"]
  inspection_images:  { type: DataTypes.TEXT, defaultValue: null },
}, { timestamps: false,
    freezeTableName: true
 });

module.exports = Inspection;