// backend/src/services/keepalive.service.js
// ─────────────────────────────────────────────────────────────────────────────
// DB KEEPALIVE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
// Prevents MongoDB Atlas M0 (free tier) from sleeping by:
//   1. Pinging the DB directly every 9 minutes via setInterval
//   2. Self-pinging /health HTTP endpoint every 14 minutes as backup
//
// HOW IT WORKS ON VERCEL:
//   Vercel serverless functions sleep between requests — so node-cron
//   doesn't work there. Instead we use TWO strategies:
//
//   Strategy A (works locally / Railway / Render):
//     → setInterval inside the Node process pings MongoDB every 9 min
//
//   Strategy B (works everywhere including Vercel):
//     → On every incoming request, check if 9+ minutes have passed
//       since last ping — if yes, do a lightweight DB ping
//     → This is triggered via middleware in server.js
//
//   Strategy C (best for Vercel, external):
//     → Use UptimeRobot / cron-job.org (free) to hit /health every 5 min
//     → Zero setup in code needed — just register the URL externally
//
// USAGE in server.js:
//   const keepalive = require('./services/keepalive.service');
//   keepalive.start();                    ← call after DB connects
//   app.use(keepalive.middleware());       ← add before routes

const mongoose = require('mongoose');
const axios    = require('axios');
const logger   = require('../utils/logger');

// ── Config ──────────────────────────────────────────────────────────────────
const PING_INTERVAL_MS  = 9 * 60 * 1000;   // 9 minutes — Atlas sleeps at ~10 min
const HTTP_INTERVAL_MS  = 14 * 60 * 1000;  // 14 minutes HTTP self-ping (backup)
const SELF_URL          = process.env.BACKEND_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || `http://localhost:${process.env.PORT || 5001}`;

// ── State ────────────────────────────────────────────────────────────────────
let lastDbPingAt    = Date.now();
let lastHttpPingAt  = Date.now();
let dbPingCount     = 0;
let dbPingErrors    = 0;
let isRunning       = false;
let dbInterval      = null;
let httpInterval    = null;

// ── Core: ping MongoDB directly ──────────────────────────────────────────────
const pingDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      logger.warn('[Keepalive] MongoDB not connected — skipping ping');
      return false;
    }
    // Lightest possible operation — just a ping command
    await mongoose.connection.db.command({ ping: 1 });
    lastDbPingAt = Date.now();
    dbPingCount++;
    logger.info(`[Keepalive] ✅ DB ping #${dbPingCount} — MongoDB is awake`);
    return true;
  } catch (err) {
    dbPingErrors++;
    logger.error(`[Keepalive] ❌ DB ping failed (#${dbPingErrors}): ${err.message}`);
    return false;
  }
};

// ── Backup: HTTP self-ping ───────────────────────────────────────────────────
const pingHTTP = async () => {
  try {
    const url = `${SELF_URL}/health`;
    const res = await axios.get(url, { timeout: 8000 });
    lastHttpPingAt = Date.now();
    logger.info(`[Keepalive] 🌐 HTTP self-ping → ${url} — ${res.status} ${res.data?.mongodb || ''}`);
  } catch (err) {
    // HTTP ping failure is not critical — DB ping is the real keepalive
    logger.warn(`[Keepalive] HTTP self-ping failed: ${err.message} (URL: ${SELF_URL}/health)`);
  }
};

// ── Middleware: request-triggered ping (works on Vercel) ─────────────────────
// This runs on every incoming API request.
// If 9+ minutes have passed since last ping — ping DB silently.
const middleware = () => (req, res, next) => {
  const now      = Date.now();
  const elapsed  = now - lastDbPingAt;
  if (elapsed >= PING_INTERVAL_MS) {
    // Fire-and-forget — don't await, don't block the request
    pingDB().catch(() => {});
  }
  next();
};

// ── Start: interval-based pinging (works locally / Railway / Render) ─────────
const start = () => {
  if (isRunning) return;
  isRunning = true;

  // Do initial ping immediately
  pingDB().then(() => {
    logger.info('[Keepalive] 🚀 Keepalive service started');
    logger.info(`[Keepalive]    DB ping every ${PING_INTERVAL_MS / 60000} min`);
    logger.info(`[Keepalive]    HTTP self-ping every ${HTTP_INTERVAL_MS / 60000} min`);
    logger.info(`[Keepalive]    Self URL: ${SELF_URL}`);
  });

  // DB ping interval
  dbInterval = setInterval(pingDB, PING_INTERVAL_MS);

  // HTTP self-ping interval (backup)
  httpInterval = setInterval(pingHTTP, HTTP_INTERVAL_MS);

  // Prevent the intervals from blocking process exit in tests
  if (dbInterval.unref)   dbInterval.unref();
  if (httpInterval.unref) httpInterval.unref();
};

// ── Stop: clean up intervals ─────────────────────────────────────────────────
const stop = () => {
  if (dbInterval)   clearInterval(dbInterval);
  if (httpInterval) clearInterval(httpInterval);
  isRunning   = false;
  dbInterval  = null;
  httpInterval = null;
  logger.info('[Keepalive] Stopped');
};

// ── Stats: expose keepalive health info ──────────────────────────────────────
const stats = () => ({
  isRunning,
  lastDbPingAt:   new Date(lastDbPingAt).toISOString(),
  lastHttpPingAt: new Date(lastHttpPingAt).toISOString(),
  minutesSinceDbPing:   Math.round((Date.now() - lastDbPingAt)   / 60000),
  minutesSinceHttpPing: Math.round((Date.now() - lastHttpPingAt) / 60000),
  totalDbPings:   dbPingCount,
  totalDbErrors:  dbPingErrors,
  selfUrl:        SELF_URL,
  pingIntervalMin: PING_INTERVAL_MS / 60000,
});

module.exports = { start, stop, pingDB, pingHTTP, middleware, stats };
