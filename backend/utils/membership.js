const { Booking, User } = require('../models/index');

const updateMembership = async (guest_id) => {
  try {
    // Count total confirmed bookings for this guest
    const bookingCount = await Booking.count({
      where: { 
        guest_id,
        status: 'confirmed'
      }
    });

    // Determine membership level
    let membership_level = 'basic';

    if (bookingCount >= 10) {
      membership_level = 'gold';
    } else if (bookingCount >= 5) {
      membership_level = 'silver';
    } else {
      membership_level = 'basic';
    }

    // Update user membership
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