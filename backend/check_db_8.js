const sequelize = require('./config/db');
const { PropertyAvailability } = require('./models');

async function checkDb() {
  try {
    const avail = await PropertyAvailability.findAll({
      where: { property_id: 14 },
      order: [['available_date', 'ASC']]
    });
    
    avail.forEach(a => {
      const dateStr = a.available_date instanceof Date ? a.available_date.toISOString().split('T')[0] : String(a.available_date);
      if (dateStr.startsWith('2026-07-0')) {
        console.log(`${dateStr} - is_booked: ${a.is_booked}`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

checkDb();
