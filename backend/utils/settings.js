const { SystemSetting } = require('../models/index');

/**
 * Fetches all platform settings from the database as a key-value map.
 * Returns default values for critical settings if they are missing.
 */
async function getPlatformSettings() {
  try {
    const settingsRows = await SystemSetting.findAll();
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Provide safe defaults in case they haven't been saved yet
    return {
      commissionRate: parseFloat(settings.commissionRate || '10'),
      minCommission: parseFloat(settings.minCommission || '5'),
      minBookingDays: parseInt(settings.minBookingDays || '1', 10),
      maxAdvanceBooking: parseInt(settings.maxAdvanceBooking || '365', 10),
      notifNewBooking: settings.notifNewBooking !== 'false',
      notifPayment: settings.notifPayment !== 'false',
      notifVerification: settings.notifVerification !== 'false',
      notifEmail: settings.notifEmail || 'admin@shortstay.com',
      supportEmail: settings.supportEmail || 'support@shortstay.com',
      cancellationPolicy: settings.cancellationPolicy || 'Moderate',
    };
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    // Return safe fallback defaults if DB fails
    return {
      commissionRate: 10,
      minCommission: 5,
      minBookingDays: 1,
      maxAdvanceBooking: 365,
      notifNewBooking: true,
      notifPayment: true,
      notifVerification: true,
      notifEmail: 'admin@shortstay.com',
      supportEmail: 'support@shortstay.com',
      cancellationPolicy: 'Moderate',
    };
  }
}

module.exports = {
  getPlatformSettings
};
