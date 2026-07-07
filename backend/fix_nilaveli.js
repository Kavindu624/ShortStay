const { PropertyAvailability, Booking, Property } = require('./models/index');
const { Op } = require('sequelize');

async function fix() {
  const property = await Property.findOne({ where: { title: 'Nilaveli Beach Villa' }});
  const avail = await PropertyAvailability.findAll({ where: { property_id: property.property_id, is_booked: true }});
  
  for (const a of avail) {
    await a.update({ is_booked: false });
    console.log(`Freed up ${a.available_date} for ${property.title}`);
  }
}

fix().then(() => console.log('Done')).catch(console.error);
