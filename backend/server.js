const express  = require('express');
const http     = require('http');
const cors     = require('cors');
require('dotenv').config();
const passport = require('./config/passport');
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
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// ── Non-functional middleware ─────────────────────────────────────────────────
app.use(requestLogger);          // HTTP request log  (morgan)
app.use(responseTimeMonitor);    // X-Response-Time header + slow-req warning

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port (dev), and the configured FRONTEND_URL
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  credentials: true
}));

app.use(globalRateLimit);        // 100 req / 15 min / IP

// ── Stripe webhook — must receive RAW body before express.json() parses it ────
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' })
);

app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profiles', express.static('uploads/profiles'));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRateLimit, require('./routes/auth.routes'));
app.use('/api/auth',          authRateLimit, require('./routes/oauth.routes'));
app.use('/api/users',         require('./routes/profile.routes'));
app.use('/api/settings',      require('./routes/settings.routes'));
app.use('/api/properties',    require('./routes/property.routes'));
app.use('/api/bookings',      require('./routes/booking.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/payouts',       require('./routes/payout.routes'));
app.use('/api/reviews',       require('./routes/review.routes'));
app.use('/api/complaints',    require('./routes/complaint.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/inspector',     require('./routes/inspector.routes'));
app.use('/api/availability',  require('./routes/availability.routes'));
app.use('/api/profile',       require('./routes/profile.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard',     require('./routes/dashboard.routes'));

// ── Swagger API Docs ─────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ShortStay API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
}));

app.get('/', (req, res) => {
  res.json({ message: 'ShortStay API is running', docs: `${process.env.BACKEND_URL}/api-docs` });
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