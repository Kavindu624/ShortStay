const { Booking } = require('./models/index');
const sequelize = require('./config/db');

async function testUpdate() {
  try {
    const booking = await Booking.findByPk(17);
    console.log("Before update:", booking.status);
    await booking.update({ status: 'cancelled' });
    console.log("After update:", booking.status);
  } catch (err) {
    console.error("Update failed:", err.message);
  } finally {
    process.exit();
  }
}
testUpdate();
