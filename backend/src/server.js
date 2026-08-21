// backend/src/server.js

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
require('dotenv').config();

const logger   = require('./utils/logger');
const keepalive = require('./services/keepalive.service');

// ─── DB CONNECTION (SERVERLESS SAFE) ──────────────────────────────────────────
// Vercel freezes/thaws the function between requests.
// We cache the connection on the global object so it survives across invocations.

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (retries = 3) => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    logger.info('Connecting to MongoDB...');
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,  // wait 15s for Atlas M0 to wake up
        socketTimeoutMS: 45000,
        bufferCommands: false,
        maxPoolSize: 10,
        retryWrites: true,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    logger.info('MongoDB connected ✅');
    return cached.conn;
  } catch (err) {
    // Atlas M0 wake-up retry — wait 3s and try again
    if (retries > 0) {
      logger.warn(`MongoDB wake-up retry... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, 3000));
      cached.promise = null;
      return connectDB(retries - 1);
    }
    throw err;
  }
};

// ─── ENV CHECK ────────────────────────────────────────────────────────────────
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  // On Vercel this runs at cold-start. Log clearly so it shows in function logs.
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('   Go to Vercel → Project → Settings → Environment Variables and add them.');
  process.exit(1);
}

// ─── IMPORT ROUTES ────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const projectRoutes     = require('./routes/project.routes');
const skillRoutes       = require('./routes/skill.routes');
const experienceRoutes  = require('./routes/experience.routes');
const contactRoutes     = require('./routes/contact.routes');
const analyticsRoutes   = require('./routes/analytics.routes');
const userRoutes        = require('./routes/user.routes');
const githubRoutes      = require('./routes/github.routes');
const resumeRoutes      = require('./routes/resume.routes');
const profileRoutes     = require('./routes/profile.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const blogRoutes        = require('./routes/blog.routes');
const siteSettingsRoutes = require('./routes/settings.routes');
const certRoutes        = require('./routes/certification.routes');
const serviceRoutes     = require('./routes/service.routes');
const commentRoutes     = require('./routes/comment.routes');
const auditLogRoutes    = require('./routes/auditlog.routes');
const subscriberRoutes  = require('./routes/subscriber.routes');
const twofaRoutes       = require('./routes/twofa.routes');
const ogRoutes          = require('./routes/og.routes');
const mediaRoutes       = require('./routes/media.routes');
const sitemapRoutes     = require('./routes/sitemap.routes');

const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter }   = require('./middleware/rateLimiter');

// ─── CREATE APP ───────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(helmet());

// Trust Vercel's proxy so req.ip gives the real client IP (needed for rate
// limiting and analytics geo-lookup to work correctly)
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── DB CONNECT MIDDLEWARE (must be before all routes) ────────────────────────
// This runs on every request. connectDB() is a no-op if already connected.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error('DB connection failed: ' + err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
    });
  }
});

// ─── KEEPALIVE MIDDLEWARE (request-triggered DB ping for Vercel) ─────────────
// On every request: if 9+ min since last ping → silently ping MongoDB
app.use(keepalive.middleware());

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── UTILITY ROUTES ───────────────────────────────────────────────────────────

// Root — Vercel probes this; must return 200 or you get 404 on every route
app.get('/', (req, res) => {
  res.json({ success: true, message: '🚀 Portfolio backend is running' });
});

// Health check — also pings MongoDB to keep Atlas M0 awake
app.get('/health', async (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  let dbStatus = states[mongoose.connection.readyState] || 'unknown';
  let dbPing   = false;
  let dbMs     = 0;

  try {
    const t0 = Date.now();
    await mongoose.connection.db.command({ ping: 1 });
    dbMs     = Date.now() - t0;
    dbPing   = true;
    dbStatus = 'connected';
  } catch(e) {
    dbStatus = 'error: ' + e.message;
  }

  res.json({
    status:      dbPing ? 'healthy' : 'degraded',
    mongodb:     dbStatus,
    dbPingMs:    dbMs,
    uptime:      Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    keepalive:   keepalive.stats(),
    timestamp:   new Date().toISOString(),
  });
});

// ── KEEPALIVE ENDPOINT ────────────────────────────────────────────────────────
// Called by: Vercel Cron (every 5min) + GitHub Actions (every 10min)
// On Vercel: this spins up a fresh function → connectDB → pingDB → responds
// This is the PRIMARY keepalive mechanism on Vercel serverless
app.get('/api/v1/keepalive', async (req, res) => {
  const startMs = Date.now();
  let dbOk = false;
  let dbMs = 0;
  let error = null;

  try {
    // connectDB uses cached connection — if cold start, reconnects
    await connectDB();

    // Lightweight ping
    const t = Date.now();
    await mongoose.connection.db.command({ ping: 1 });
    dbMs = Date.now() - t;
    dbOk = true;
  } catch(e) {
    error = e.message;
  }

  const totalMs = Date.now() - startMs;

  res.json({
    success:   dbOk,
    db:        dbOk ? 'awake' : 'error',
    dbPingMs:  dbMs,
    totalMs,
    error:     error || undefined,
    source:    req.headers['x-vercel-cron'] ? 'vercel-cron'
             : req.headers['user-agent']?.includes('GitHub') ? 'github-actions'
             : req.headers['user-agent']?.includes('UptimeRobot') ? 'uptimerobot'
             : 'manual',
    timestamp: new Date().toISOString(),
  });
});

// Quick API smoke-test
app.get('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working ✅',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
const V = process.env.API_VERSION || 'v1';

app.use(`/api/${V}/auth`,          authRoutes);
app.use(`/api/${V}/projects`,      projectRoutes);
app.use(`/api/${V}/skills`,        skillRoutes);
app.use(`/api/${V}/experience`,    experienceRoutes);
app.use(`/api/${V}/contact`,       contactRoutes);
app.use(`/api/${V}/analytics`,     analyticsRoutes);
app.use(`/api/${V}/users`,         userRoutes);
app.use(`/api/${V}/github`,        githubRoutes);
app.use(`/api/${V}/resume`,        resumeRoutes);
app.use(`/api/${V}/profile`,       profileRoutes);
app.use(`/api/${V}/testimonials`,  testimonialRoutes);
app.use(`/api/${V}/blog`,          blogRoutes);
app.use(`/api/${V}/site-settings`, siteSettingsRoutes);
app.use(`/api/${V}/certifications`,certRoutes);
app.use(`/api/${V}/services`,      serviceRoutes);
app.use(`/api/${V}/comments`,      commentRoutes);
app.use(`/api/${V}/audit-log`,     auditLogRoutes);
app.use(`/api/${V}/subscribers`,   subscriberRoutes);
app.use(`/api/${V}/2fa`,           twofaRoutes);
app.use(`/api/${V}/og`,            ogRoutes);
app.use(`/api/${V}/media`,         mediaRoutes);

// SEO routes — served at root level (not /api/)
app.use('/', sitemapRoutes);

// ─── ERROR HANDLER (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ─── LOCAL DEV SERVER ─────────────────────────────────────────────────────────
// On Vercel this block is skipped — Vercel imports the module and calls the
// exported handler directly. Locally, `node src/server.js` triggers this.
const PORT = process.env.PORT || 5001;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
    console.log(`   Health check  → http://localhost:${PORT}/health`);
    console.log(`   Keepalive     → http://localhost:${PORT}/api/v1/keepalive`);
    console.log(`   API test      → http://localhost:${PORT}/api/v1/test`);
  });

  connectDB()
    .then(() => {
      // Start keepalive AFTER DB connects so first ping succeeds
      keepalive.start();
    })
    .catch((err) => {
      console.error('Initial MongoDB connection failed:', err.message);
      console.error('Server is still listening; API routes will return 503 until MongoDB becomes available.');
    });
}

// ─── EXPORT FOR VERCEL (serverless) ──────────────────────────────────────────
// Must export the raw server/app — NOT { app, server } (object breaks Vercel)
module.exports = server;
