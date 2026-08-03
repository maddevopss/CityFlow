require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function requireProductionSecret(name, value, minimumLength = 32) {
  if (!isProduction) return value;

  if (!value || value.length < minimumLength) {
    throw new Error(`${name} doit être défini avec au moins ${minimumLength} caractères en production`);
  }

  return value;
}

function requireProductionUrl(name, value) {
  if (!isProduction) return value;

  if (!value) {
    throw new Error(`${name} doit être définie en production`);
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
  } catch {
    throw new Error(`${name} doit être une URL HTTP ou HTTPS valide en production`);
  }

  return value;
}

const jwtSecret = requireProductionSecret(
  'JWT_SECRET',
  process.env.JWT_SECRET || (isProduction ? undefined : 'development-only-cityflow-secret')
);

const permitWebhookSecret = requireProductionSecret(
  'PERMIT_WEBHOOK_SECRET',
  process.env.PERMIT_WEBHOOK_SECRET || (isProduction ? undefined : 'development-only-permit-webhook-secret')
);

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret,
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  jwtAlgorithm: 'HS256',
  jwtIssuer: process.env.JWT_ISSUER || 'cityflow',
  jwtAudience: process.env.JWT_AUDIENCE || 'cityflow-api',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  permitWebhookSecret,
  permitWebhookToleranceSeconds: Number(process.env.PERMIT_WEBHOOK_TOLERANCE_SECONDS || 300),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisRateLimitEnabled: process.env.REDIS_RATE_LIMIT_ENABLED === 'true',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  wazeCcpUrl: requireProductionUrl('WAZE_CCP_URL', process.env.WAZE_CCP_URL),
  nodeEnv
};
