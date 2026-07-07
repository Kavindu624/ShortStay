const sequelize = require('./config/db');
const { Payment } = require('./models/index');

async function fixPayment() {
  try {
    await Payment.destroy({ where: { booking_id: 6 } });
    console.log("Deleted payment for booking 6");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

fixPayment();
