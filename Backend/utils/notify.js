/**
 * Shared notification helper used across controllers.
 * Creates an in-app notification record for a user (fire-and-forget).
 *
 * @param {number} user_id      - Recipient user's ID
 * @param {string} title        - Short notification title
 * @param {string} message      - Full notification message
 * @param {string} [type]       - Notification type tag (default: 'general')
 * @param {number} [reference_id] - Optional related entity ID (e.g. booking_id, property_id)
 */
const { Notification } = require('../models/index');

module.exports = async function notify(user_id, title, message, type = 'general', reference_id = null) {
  try {
    await Notification.create({ user_id, type, title, message, reference_id });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};
