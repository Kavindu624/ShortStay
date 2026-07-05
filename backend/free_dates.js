const sequelize = require('./config/db');
const { PropertyAvailability } = require('./models');
const { Op } = require('sequelize');

async function freeDates() {
  try {
    const dates = ['2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10'];
    
    await PropertyAvailability.update(
      { is_booked: false },
      { 
        where: { 
          available_date: { [Op.in]: dates }
        } 
      }
    );
    console.log("Dates successfully freed.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

freeDates();
