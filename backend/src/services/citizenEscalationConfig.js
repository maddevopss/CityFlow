'use strict';

const DEFAULT_RETENTION_DAYS = 90;
const DEFAULT_RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MIN_RETENTION_DAYS = 1;
const MAX_RETENTION_DAYS = 3650;
const MIN_RETENTION_INTERVAL_MS = 60 * 1000;

function boundedInteger(value, fallback, min, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const integer = Math.trunc(parsed);
  return Math.min(max, Math.max(min, integer));
}

function getCitizenEscalationRetentionConfig(env = process.env) {
  return {
    retentionDays: boundedInteger(
      env.CITIZEN_ESCALATION_RETENTION_DAYS,
      DEFAULT_RETENTION_DAYS,
      MIN_RETENTION_DAYS,
      MAX_RETENTION_DAYS
    ),
    intervalMs: boundedInteger(
      env.CITIZEN_ESCALATION_RETENTION_INTERVAL_MS,
      DEFAULT_RETENTION_INTERVAL_MS,
      MIN_RETENTION_INTERVAL_MS
    )
  };
}

module.exports = {
  DEFAULT_RETENTION_DAYS,
  DEFAULT_RETENTION_INTERVAL_MS,
  MIN_RETENTION_DAYS,
  MAX_RETENTION_DAYS,
  MIN_RETENTION_INTERVAL_MS,
  getCitizenEscalationRetentionConfig
};
