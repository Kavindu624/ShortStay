const { Booking, User } = require('../models/index');

// Single source of truth for membership tier thresholds (min. completed bookings).
const MEMBERSHIP_THRESHOLDS = { silver: 5, gold: 10, platinum: 20 };

const levelForCompletedCount = (bookingCount) => {
  if (bookingCount >= MEMBERSHIP_THRESHOLDS.platinum) return 'platinum';
  if (bookingCount >= MEMBERSHIP_THRESHOLDS.gold) return 'gold';
  if (bookingCount >= MEMBERSHIP_THRESHOLDS.silver) return 'silver';
  return 'basic';
};

// Count total completed bookings (stays actually finished) for this guest
const countCompletedBookings = (guest_id) => Booking.count({
  where: { guest_id, status: 'completed' }
});

const updateMembership = async (guest_id) => {
  try {
    const bookingCount = await countCompletedBookings(guest_id);
    const membership_level = levelForCompletedCount(bookingCount);

    await User.update(
      { membership_level },
      { where: { user_id: guest_id } }
    );

    console.log(`Guest ${guest_id} membership updated to ${membership_level}`);

    return membership_level;
  } catch (err) {
    console.error('Membership update failed:', err.message);
  }
};

module.exports = updateMembership;
module.exports.MEMBERSHIP_THRESHOLDS = MEMBERSHIP_THRESHOLDS;
module.exports.levelForCompletedCount = levelForCompletedCount;
module.exports.countCompletedBookings = countCompletedBookings;