const express = require('express');
const router  = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

// All routes require authentication
// Static routes BEFORE dynamic /:id routes
router.get('/unread-count',      auth, notificationController.getUnreadCount);
router.put('/read-all',          auth, notificationController.markAllAsRead);
router.get('/preferences',       auth, notificationController.getPreferences);
router.put('/preferences',       auth, notificationController.updatePreferences);

// Main list with ?is_read=false&type=booking_created&page=1&limit=20
router.get('/',                  auth, notificationController.getMyNotifications);

// Dynamic routes
router.put('/:id/read',          auth, notificationController.markAsRead);
router.delete('/',               auth, notificationController.deleteAllNotifications);
router.delete('/:id',            auth, notificationController.deleteNotification);

module.exports = router;
