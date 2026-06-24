// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp        = require('hpp');
const mongoose   = require('mongoose');
const connectDB  = require('./config/db');
const setupIndexes = require('./utils/setupIndexes');

mongoose.set('bufferCommands', false);

process.on('unhandledRejection', (err) => {
  const logger = require('./utils/logger');
  logger.error('Unhandled rejection', { message: err.message });
});

connectDB().then(() => {
  try {
    require('./cron/jobs')();
    setupIndexes().catch(e => console.error('Index setup warning:', e.message));
  } catch(e) {
    const logger = require('./utils/logger');
    logger.error('Startup error', { message: e.message });
  }
});

const app = express();
app.set('trust proxy', 1);

// ── 1. Security headers (Helmet) ────────────────────────────────────────────
// connectSrc was hardcoded to the sandbox Safaricom host only — harmless
// while MPESA_ENV=sandbox, but it would silently block the browser from ever
// reaching the production host if the frontend needs to talk to it directly.
// Mirrors the same MPESA_ENV switch used in middleware/mpesa.js.
const MPESA_CSP_HOST = (process.env.MPESA_ENV || 'sandbox').toLowerCase() === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", MPESA_CSP_HOST],
    },
  },
  crossOriginEmbedderPolicy: false, // allow Cloudinary images
}));

// ── 2. CORS — strict origin whitelist ──────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── 3. Body size limits — prevent large payload DoS ────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 4. NoSQL injection sanitization — strip $ and . from req.body/params ───
// Using a custom approach to avoid the issue with GET requests
app.use((req, res, next) => {
  // Only apply mongo sanitize for POST, PUT, PATCH requests that have body data
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && req.body) {
    mongoSanitize.sanitize(req.body);
  }
  // Sanitize query parameters for specific routes that need it
  if (req.query && (req.method === 'GET' || req.method === 'DELETE')) {
    // Only sanitize if there are actual parameters that could be malicious
    const unsafeParams = ['$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$exists', '$regex'];
    for (const param of unsafeParams) {
      if (req.query[param]) {
        delete req.query[param];
      }
    }
  }
  next();
});

// ── 5. HTTP Parameter Pollution protection ──────────────────────────────────
app.use(hpp({
  whitelist: ['sort', 'category', 'status', 'page', 'limit'],
}));

// ── 6. Global rate limiter — 100 req / 15 min per IP ───────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api/', globalLimiter);

// ── 7. Strict auth rate limiter — 10 attempts / 15 min ─────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── 7a. Chat and callback rate limiter — 20 requests / 1 hour ────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many chat requests, please try again later' },
  keyGenerator: (req) => {
    // Use IP for unauthenticated, user ID for authenticated
    return req.user?.id || req.ip;
  }
});
app.use('/api/chat/callback', chatLimiter);

// ── M-Pesa callback — no rate limit (Safaricom calls this) ──────────────
// Exempt from global limiter by placing before it — already done above

// ── 9. Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbState  = mongoose.connection.readyState;
  const states   = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const ok       = dbState === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db: states[dbState] || 'unknown',
    ...(dbState !== 1 && { hint: 'Set MONGO_URI in backend/.env and restart the server' }),
  });
});

// ── 10. API routes ───────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/clients',       require('./routes/clients'));
app.use('/api/services',      require('./routes/services'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/revenue',       require('./routes/revenue'));
app.use('/api/calculator',    require('./routes/calculator'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/departments',   require('./routes/departments'));
app.use('/api/finance',       require('./routes/finance'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/dept',          require('./routes/deptModules'));
app.use('/api/track',         require('./routes/track')); // Phase 9 market research — public repair status tracker, no auth
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/tickets',       require('./routes/tickets'));
app.use('/api/tickets',       require('./routes/publicTicketsTrack')); 

app.use('/api/staff-portal',  require('./routes/staffPortal'));
app.use('/api/staff-invitation', require('./routes/staffInvitation')); // Staff invitation system
app.use('/api/inventory',     require('./routes/inventory'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/crm',           require('./routes/crm'));
app.use('/api/chat',          require('./routes/chat')); // Added chat routes

app.use('/api/help',          require('./routes/help')); // Help Desk routes

app.use('/api/email',      require('./routes/email'));
app.use('/api/ussd',       require('./routes/ussd'));
app.use('/api/analytics',  require('./routes/analytics'));

// ── 11. 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(require('./middleware/errorHandler'));

// ── 12. Start server + Socket.io ─────────────────────────────────────────────
const http   = require('http');
const { initSocket } = require('./socket');

const PORT      = process.env.PORT || 5001;
const httpServer = http.createServer(app);

initSocket(httpServer);    // attach Socket.io to the http server

httpServer.listen(PORT, () => {
  console.log(`\n🚀  Server running on port ${PORT}`);
  console.log(`🔌  Socket.io attached — real-time events active`);
  console.log(`🔍  Health: http://localhost:${PORT}/api/health\n`);
});

const server = httpServer; // keep alias so error handler below still works

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} is already in use. Run: fuser -k ${PORT}/tcp\n`);
    process.exitCode = 1;
    server.close();
  } else {
    throw err;
  }
});