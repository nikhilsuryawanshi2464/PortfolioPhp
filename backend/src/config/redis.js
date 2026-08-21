// PATH: backend/src/config/redis.js
const redis  = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

/* ─── Connect ──────────────────────────────────────────────── */
const connectRedis = async () => {
  try {
    // Railway injects REDIS_URL; local dev uses REDIS_HOST
    if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
      logger.warn('Redis not configured — caching disabled (projects will still work)');
      return null;
    }

    const clientOptions = process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
          password: process.env.REDIS_PASSWORD || undefined,
        };

    redisClient = redis.createClient({ ...clientOptions, legacyMode: false });

    redisClient.on('error',       (err) => logger.error('Redis error: ' + err.message));
    redisClient.on('connect',     ()    => logger.info('Redis connected'));
    redisClient.on('reconnecting',()    => logger.warn('Redis reconnecting...'));

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.error('Redis connection failed: ' + err.message);
    // Don't crash — app works without Redis (no caching)
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

/* ─── Safe cache wrapper ────────────────────────────────────
   All methods silently no-op when Redis is not connected.
   This means projects / APIs always work even without Redis.
──────────────────────────────────────────────────────────── */
const cache = {
  /**
   * Get a cached value. Returns null if not found or Redis is down.
   */
  async get(key) {
    try {
      if (!redisClient) return null;
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  /**
   * Set a cached value with optional TTL in seconds (default 5 min).
   */
  async set(key, value, ttlSeconds = 300) {
    try {
      if (!redisClient) return;
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Silent — cache miss is fine
    }
  },

  /**
   * Delete a single cache key.
   */
  async del(key) {
    try {
      if (!redisClient) return;
      await redisClient.del(key);
    } catch {
      // Silent
    }
  },

  /**
   * Delete all keys matching a pattern (e.g. 'projects:*').
   * Uses SCAN so it doesn't block the server.
   */
  async delPattern(pattern) {
    try {
      if (!redisClient) return;
      let cursor = 0;
      do {
        const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length) {
          await redisClient.del(result.keys);
        }
      } while (cursor !== 0);
    } catch {
      // Silent
    }
  },
};

module.exports = { connectRedis, getRedisClient, cache };