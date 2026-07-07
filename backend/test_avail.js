const { PropertyAvailability, Property, Booking } = require('./models/index');

async function test() {
  const property = await Property.findOne({ where: { title: 'Eco-Lodge near Sigiriya Rock' }});
  console.log('Property ID:', property.property_id);

  const bookings = await Booking.findAll({ where: { property_id: property.property_id }});
  console.log('Bookings:', bookings.map(b => ({ id: b.booking_id, status: b.status, checkin: b.checkin_date, checkout: b.checkout_date })));

  const avail = await PropertyAvailability.findAll({ where: { property_id: property.property_id }});
  console.log('Availabilities:', avail.map(a => ({ date: a.available_date, is_booked: a.is_booked })));
}
test();
