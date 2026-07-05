const sequelize = require('./config/db');
const { PropertyAvailability } = require('./models');

async function checkDb() {
  try {
    // Assuming Eco-Lodge is property 3, let's just check the property name first
    const { Property } = require('./models');
    const prop = await Property.findOne({ where: { title: 'Eco-Lodge near Sigiriya Rock' }});
    console.log("Property ID:", prop.property_id);
    
    const avail = await PropertyAvailability.findAll({
      where: { property_id: prop.property_id },
      order: [['available_date', 'ASC']]
    });
    
    avail.forEach(a => {
      if (a.available_date.toISOString().startsWith('2026-07-1')) {
        console.log(`${a.available_date.toISOString().split('T')[0]} - is_booked: ${a.is_booked}`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

checkDb();
