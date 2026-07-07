const { Booking } = require('./models/index');
const sequelize = require('./config/db');

async function cleanup() {
  try {
    const deletedCount = await Booking.destroy({
      where: {
        guest_id: null
      }
    });
    console.log(`Successfully cleaned up ${deletedCount} orphaned bookings where the guest account was deleted.`);
  } catch (error) {
    console.error('Error cleaning up bookings:', error);
  } finally {
    sequelize.close();
  }
}

cleanup();
