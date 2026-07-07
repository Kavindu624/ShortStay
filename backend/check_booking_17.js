const { Booking, User } = require('./models/index');
const sequelize = require('./config/db');

async function checkBooking() {
  try {
    const booking = await Booking.findByPk(17);
    console.log("Booking 17:", JSON.stringify(booking, null, 2));
    
    // Also check if there are any other bookings that belong to guest_id null
    const nullGuestBookings = await Booking.findAll({
      where: { guest_id: null }
    });
    console.log("Bookings with null guest:", nullGuestBookings.map(b => b.booking_id));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
checkBooking();
