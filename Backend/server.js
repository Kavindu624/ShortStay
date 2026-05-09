const express  = require('express');
const cors     = require('cors');
const passport = require('./config/passport');
require('dotenv').config();
const sequelize = require('./config/db');
require('./models/index');
const { startBookingExpiryCron } = require('./utils/bookingExpiryCron');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profiles', express.static('uploads/profiles'));

// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/auth',          require('./routes/oauth.routes'));
app.use('/api/properties',    require('./routes/property.routes'));
app.use('/api/bookings',      require('./routes/booking.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/reviews',       require('./routes/review.routes'));
app.use('/api/complaints',    require('./routes/complaint.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/inspector',     require('./routes/inspector.routes'));
app.use('/api/availability',  require('./routes/availability.routes'));
app.use('/api/profile',       require('./routes/profile.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'ShortStay API is running' });
});

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('MySQL Connected Successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startBookingExpiryCron(); // start booking expiry background job
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });