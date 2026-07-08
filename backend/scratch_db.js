const { User } = require('./models');
const sequelize = require('./config/db');

async function test() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@shortstay.com' } });
    if (admin) {
      admin.failed_login_count = 0;
      admin.locked_until = null;
      await admin.save();
      console.log('Admin rate limit cleared');
    }
  } catch(e) {
    console.error("DB Error:", e.message);
  } finally {
    process.exit(0);
  }
}
test();
