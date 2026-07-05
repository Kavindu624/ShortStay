/**
 * Booking Expiry Cron Job
 * Runs every 15 minutes to find pending bookings whose expires_at has passed
 * and marks them as 'expired', then notifies the guest via email and in-app notification.
 */

const { Booking, Property, User, Notification } = require('../models/index');
const { Op } = require('sequelize');
const sendEmail = require('./sendEmail');
const { markAsAvailable } = require('../controllers/availability.controller');
const { bookingExpiredEmail } = require('./emailTemplates');

async function expireBookings() {
  try {
    const expiredBookings = await Booking.findAll({
      where: {
        status: 'pending',
        expires_at: { [Op.lt]: new Date() },
      },
      include: [{ model: Property, as: 'property' }],
    });

    if (expiredBookings.length === 0) return;

    console.log(`[BookingExpiry] Found ${expiredBookings.length} expired booking(s). Processing...`);

    for (const booking of expiredBookings) {
      await booking.update({ status: 'expired' });
      
      // Free up dates since they were locked when the pending booking was created
      await markAsAvailable(booking.property_id, booking.checkin_date, booking.checkout_date);

      // Notify guest via in-app notification
      try {
        await Notification.create({
          user_id:      booking.guest_id,
          type:         'booking_expired',
          title:        'Booking Expired ⌛',
          message:      `Your booking request for "${booking.property ? booking.property.title : 'a property'}" (Check-in: ${booking.checkin_date}) has expired because the host did not respond in time.`,
          reference_id: booking.booking_id,
        });
      } catch (notifErr) {
        console.error(`[BookingExpiry] Notification failed for booking ${booking.booking_id}:`, notifErr.message);
      }

      // Send email to guest
      try {
        const guest = await User.findByPk(booking.guest_id);
        if (guest && booking.property) {
          await sendEmail(
            guest.email,
            'Booking Expired - ShortStay',
            bookingExpiredEmail(guest.name, booking.property, booking)
          );
        }
      } catch (emailErr) {
        console.error(`[BookingExpiry] Email failed for booking ${booking.booking_id}:`, emailErr.message);
      }

      console.log(`[BookingExpiry] Booking #${booking.booking_id} marked as expired.`);
    }
  } catch (err) {
    console.error('[BookingExpiry] Cron job error:', err.message);
  }
}

/**
 * Start the expiry cron — call this once from server.js after DB connects.
 * Runs every 15 minutes.
 */
function startBookingExpiryCron() {
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  console.log('[BookingExpiry] Cron started — checking every 15 minutes.');
  expireBookings(); // run immediately on startup
  setInterval(expireBookings, INTERVAL_MS);
}

module.exports = { startBookingExpiryCron };
