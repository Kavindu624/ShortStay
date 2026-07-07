const { Booking, User, Property } = require('./models/index');
const sequelize = require('./config/db');

async function testLogic() {
  try {
    // 1. Create a dummy guest
    const guest = await User.create({
      name: 'Test Guest',
      email: 'testguest' + Date.now() + '@example.com',
      password: 'password',
      role: 'guest'
    });
    
    // 2. Create a dummy property if none exists, or use property 15
    const property_id = 15;

    // 3. Create a booking
    const booking = await Booking.create({
      guest_id: guest.user_id,
      property_id,
      checkin_date: '2026-10-10',
      checkout_date: '2026-10-12',
      total_price: 100,
      status: 'pending'
    });

    console.log("Created booking:", booking.booking_id, "status:", booking.status);

    // 4. Run the exact logic from deleteUser
    const activeBookings = await Booking.findAll({
      where: {
        guest_id: guest.user_id,
        status: ['pending', 'approved', 'confirmed']
      }
    });

    console.log("Found active bookings:", activeBookings.length);

    for (const b of activeBookings) {
      await b.update({ status: 'cancelled' });
      console.log("Updated booking", b.booking_id, "to cancelled");
    }

    // 5. Delete user
    await guest.destroy();
    console.log("Deleted guest");

    // 6. Fetch booking again
    const b2 = await Booking.findByPk(booking.booking_id);
    console.log("Booking after deletion:", b2.booking_id, "status:", b2.status, "guest_id:", b2.guest_id);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
testLogic();
