/**
 * Shared notification helper — creates an in-app notification record
 * AND emits a real-time WebSocket event to the recipient.
 *
 * Fire-and-forget: errors are swallowed so the main request never crashes.
 *
 * @param {number} user_id       - Recipient user's ID
 * @param {string} title         - Short notification title
 * @param {string} message       - Full notification message
 * @param {string} [type]        - Notification type tag (default: 'general')
 * @param {number} [reference_id]- Optional related entity ID
 */
const { Notification } = require('../models/index');
const { emitToUser }   = require('./websocket');

module.exports = async function notify(
  user_id,
  title,
  message,
  type = 'general',
  reference_id = null
) {
  try {
    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      reference_id,
    });

    // Emit real-time event to the user's WebSocket room
    emitToUser(user_id, 'notification', {
      notification_id: notification.notification_id,
      type,
      title,
      message,
      reference_id,
      is_read:     false,
      created_at:  notification.created_at,
    });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};
