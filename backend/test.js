const { Booking, Property, User } = require('./models/index');

async function run() {
  const bookings = await Booking.findAll({
    include: [
      { model: Property, as: 'property' },
      { model: User, as: 'guest' }
    ]
  });
  
  if(bookings.length > 0) {
    console.log("First booking guest:", bookings[0].guest?.name);
    console.log("First booking property:", bookings[0].property?.title);
  } else {
    console.log("No bookings.");
  }
  process.exit(0);
}

run();
