const { Booking, Payment, Payout, Property } = require('./models/index');

async function testSuccessFlow() {
  try {
    const booking = await Booking.findByPk(12, {
      include: [{ model: Property, as: 'property', attributes: ['title', 'address', 'host_id'] }]
    });
    const payment = await Payment.findOne({ where: { booking_id: 12 } });

    console.log("Creating payout for host_id:", booking.property.host_id);
    
    // Simulate what _postPaymentSuccess does
    try {
      const existingPayout = await Payout.findOne({ where: { booking_id: booking.booking_id } });
      if (!existingPayout) {
        await Payout.create({
          host_id: booking.property.host_id,
          payment_id: payment.payment_id,
          booking_id: booking.booking_id,
          gross_amount: parseFloat(payment.amount),
          commission_rate: 10,
          commission_amount: 5000,
          payout_amount: 45000,
          currency: 'USD',
          status: 'pending',
        });
        console.log("Payout created");
      } else {
        console.log("Payout already exists");
      }
    } catch (e) {
      console.error("Payout creation failed:", e.message);
    }

    try {
      if (booking.status === 'approved') {
        console.log("Updating booking status to confirmed");
        await booking.update({ status: 'confirmed' });
        console.log("Booking updated successfully");
      }
    } catch (e) {
      console.error("Booking update failed:", e.message);
    }

  } catch (err) {
    console.error(err);
  }
}

testSuccessFlow();
