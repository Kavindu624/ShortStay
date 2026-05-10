const express  = require('express');
const http     = require('http');
const cors     = require('cors');
const passport = require('./config/passport');
require('dotenv').config();
const sequelize = require('./config/db');
require('./models/index');
const { startBookingExpiryCron } = require('./utils/bookingExpiryCron');
const { initSocket } = require('./utils/websocket');
const {
  requestLogger,
  globalRateLimit,
  authRateLimit,
  responseTimeMonitor,
  errorLogger,
} = require('./middleware/system.middleware');

const app = express();

// ── Non-functional middleware ─────────────────────────────────────────────────
app.use(requestLogger);          // HTTP request log  (morgan)
app.use(responseTimeMonitor);    // X-Response-Time header + slow-req warning
app.use(globalRateLimit);        // 100 req / 15 min / IP

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profiles', express.static('uploads/profiles'));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRateLimit, require('./routes/auth.routes'));
app.use('/api/auth',          authRateLimit, require('./routes/oauth.routes'));
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
app.use('/api/dashboard',     require('./routes/dashboard.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'ShortStay API is running' });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorLogger);

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('MySQL Connected Successfully');
    const server = http.createServer(app);
    initSocket(server);          // initialise Socket.IO for real-time notifications
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startBookingExpiryCron();
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });