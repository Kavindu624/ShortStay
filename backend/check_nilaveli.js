const { Property, Booking, PropertyAvailability } = require('./models/index');

async function test() {
  const property = await Property.findOne({ where: { title: 'Nilaveli Beach Villa' }});
  if (!property) return console.log('Property not found');
  console.log('Property ID:', property.property_id);

  const bookings = await Booking.findAll({ where: { property_id: property.property_id }});
  console.log('Bookings:', bookings.map(b => ({
    id: b.booking_id,
    status: b.status,
    checkin: b.checkin_date,
    checkout: b.checkout_date
  })));

  const avail = await PropertyAvailability.findAll({
    where: { property_id: property.property_id, available_date: '2026-07-13' }
  });
  console.log('Availability on 2026-07-13:', avail.map(a => ({
    date: a.available_date,
    is_booked: a.is_booked
  })));
}

test().catch(console.error);
