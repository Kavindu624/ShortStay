const User                = require('./User');
const Property            = require('./Property');
const Booking             = require('./Booking');
const Payment             = require('./Payment');
const Review              = require('./Review');
const Complaint           = require('./Complaint');
const Inspection          = require('./Inspection');
const PropertyAvailability = require('./PropertyAvailability');
const PropertyImage        = require('./PropertyImage');
const Notification         = require('./Notification');
const ActivityLog          = require('./ActivityLog');

// User -> Property
User.hasMany(Property,   { foreignKey: 'host_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

// User -> Booking
User.hasMany(Booking,    { foreignKey: 'guest_id', as: 'bookings' });
Booking.belongsTo(User,  { foreignKey: 'guest_id', as: 'guest' });

// Property -> Booking
Property.hasMany(Booking,   { foreignKey: 'property_id' });
Booking.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Booking -> Payment
Booking.hasOne(Payment,    { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

// Booking -> Review
Booking.hasMany(Review,   { foreignKey: 'booking_id' });
Review.belongsTo(Booking, { foreignKey: 'booking_id' });

// Property -> Review
Property.hasMany(Review,   { foreignKey: 'property_id' });
Review.belongsTo(Property, { foreignKey: 'property_id' });

// Booking -> Complaint
Booking.hasMany(Complaint,   { foreignKey: 'booking_id' });
Complaint.belongsTo(Booking, { foreignKey: 'booking_id' });

// Property -> Inspection
Property.hasMany(Inspection,   { foreignKey: 'property_id' });
Inspection.belongsTo(Property, { foreignKey: 'property_id' });

// User -> Inspection
User.hasMany(Inspection,   { foreignKey: 'inspector_id', as: 'inspections' });
Inspection.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });

// Property -> PropertyAvailability
Property.hasMany(PropertyAvailability, { foreignKey: 'property_id', as: 'availability' });
PropertyAvailability.belongsTo(Property, { foreignKey: 'property_id' });

// Property -> PropertyImage
Property.hasMany(PropertyImage,   { foreignKey: 'property_id', as: 'images' });
PropertyImage.belongsTo(Property, { foreignKey: 'property_id' });

// User -> Notification
User.hasMany(Notification,        { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User,      { foreignKey: 'user_id' });

// User -> ActivityLog
User.hasMany(ActivityLog,         { foreignKey: 'user_id', as: 'activity_logs' });
ActivityLog.belongsTo(User,       { foreignKey: 'user_id' });

module.exports = { 
  User, 
  Property, 
  Booking, 
  Payment, 
  Review, 
  Complaint, 
  Inspection,
  PropertyAvailability,
  PropertyImage,
  Notification,
  ActivityLog,
};