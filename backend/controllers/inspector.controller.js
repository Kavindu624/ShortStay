const path = require('path');
const fs   = require('fs');
const { Inspection, Property, User } = require('../models/index');
const { Op } = require('sequelize');
const notify = require('../utils/notify');
const logActivity = require('../utils/activityLogger');
const sendEmail = require('../utils/sendEmail');
const { inspectionScheduledEmail } = require('../utils/emailTemplates');

// ─── GET PENDING PROPERTIES (Inspector) ──────────────────────────────────────
// Properties that have requested verification and are not yet approved/rejected
exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: {
        verification_requested: true,
        verification_status: { [Op.in]: ['requested', 'inspecting'] },
        verification_badge: false,
      },
      include: [{ model: User, as: 'host', attributes: ['name', 'email', 'phone'] }],
      order: [['property_id', 'DESC']],
    });

    res.status(200).json({ total: properties.length, properties });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ASSIGNED INSPECTIONS (Inspector's active assignments) ────────────────
exports.getInspections = async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      where: { inspector_id: req.user.user_id },
      include: [{ model: Property, attributes: ['title', 'address', 'verification_status'] }],
      order: [['inspection_id', 'DESC']],
    });

    res.status(200).json(inspections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET INSPECTION HISTORY (Inspector only) ─────────────────────────────────
// All completed inspections done by this inspector
exports.getInspectionHistory = async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      where: {
        inspector_id: req.user.user_id,
        status: 'completed',
      },
      include: [{
        model: Property,
        attributes: ['title', 'address', 'verification_status', 'verification_badge'],
      }],
      order: [['completed_date', 'DESC'], ['inspection_id', 'DESC']],
    });

    res.status(200).json({ total: inspections.length, inspections });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── INSPECTOR DASHBOARD STATS ────────────────────────────────────────────────
