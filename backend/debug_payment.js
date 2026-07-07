const { Booking, Payment } = require('./models/index');

async function checkBooking() {
  try {
    const booking_id = 12; // BK-2026-012
    const booking = await Booking.findByPk(booking_id);
    console.log("Booking found:", booking ? booking.toJSON() : null);

    const existingPayment = await Payment.findOne({ where: { booking_id } });
    console.log("Existing payment:", existingPayment ? existingPayment.toJSON() : null);
  } catch (err) {
    console.error(err);
  }
}

checkBooking();
