const { Booking } = require('./models/index');

async function clean() {
  try {
    const count = await Booking.destroy({
      where: {
        guest_id: null
      }
    });
    console.log(`Successfully deleted ${count} orphaned bookings (Guest #null).`);
  } catch (err) {
    console.error('Error cleaning bookings:', err);
  } finally {
    process.exit(0);
  }
}

clean();
