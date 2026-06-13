const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// ── Public routes ─────────────────────────────────────

/**
 * @swagger
 * /api/availability/check:
 *   get:
 *     summary: Check if a property is available for given dates (public)
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: property_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: check_in
 *         required: true
 *         schema: { type: string, format: date }
 *         example: '2026-07-01'
 *       - in: query
 *         name: check_out
 *         required: true
 *         schema: { type: string, format: date }
 *         example: '2026-07-05'
 *     responses:
 *       200:
 *         description: Availability check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available: { type: boolean, example: true }
 */
router.get('/check', availabilityController.checkAvailability);

/**
 * @swagger
 * /api/availability/calendar/{property_id}:
 *   get:
 *     summary: Get full availability calendar for a property (public)
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: property_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: string }
 *         example: '2026-07'
 *         description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: Calendar with available and blocked dates
 */
router.get('/calendar/:property_id', availabilityController.getCalendar);

/**
 * @swagger
 * /api/availability/{property_id}:
 *   get:
 *     summary: Get raw availability data for a property (public)
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: property_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Availability data
 */
router.get('/:property_id', availabilityController.getAvailability);

// ── Host routes ───────────────────────────────────────

/**
 * @swagger
 * /api/availability/set:
 *   post:
 *     summary: Set the full availability schedule for a property (host only)
 *     tags: [Availability]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, available_dates]
 *             properties:
 *               property_id:     { type: integer, example: 3 }
 *               available_dates:
 *                 type: array
 *                 items: { type: string, format: date }
 *                 example: ['2026-07-01', '2026-07-02', '2026-07-03']
 *     responses:
 *       200:
 *         description: Availability set
 *       403:
 *         description: Forbidden — hosts only
 */
router.post('/set', auth, role('host'), availabilityController.setAvailability);

/**
 * @swagger
 * /api/availability/add:
 *   post:
 *     summary: Add additional available dates (host only)
 *     tags: [Availability]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, dates]
 *             properties:
 *               property_id: { type: integer, example: 3 }
 *               dates:
 *                 type: array
 *                 items: { type: string, format: date }
 *                 example: ['2026-07-10', '2026-07-11']
 *     responses:
 *       200:
 *         description: Dates added
 */
router.post('/add', auth, role('host'), availabilityController.addDates);

/**
 * @swagger
 * /api/availability/remove:
 *   delete:
 *     summary: Remove/block specific dates (host only)
 *     tags: [Availability]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [property_id, dates]
 *             properties:
 *               property_id: { type: integer, example: 3 }
 *               dates:
 *                 type: array
 *                 items: { type: string, format: date }
 *                 example: ['2026-07-15', '2026-07-16']
 *     responses:
 *       200:
 *         description: Dates removed/blocked
 */
router.delete('/remove', auth, role('host'), availabilityController.removeDates);

module.exports = router;