const SystemSetting = require('../models/SystemSetting');

exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    const config = {};
    settings.forEach(s => { config[s.key] = s.value; });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    for (const key of Object.keys(newSettings)) {
      await SystemSetting.upsert({ key, value: String(newSettings[key]) });
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
