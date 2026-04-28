const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('booking', {
  booking_id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guest_id:      { type: DataTypes.INTEGER },
  property_id:   { type: DataTypes.INTEGER },
  checkin_date:  { type: DataTypes.DATEONLY },
  checkout_date: { type: DataTypes.DATEONLY },
  total_price:   { type: DataTypes.DECIMAL(10,2) },
  status:        { type: DataTypes.STRING(30) },
}, { timestamps: false,
    freezeTableName: true
 });

module.exports = Booking;