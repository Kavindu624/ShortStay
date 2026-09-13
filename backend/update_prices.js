const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    // Round to the nearest 100 to make the LKR prices look clean (e.g. 6555 -> 6600)
    await sequelize.query('UPDATE property SET price_per_night = ROUND(price_per_night / 100) * 100');
    console.log("All property prices have been rounded off to the nearest 100 LKR.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    sequelize.close();
  }
}

run();
