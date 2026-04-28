const { Inspection, Property } = require('../models/index');

// GET ASSIGNED INSPECTIONS
exports.getInspections = async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      where: { inspector_id: req.user.user_id },
      include: [{ model: Property, attributes: ['title', 'address'] }]
    });

    res.status(200).json(inspections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// SUBMIT INSPECTION REPORT
exports.submitInspection = async (req, res) => {
  try {
    const { property_id, scheduled_date, overall_score, recommendation } = req.body;

    const inspection = await Inspection.create({
      property_id,
      inspector_id: req.user.user_id,
      scheduled_date,
      overall_score,
      recommendation,
      status: 'completed',
    });

    res.status(201).json({ message: 'Inspection submitted', inspection });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// APPROVE VERIFICATION BADGE
exports.approveBadge = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.property_id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({ 
      verification_badge: true,
      overall_score: req.body.overall_score,
      recommendations: req.body.recommendations,
    });

    res.status(200).json({ message: 'Verification badge approved', property });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};