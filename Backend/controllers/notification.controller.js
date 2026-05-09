const { Notification } = require('../models/index');

// GET MY NOTIFICATIONS
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.user_id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    const unread_count = notifications.filter(n => !n.is_read).length;

    res.status(200).json({ notifications, unread_count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// MARK SINGLE NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        notification_id: req.params.id,
        user_id: req.user.user_id,
      },
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

// DELETE A NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: {
        notification_id: req.params.id,
        user_id: req.user.user_id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
