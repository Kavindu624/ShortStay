const { Booking } = require('./models/index');
const sequelize = require('./config/db');

async function dumpBookings() {
  try {
    const bookings = await Booking.findAll({
      where: { booking_id: [16, 17, 18] },
      order: [['booking_id', 'ASC']]
    });
    bookings.forEach(b => {
      console.log(`Booking ${b.booking_id} | Status: ${b.status} | Guest: ${b.guest_id} | Created: ${b.created_at.toISOString()}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
dumpBookings();
