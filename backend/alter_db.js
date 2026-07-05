const sequelize = require('./config/db');

async function alterEnum() {
  try {
    await sequelize.query("ALTER TABLE booking MODIFY COLUMN status ENUM('pending', 'approved', 'confirmed', 'completed', 'cancelled', 'rejected', 'expired') DEFAULT 'pending'");
    console.log("Successfully altered enum");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

alterEnum();
