const { PropertyAvailability, Booking } = require('./models/index');
const { Op } = require('sequelize');

async function fixAvail() {
  console.log('Fetching all booked availabilities...');
  const availabilities = await PropertyAvailability.findAll({ where: { is_booked: true }});
  let fixed = 0;

  for (const a of availabilities) {
    const propId = a.property_id;
    const date = typeof a.available_date === 'string' ? a.available_date : a.available_date.toISOString().split('T')[0];
    
    const activeBooking = await Booking.findOne({
      where: {
        property_id: propId,
        status: { [Op.in]: ['pending', 'approved', 'confirmed'] },
        checkin_date: { [Op.lte]: date },
        checkout_date: { [Op.gt]: date } // checkout is exclusive
      }
    });

    if (!activeBooking) {
      await a.update({ is_booked: false });
      fixed++;
    }
  }

  console.log(`Fixed ${fixed} stranded availability records.`);
}

fixAvail().then(() => console.log('Done')).catch(console.error);
