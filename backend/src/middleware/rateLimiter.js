// PATH: backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { AppError } = require('../utils/appError');

const isDev = process.env.NODE_ENV !== 'production';

// ── Helper: skip rate limit for localhost in development ──────
const skipLocalhost = (req) => {
  if (!isDev) return false;
  const ip = req.ip || req.connection?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

// ── Helper: skip for authenticated admin users ─────────────────
// Admins should never get rate-limited on their own dashboard
const skipAdmin = (req) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return false;
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    return decoded?.role === 'admin' || decoded?.role === 'editor';
  } catch {
    return false;
  }
};

const skipIf = (...checks) => (req) => checks.some(fn => fn(req));

// ── General API limiter ────────────────────────────────────────
// Applied to all /api/* routes
// Dev: very lenient (10,000 req / 15 min)
// Prod: 500 req / 15 min per IP (enough for normal visitors + admin)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: isDev
    ? 10000
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIf(skipLocalhost, skipAdmin),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP. Please try again in 15 minutes.',
    });
  },
});

// ── Auth limiter ───────────────────────────────────────────────
// Protects login endpoint from brute force
// Dev: very lenient so you can test freely
// Prod: 20 attempts / 15 min (not 5 — admins sometimes mistype password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 20,
  skipSuccessfulRequests: true,   // successful logins don't count
  skip: skipIf(skipLocalhost),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

// ── Contact form limiter ───────────────────────────────────────
// Prevents contact form spam
// Dev: unlimited; Prod: 5 submissions / hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 10000 : 5,
  skip: skipIf(skipLocalhost, skipAdmin),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many contact form submissions. Please try again in 1 hour.',
    });
  },
});

// ── Upload limiter ─────────────────────────────────────────────
// Prevents upload abuse (Cloudinary has costs)
// Dev: unlimited; Prod: 50 uploads / hour (enough for real admin work)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 10000 : 50,
  skip: skipIf(skipLocalhost, skipAdmin),
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Upload limit exceeded. Please try again in 1 hour.',
    });
  },
});

// ── Analytics limiter ─────────────────────────────────────────
// More lenient — page view tracking fires on every navigation
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isDev ? 10000 : 200,
  skipFailedRequests: true,
  skip: skipIf(skipLocalhost, skipAdmin),
});

// ── Custom limiter factory ─────────────────────────────────────
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max: isDev ? 10000 : max,
    message,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipIf(skipLocalhost, skipAdmin),
    handler: (req, res) => {
      res.status(429).json({ success: false, error: message });
    },
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  contactLimiter,
  uploadLimiter,
  analyticsLimiter,
  createRateLimiter,
};