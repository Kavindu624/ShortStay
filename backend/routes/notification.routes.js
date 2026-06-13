const express = require('express');
const router  = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 3 }
 */
router.get('/unread-count', auth, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', auth, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Get notification preferences for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences
 */
router.get('/preferences', auth, notificationController.getPreferences);

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_notifications:  { type: boolean, example: true }
 *               booking_updates:      { type: boolean, example: true }
 *               payment_updates:      { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.put('/preferences', auth, notificationController.updatePreferences);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_read
 *         schema: { type: boolean }
 *         description: Filter by read status (false = unread only)
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *         description: Filter by notification type (e.g. booking_created, payment_received)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 */
router.get('/', auth, notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', auth, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     summary: Delete all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 */
router.delete('/', auth, notificationController.deleteAllNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
