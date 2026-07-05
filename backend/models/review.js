const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('review', {
  review_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id:    { type: DataTypes.INTEGER },
  property_id:   { type: DataTypes.INTEGER },
  rating:        { type: DataTypes.INTEGER },
  comment:       { type: DataTypes.TEXT },
  review_date:   { type: DataTypes.DATEONLY },
  helpful_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  host_response: { type: DataTypes.TEXT, defaultValue: null },
  response_date: { type: DataTypes.DATEONLY, defaultValue: null },
}, { 
  timestamps: false,
  freezeTableName: true
});

module.exports = Review;