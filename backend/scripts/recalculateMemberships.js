// One-off: recompute every guest's membership_level under the new
// completed-bookings rule (previously based on confirmed bookings).
// Run once: node scripts/recalculateMemberships.js

const sequelize = require('../config/db');
const { User } = require('../models/index');
const updateMembership = require('../utils/membership');

(async () => {
  try {
    const guests = await User.findAll({ where: { role: 'guest' } });

    console.log(`Recalculating membership for ${guests.length} guest(s)...\n`);

    for (const guest of guests) {
      const before = guest.membership_level;
      const after = await updateMembership(guest.user_id);
      const changed = before !== after ? '  <-- changed' : '';
      console.log(`user_id ${guest.user_id}: ${before} -> ${after}${changed}`);
    }

    console.log('\nDone.');
  } catch (err) {
    console.error('Recalculation failed:', err.message);
  } finally {
    await sequelize.close();
  }
})();
