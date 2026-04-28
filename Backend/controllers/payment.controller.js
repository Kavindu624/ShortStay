const { Payment, Booking, Property, User } = require('../models/index');
const sendEmail = require('../utils/sendEmail');
const { paymentSuccessEmail } = require('../utils/emailTemplates');

// PROCESS PAYMENT (Guest only)
exports.processPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;

    // Check booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure the guest owns this booking
    if (booking.guest_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({ where: { booking_id } });
    if (existingPayment) {
      return res.status(400).json({ message: 'Already paid for this booking' });
    }

    // Create payment
    const payment = await Payment.create({
      booking_id,
      amount: booking.total_price,
      payment_date: new Date(),
    });

    // Update booking status to confirmed
    await booking.update({ status: 'confirmed' });

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL PAYMENTS (Payment Manager only)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title', 'address'] },
          { model: User, as: 'guest', attributes: ['name', 'email'] },
        ]
      }]
    });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE PAYMENT RECEIPT
exports.getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { booking_id: req.params.booking_id },
      include: [{
        model: Booking,
        include: [
          { model: Property, as: 'property', attributes: ['title', 'address'] },
          { model: User, as: 'guest', attributes: ['name', 'email'] },
        ]
      }]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GENERATE FINANCIAL REPORT (Payment Manager only)
exports.generateReport = async (req, res) => {
  try {
    const payments = await Payment.findAll();

    const totalRevenue = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    res.status(200).json({
      total_payments: payments.length,
      total_revenue: totalRevenue.toFixed(2),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};