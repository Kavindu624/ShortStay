const sequelize = require('./config/db');
const { PropertyAvailability, Property } = require('./models');
const { Op } = require('sequelize');

async function fixDates() {
  try {
    const prop = await Property.findOne({ where: { title: 'Eco-Lodge near Sigiriya Rock' }});
    if (prop) {
      await PropertyAvailability.update(
        { is_booked: true },
        { 
          where: { 
            property_id: prop.property_id,
            available_date: { [Op.in]: ['2026-07-08', '2026-07-09'] }
          } 
        }
      );
      console.log("Fixed Eco-Lodge dates.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

fixDates();
