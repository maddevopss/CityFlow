const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const RedisRateLimitStore = require('./redisRateLimitStore');
const logger = require('../../logger');
const config = require('../../config');

let redisClient = null;
let sharedStore = undefined;
let redisConnected = false;

if (config.redisRateLimitEnabled) {
  redisClient = new Redis(config.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });

  redisClient.on('connect', () => {
    redisConnected = true;
    logger.info('Redis rate limiter connected successfully');
  });

  redisClient.on('error', (err) => {
    redisConnected = false;
    logger.error('Redis rate limiter connection error', {
      message: err.message,
      code: err.code
    });
  });

  redisClient.on('close', () => {
    redisConnected = false;
    logger.warn('Redis rate limiter connection closed');
  });

  redisClient.connect().catch((err) => {
    redisConnected = false;
    logger.error('Failed to connect Redis rate limiter', {
      message: err.message,
      code: err.code
    });
  });

  sharedStore = new RedisRateLimitStore({ client: redisClient });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion, réessayez plus tard' },
  store: sharedStore
});

const authReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de restaurations de session, réessayez plus tard' },
  store: sharedStore
});

const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de consultations publiques, réessayez plus tard' },
  store: sharedStore
});

const permitWebhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes webhook, réessayez plus tard' }
});

const permitWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de modifications de permis, réessayez plus tard' }
});

const permitReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de consultations de permis, réessayez plus tard' }
});

const citizenWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de demandes citoyennes, réessayez plus tard' }
});

const citizenReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de consultations, réessayez plus tard' }
});

const metricsReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de consultations des métriques, réessayez plus tard' }
});

const eventWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de modifications d’événements, réessayez plus tard' }
});

const eventReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de consultations d’événements, réessayez plus tard' }
});

const operationsReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de consultations opérationnelles, réessayez plus tard' }
});

const operationsWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop d’actions opérationnelles, réessayez plus tard' }
});

module.exports = {
  loginLimiter,
  authReadLimiter,
  publicReadLimiter,
  permitWebhookLimiter,
  permitWriteLimiter,
  permitReadLimiter,
  citizenWriteLimiter,
  citizenReadLimiter,
  metricsReadLimiter,
  eventWriteLimiter,
  eventReadLimiter,
  operationsReadLimiter,
  operationsWriteLimiter
};
