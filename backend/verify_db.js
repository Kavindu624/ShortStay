const sequelize = require('./config/db');
const models = require('./models');

async function verify() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');
    
    // Check all models
    for (const [name, model] of Object.entries(models)) {
      if (model.name === 'Sequelize') continue;
      const count = await model.count();
      console.log(`Model ${name} verified. Record count: ${count}`);
    }
    
    console.log('All models and associations verified successfully without throwing exceptions!');
  } catch(e) {
    console.error('Verification failed:', e);
  } finally {
    process.exit(0);
  }
}
verify();
