const sequelize = require('./config/db');

async function updateBookings() {
  try {
    const [results] = await sequelize.query("UPDATE booking SET status = 'approved' WHERE status = 'confirmed'");
    console.log(`Updated ${results.affectedRows} bookings to approved.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

updateBookings();
