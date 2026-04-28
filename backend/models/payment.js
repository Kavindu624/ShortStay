const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('payment', {
  payment_id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id:   { type: DataTypes.INTEGER },
  amount:       { type: DataTypes.DECIMAL(10,2) },
  payment_date: { type: DataTypes.DATEONLY },
}, { timestamps: false,
    freezeTableName: true
 });

module.exports = Payment;