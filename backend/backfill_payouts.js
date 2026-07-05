const sequelize = require('./config/db');
const { Payment, Booking, Property, Payout } = require('./models');
const { getPlatformSettings } = require('./utils/settings');

async function backfill() {
  try {
    const settings = await getPlatformSettings();
    const payments = await Payment.findAll({
      where: { payment_status: 'completed' },
      include: [{
        model: Booking,
        include: [{ model: Property, as: 'property' }]
      }]
    });

    let count = 0;
    for (let p of payments) {
      if (p.booking && p.booking.property) {
        const existing = await Payout.findOne({ where: { booking_id: p.booking_id } });
        if (!existing) {
          const gross = parseFloat(p.amount);
          const rate = parseFloat(settings.commissionRate || '10');
          let comm = parseFloat((gross * rate / 100).toFixed(2));
          if (comm < settings.minCommission) comm = settings.minCommission;
          const net = parseFloat((gross - comm).toFixed(2));

          await Payout.create({
            host_id: p.booking.property.host_id,
            payment_id: p.payment_id,
            booking_id: p.booking_id,
            gross_amount: gross,
            commission_rate: rate,
            commission_amount: comm,
            payout_amount: net,
            currency: p.currency || 'USD',
            status: 'pending'
          });
          count++;
        }
      }
    }
    console.log(`Backfilled ${count} payouts.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

backfill();
