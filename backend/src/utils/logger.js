// src/utils/logger.js
// Vercel serverless functions run in a read-only filesystem — never write to disk.
// All logs go to Console only; Vercel captures stdout/stderr and shows them in
// the dashboard under Project → Logs.

const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta, null, 2)}`
      : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'portfolio-api' },

  // ✅ Console only — no File transports, no mkdir, works on Vercel
  transports: [
    new winston.transports.Console({ format: logFormat }),
  ],

  // Uncaught exceptions and unhandled rejections → console
  exceptionHandlers: [
    new winston.transports.Console({ format: logFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: logFormat }),
  ],
});

// Morgan stream integration
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;