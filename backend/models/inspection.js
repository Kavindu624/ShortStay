const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inspection = sequelize.define('inspection', {
  inspection_id:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  property_id:    { type: DataTypes.INTEGER },
  inspector_id:   { type: DataTypes.INTEGER },
  scheduled_date: { type: DataTypes.DATEONLY },
  overall_score:  { type: DataTypes.DECIMAL(3,2) },
  recommendation: { type: DataTypes.TEXT },
  status:         { type: DataTypes.STRING(30) },
}, { timestamps: false,
    freezeTableName: true
 });

module.exports = Inspection;