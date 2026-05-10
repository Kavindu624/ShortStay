/**
 * Activity Logger — fire-and-forget helper.
 * Call this anywhere in a controller to record an action in activity_log.
 *
 * @param {object} opts
 * @param {number|null}  opts.user_id   - Who performed the action (null for system)
 * @param {string}       opts.action    - Short action name  e.g. 'LOGIN', 'BOOKING_CREATED'
 * @param {string|null}  opts.entity    - Entity type        e.g. 'booking', 'property'
 * @param {number|null}  opts.entity_id - Entity primary key
 * @param {object|null}  opts.req       - Express req object (for IP / user-agent)
 * @param {object|null}  opts.details   - Any extra JSON context
 */
const ActivityLog = require('../models/ActivityLog');

module.exports = async function logActivity({
  user_id   = null,
  action,
  entity    = null,
  entity_id = null,
  req       = null,
  details   = null,
}) {
  try {
    const ip_address = req
      ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null)
      : null;
    const user_agent = req ? (req.headers['user-agent'] || null) : null;

    await ActivityLog.create({
      user_id,
      action,
      entity,
      entity_id,
      ip_address,
      user_agent,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (err) {
    // Never crash the main request flow
    console.error('[ActivityLogger] Failed to log activity:', err.message);
  }
};
