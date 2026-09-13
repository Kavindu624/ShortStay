const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'shortstay'
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `);
    
    const schema = {};
    results.forEach(row => {
      if (!schema[row.TABLE_NAME]) schema[row.TABLE_NAME] = [];
      schema[row.TABLE_NAME].push(row.COLUMN_NAME);
    });
    
    console.log(JSON.stringify(schema, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    sequelize.close();
  }
}

run();
