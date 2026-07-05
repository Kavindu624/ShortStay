/**
 * Seed script — creates default admin, payment_manager, and field_inspector accounts.
 * Run once with: node seed_staff.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
require('./models/index');
const { User } = require('./models/index');

const accounts = [
  {
    name: 'Super Admin',
    email: 'admin@shortstay.com',
    password: 'Admin@123',
    role: 'admin',
    is_verified: true,
    staff: { department: 'Administration', employee_code: 'ADM001', hire_date: new Date() },
  },
  {
    name: 'Payment Manager',
    email: 'pm@shortstay.com',
    password: 'Pm@12345',
    role: 'payment_manager',
    is_verified: true,
    staff: { department: 'Finance', employee_code: 'PM001', hire_date: new Date(), transaction_limit: 100000 },
  },
  {
    name: 'Field Inspector',
    email: 'inspector@shortstay.com',
    password: 'Inspector@123',
    role: 'field_inspector',
    is_verified: true,
    staff: { department: 'Operations', employee_code: 'FI001', hire_date: new Date(), area_assigned: 'Colombo' },
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected\n');

    for (const acc of accounts) {
      const existing = await User.findOne({ where: { email: acc.email } });
      if (existing) {
        console.log(`⚠  ${acc.role} already exists: ${acc.email}`);
        continue;
      }

      const hashed = await bcrypt.hash(acc.password, 10);
      const user = await User.create({
        name: acc.name,
        email: acc.email,
        password: hashed,
        role: acc.role,
        is_verified: true,
      });

      // Insert into staff table
      await sequelize.query(
        `INSERT INTO staff (user_id, role, department, employee_code, hire_date, area_assigned, transaction_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            user.user_id,
            acc.role,
            acc.staff.department,
            acc.staff.employee_code,
            acc.staff.hire_date,
            acc.staff.area_assigned || null,
            acc.staff.transaction_limit || null,
          ],
        }
      );

      console.log(`✓ Created ${acc.role}: ${acc.email}  (password: ${acc.password})`);
    }

    console.log('\n✅ Done! Accounts ready to use.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
