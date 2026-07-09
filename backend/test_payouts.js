const { Payout, Booking, Property } = require('./models');
require('dotenv').config();

async function check() {
  const payouts = await Payout.findAll({
    include: [
      { model: Booking, include: [{ model: Property, as: 'property', attributes: ['title'] }] },
    ],
    limit: 10
  });
  console.log(JSON.stringify(payouts.map(p => ({
    id: p.payout_id,
    booking_id: p.booking_id,
    hasBooking: !!p.booking,
    propertyTitle: p.booking?.property?.title
  })), null, 2));
}
check();
