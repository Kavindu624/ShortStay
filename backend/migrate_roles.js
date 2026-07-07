const sequelize = require('./config/db');

async function migrateRoles() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected.');

    // Since ENUMs in MySQL can't be easily modified to drop values that are in use,
    // we'll first ALTER the column to include the new values.
    console.log('Altering ENUM to include accountant and verifier...');
    await sequelize.query(`
      ALTER TABLE user 
      MODIFY COLUMN role ENUM('guest', 'host', 'admin', 'accountant', 'verifier', 'accountant', 'verifier')
    `);
    
    console.log('Updating existing records...');
    const [update1] = await sequelize.query(`UPDATE user SET role = 'accountant' WHERE role = 'accountant'`);
    console.log(`Updated accountant -> accountant: ${update1.affectedRows} rows`);

    const [update2] = await sequelize.query(`UPDATE user SET role = 'verifier' WHERE role = 'verifier'`);
    console.log(`Updated verifier -> verifier: ${update2.affectedRows} rows`);

    console.log('Altering ENUM to remove old values...');
    await sequelize.query(`
      ALTER TABLE user 
      MODIFY COLUMN role ENUM('guest', 'host', 'admin', 'accountant', 'verifier')
    `);

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateRoles();
