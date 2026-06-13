const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

// ─── Request Logger (morgan) ─────────────────────────────────────────────────
// Logs: method, url, status, response-time, content-length
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    skip: (req) => req.url === '/',   // skip health-check pings
  }
);

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
// 100 requests per 15 minutes per IP across all routes
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ─── Auth Rate Limiter ────────────────────────────────────────────────────────
// Stricter: 10 attempts per 15 minutes for login/register endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many auth attempts from this IP. Please try again after 15 minutes.',
  },
});

// ─── Response Time Tracker ────────────────────────────────────────────────────
// Attaches X-Response-Time header and logs slow responses (>1s)
// NOTE: Header must be set BEFORE res.end() is called — not in the 'finish'
// event (which fires after headers are already sent → ERR_HTTP_HEADERS_SENT).
const responseTimeMonitor = (req, res, next) => {
  const start      = Date.now();
  const originalEnd = res.end.bind(res);

  res.end = (...args) => {
    const ms = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${ms}ms`);
    }
    if (ms > 1000) {
      console.warn(`[SLOW] ${req.method} ${req.originalUrl} took ${ms}ms`);
    }
    return originalEnd(...args);
  };

  next();
};

// ─── Error Logger ─────────────────────────────────────────────────────────────
// Global error handler — must be registered LAST in Express middleware chain
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] ${timestamp} ${req.method} ${req.originalUrl}`);
  console.error(`  Message : ${err.message}`);
  console.error(`  Stack   : ${err.stack}`);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  requestLogger,
  globalRateLimit,
  authRateLimit,
  responseTimeMonitor,
  errorLogger,
};
