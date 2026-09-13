const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    console.log("Dropping columns from property...");
    await sequelize.query(`
      ALTER TABLE property 
      DROP COLUMN city, 
      DROP COLUMN state, 
      DROP COLUMN zip_code, 
      DROP COLUMN country, 
      DROP COLUMN cleaning_fee, 
      DROP COLUMN security_deposit, 
      DROP COLUMN bathrooms, 
      DROP COLUMN amenities, 
      DROP COLUMN house_rules;
    `);

    console.log("Dropping columns from booking...");
    await sequelize.query(`
      ALTER TABLE booking 
      DROP COLUMN num_adults, 
      DROP COLUMN num_children, 
      DROP COLUMN cleaning_fee, 
      DROP COLUMN security_deposit;
    `);

    console.log("Dropping columns from complain...");
    await sequelize.query(`
      ALTER TABLE complain 
      DROP COLUMN category, 
      DROP COLUMN resolution_note, 
      DROP COLUMN host_response;
    `);

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    sequelize.close();
  }
}

run();
