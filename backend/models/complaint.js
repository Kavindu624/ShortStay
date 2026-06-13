const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('complain', {
  complaint_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id:   { type: DataTypes.INTEGER },
  subject:      { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
  description:  { type: DataTypes.TEXT },
  status:       { type: DataTypes.STRING(30) },
  priority:     { type: DataTypes.STRING(20) },
}, { timestamps: false,
    freezeTableName: true
 });

module.exports = Complaint;