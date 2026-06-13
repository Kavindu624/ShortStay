const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createComplaintValidator } = require('../middleware/validators');

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Submit a complaint (guest only)
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id, subject, description]
 *             properties:
 *               booking_id:  { type: integer, example: 5 }
 *               subject:     { type: string, example: 'Property was not as described' }
 *               description: { type: string, example: 'The place was not clean and the amenities were broken.' }
 *               priority:    { type: string, enum: [low, medium, high], example: 'medium' }
 *     responses:
 *       201:
 *         description: Complaint submitted
 *       403:
 *         description: Forbidden — guests only
 */
router.post('/', auth, role('guest'), createComplaintValidator, validate, complaintController.createComplaint);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints (admin only)
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all complaints
 *       403:
 *         description: Forbidden — admins only
 */
router.get('/', auth, role('admin'), complaintController.getAllComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update complaint status (admin only)
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:     { type: string, enum: [open, in_progress, resolved, closed], example: 'resolved' }
 *               resolution: { type: string, example: 'Guest was issued a partial refund.' }
 *     responses:
 *       200:
 *         description: Complaint status updated
 *       403:
 *         description: Forbidden — admins only
 */
router.put('/:id', auth, role('admin'), complaintController.updateComplaintStatus);

module.exports = router;