const { Notification, User } = require('../models/index');
const { Op } = require('sequelize');

// GET MY NOTIFICATIONS (with filtering + pagination)
// GET /api/notifications?is_read=false&type=booking_created&page=1&limit=20
exports.getMyNotifications = async (req, res) => {
  try {
    const { is_read, type, page = 1, limit = 20 } = req.query;

    const where = { user_id: req.user.user_id };
    if (is_read !== undefined) where.is_read = is_read === 'true';
    if (type)                  where.type    = type;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order:  [['created_at', 'DESC']],
      limit:  Math.min(parseInt(limit), 100),
      offset,
    });

    const unread_count = await Notification.count({
      where: { user_id: req.user.user_id, is_read: false },
    });

    res.status(200).json({
      total:        count,
      page:         parseInt(page),
      limit:        parseInt(limit),
      pages:        Math.ceil(count / parseInt(limit)),
      unread_count,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET UNREAD COUNT
// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.user.user_id, is_read: false },
    });
    res.status(200).json({ unread_count: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// MARK SINGLE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { notification_id: req.params.id, user_id: req.user.user_id },
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await notification.update({ is_read: true });
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.user_id, is_read: false } }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE A SINGLE NOTIFICATION
// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { notification_id: req.params.id, user_id: req.user.user_id },
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE ALL NOTIFICATIONS
// DELETE /api/notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({ where: { user_id: req.user.user_id } });
    res.status(200).json({ message: 'All notifications deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET NOTIFICATION PREFERENCES
// GET /api/notifications/preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ['notification_preferences'],
    });

    // Default preferences if not set
    const defaults = {
      email_booking:      true,
      email_payment:      true,
      email_review:       true,
      email_complaint:    true,
      email_system:       true,
      inapp_booking:      true,
      inapp_payment:      true,
      inapp_review:       true,
      inapp_complaint:    true,
      inapp_system:       true,
    };

    let prefs = defaults;
    if (user.notification_preferences) {
      try {
        prefs = { ...defaults, ...JSON.parse(user.notification_preferences) };
      } catch (_) { /* keep defaults */ }
    }

    res.status(200).json({ preferences: prefs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE NOTIFICATION PREFERENCES
// PUT /api/notifications/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const allowed = [
      'email_booking', 'email_payment', 'email_review', 'email_complaint', 'email_system',
      'inapp_booking', 'inapp_payment', 'inapp_review', 'inapp_complaint', 'inapp_system',
    ];

    const user = await User.findByPk(req.user.user_id, {
      attributes: ['user_id', 'notification_preferences'],
    });

    let existing = {};
    if (user.notification_preferences) {
      try { existing = JSON.parse(user.notification_preferences); } catch (_) {}
    }

    // Only update keys that are in the allowed list
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = Boolean(req.body[key]);
      }
    }

    const merged = { ...existing, ...updates };
    await user.update({ notification_preferences: JSON.stringify(merged) });

    res.status(200).json({ message: 'Preferences updated', preferences: merged });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
