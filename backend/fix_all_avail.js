const { PropertyAvailability, Booking } = require('./models/index');
const { Op } = require('sequelize');

async function fixAllAvail() {
  try {
    console.log('Fetching all booked availabilities...');
    // Find all rows where is_booked = true
    const availabilities = await PropertyAvailability.findAll({ where: { is_booked: true } });
    console.log(`Found ${availabilities.length} booked dates total.`);

    let fixedCount = 0;

    for (const a of availabilities) {
      // Find if there is any ACTIVE booking for this date and property
      // An active booking is one that is pending, approved, or confirmed
      // And where checkin <= date < checkout
      
      const activeBooking = await Booking.findOne({
        where: {
          property_id: a.property_id,
          status: { [Op.in]: ['pending', 'approved', 'confirmed'] },
          checkin_date: { [Op.lte]: a.available_date },
          checkout_date: { [Op.gt]: a.available_date } // checkout is exclusive
        }
      });

      if (!activeBooking) {
        // No active booking found, so this date shouldn't be locked
        await a.update({ is_booked: false });
        console.log(`Freed up date ${a.available_date} for property ${a.property_id}`);
        fixedCount++;
      }
    }

    console.log(`Successfully fixed ${fixedCount} stranded booked dates across all properties!`);
  } catch (error) {
    console.error('Error fixing availabilities:', error);
  }
}

fixAllAvail().then(() => console.log('Done.')).catch(console.error);
