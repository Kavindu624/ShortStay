const { body } = require('express-validator');

// AUTH VALIDATORS
exports.registerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('phone')
    .notEmpty().withMessage('Phone is required')
    .isMobilePhone().withMessage('Please provide a valid phone number'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['guest', 'host']).withMessage('Role must be guest or host'),
];

exports.loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

exports.changePasswordValidator = [
  body('old_password')
    .notEmpty().withMessage('Old password is required'),

  body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

exports.updateProfileValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
];

// PROPERTY VALIDATORS
exports.createPropertyValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 150 }).withMessage('Title must be between 5 and 150 characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('address')
    .notEmpty().withMessage('Address is required'),

  body('price_per_night')
    .notEmpty().withMessage('Price per night is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),

  body('max_guests')
    .notEmpty().withMessage('Max guests is required')
    .isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
];

// BOOKING VALIDATORS
exports.createBookingValidator = [
  body('property_id')
    .notEmpty().withMessage('Property ID is required')
    .isInt().withMessage('Property ID must be a number'),

  body('checkin_date')
    .notEmpty().withMessage('Check in date is required')
    .isDate().withMessage('Invalid check in date format'),

  body('checkout_date')
    .notEmpty().withMessage('Check out date is required')
    .isDate().withMessage('Invalid check out date format'),
];

// REVIEW VALIDATORS
exports.createReviewValidator = [
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isInt().withMessage('Booking ID must be a number'),

  body('property_id')
    .notEmpty().withMessage('Property ID is required')
    .isInt().withMessage('Property ID must be a number'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
];

// COMPLAINT VALIDATORS
exports.createComplaintValidator = [
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isInt().withMessage('Booking ID must be a number'),

  body('subject')
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 5, max: 255 }).withMessage('Subject must be between 5 and 255 characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium or high'),
];

// PAYMENT VALIDATORS
exports.processPaymentValidator = [
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isInt().withMessage('Booking ID must be a number'),
];

exports.stripeIntentValidator = [
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isInt().withMessage('Booking ID must be a number'),
];

exports.refundValidator = [
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters'),
];

exports.updatePaymentStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Status must be one of: pending, completed, failed, refunded'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes must be under 500 characters'),
];

// STAFF VALIDATORS
exports.createStaffValidator = [
  body('name')
    .notEmpty().withMessage('Name is required'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'payment_manager', 'field_inspector'])
    .withMessage('Invalid staff role'),
];