exports.getInspectorDashboard = async (req, res) => {
  try {
    const inspector_id = req.user.user_id;

    const [total, scheduled, completed, approved] = await Promise.all([
      Inspection.count({ where: { inspector_id } }),
      Inspection.count({ where: { inspector_id, status: 'scheduled' } }),
      Inspection.count({ where: { inspector_id, status: 'completed' } }),
      // Properties this inspector helped get verified
      Inspection.count({
        where: { inspector_id, status: 'completed' },
        include: [{
          model: Property,
          where: { verification_badge: true },
          required: true,
        }],
      }),
    ]);

    const pendingCount = await Property.count({
      where: {
        verification_requested: true,
        verification_status: 'requested',
        verification_badge: false,
      },
    });

    res.status(200).json({
      total_assigned:   total,
      scheduled,
      completed,
      approved_badges:  approved,
      pending_in_queue: pendingCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── SUBMIT INSPECTION REPORT (Inspector) ────────────────────────────────────
exports.submitInspection = async (req, res) => {
  try {
    const { property_id, scheduled_date, overall_score, recommendation, notes } = req.body;

    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const inspection = await Inspection.create({
      property_id,
      inspector_id:   req.user.user_id,
      scheduled_date,
      completed_date: new Date(),
      overall_score,
      recommendation,
      notes:          notes || null,
      status:         'completed',
    });

    // Update property verification status
    await property.update({ verification_status: 'inspecting' });

    // Notify the host
    await notify(
      property.host_id,
      'Property Inspection Completed 🔍',
      `A field inspector has completed the inspection of your property "${property.title}". Verification decision coming soon.`,
      'inspection_completed',
      property_id
    );

    // Notify all admins to take action on the report
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(admin =>
      notify(
        admin.user_id,
        'Inspection Report Submitted 📋',
        `Inspector has submitted a report for property "${property.title}". Please review and approve/reject the verification badge.`,
        'inspection_report',
        property_id
      )
    ));

    await logActivity({
      user_id:   req.user.user_id,
      action:    'INSPECTION_SUBMITTED',
      entity:    'inspection',
      entity_id: inspection.inspection_id,
      req,
      details:   { property_id, recommendation: inspection.recommendation },
    });

    res.status(201).json({ message: 'Inspection report submitted', inspection });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPLOAD INSPECTION IMAGES (Inspector only) ───────────────────────────────
// POST /api/inspector/:inspection_id/images  — multer array('images', 5)
exports.uploadInspectionImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const inspection = await Inspection.findByPk(req.params.inspection_id);
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    if (inspection.inspector_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Merge with any existing images
    const existing = inspection.inspection_images
      ? JSON.parse(inspection.inspection_images)
      : [];

    const newFilenames = req.files.map(f => f.filename);
    const merged = [...existing, ...newFilenames];

    await inspection.update({ inspection_images: JSON.stringify(merged) });

    const imageUrls = merged.map(
      f => `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/inspections/${f}`
    );

    res.status(200).json({
      message: `${newFilenames.length} image(s) uploaded`,
      images: imageUrls,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── APPROVE VERIFICATION BADGE (Inspector) ──────────────────────────────────
exports.approveBadge = async (req, res) => {
  try {
    const sendEmail = require('../utils/sendEmail');

    const property = await Property.findByPk(req.params.property_id, {
      include: [{ model: User, as: 'host', attributes: ['name', 'email'] }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({
      verification_badge:  true,
      verification_status: 'approved',
      overall_score:       req.body.overall_score,
      recommendations:     req.body.recommendations,
    });

    // In-app notification
    await notify(
      property.host_id,
      'Property Verified! ✅',
      `Your property "${property.title}" has been inspected and verified. Verification badge granted!`,
      'property_verified',
      property.property_id
    );

    // Email to host
    await sendEmail(
      property.host.email,
      'Your Property is Now Verified - ShortStay',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #27ae60; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">ShortStay</h2>
        </div>
        <div style="background: #f8f8f8; padding: 20px;">
          <h3>🎉 Verification Badge Awarded!</h3>
          <p>Dear <strong>${property.host.name}</strong>,</p>
          <p>Congratulations! Your property has been physically inspected and awarded a <strong>Verification Badge</strong>.</p>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
            <p><strong>Property:</strong> ${property.title}</p>
            <p><strong>Status:</strong> ✅ VERIFIED</p>
            ${req.body.recommendations ? `<p><strong>Inspector Notes:</strong> ${req.body.recommendations}</p>` : ''}
          </div>
          <p style="color: #27ae60; font-weight: bold;">Your listing will now display the verified badge to guests!</p>
        </div>
        <div style="background: #333; padding: 10px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">© 2026 ShortStay</p>
        </div>
      </div>
      `
    );

    res.status(200).json({ message: 'Verification badge approved', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── ASSIGN INSPECTOR TO PROPERTY (Admin only) ───────────────────────────────
exports.assignInspector = async (req, res) => {
  try {
    const { property_id, inspector_id, scheduled_date } = req.body;

    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const inspector = await User.findByPk(inspector_id);
    if (!inspector || inspector.role !== 'field_inspector') {
      return res.status(400).json({ message: 'Invalid field inspector ID' });
    }

    const inspection = await Inspection.create({
      property_id,
      inspector_id,
      scheduled_date: scheduled_date || null,
      status: 'scheduled',
    });

    await property.update({ verification_status: 'inspecting' });

    // Notify inspector — in-app
    await notify(
      inspector_id,
      'New Inspection Assigned',
      `You have been assigned to inspect property: "${property.title}". ${scheduled_date ? `Scheduled: ${scheduled_date}` : 'Please schedule at your earliest convenience.'}`,
      'inspection_assigned',
      property_id
    );

    // Notify host — in-app + email
    await notify(
      property.host_id,
      'Inspection Scheduled 📅',
      `A field inspector has been assigned to verify your property "${property.title}".${scheduled_date ? ` Scheduled date: ${scheduled_date}.` : ''}`,
      'inspection_scheduled',
      property_id
    );

    const host = await User.findByPk(property.host_id, { attributes: ['name', 'email'] });
    if (host) {
      await sendEmail(
        host.email,
        'Inspection Scheduled for Your Property - ShortStay',
        inspectionScheduledEmail(host.name, property.title, scheduled_date)
      );
    }

    res.status(201).json({ message: 'Inspector assigned', inspection });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL INSPECTIONS (Admin only) ────────────────────────────────────────
exports.getAllInspections = async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      include: [
        { model: Property, attributes: ['title', 'address', 'verification_status'] },
        { model: User, as: 'inspector', attributes: ['name', 'email'] },
      ],
      order: [['inspection_id', 'DESC']],
    });

    res.status(200).json(inspections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};