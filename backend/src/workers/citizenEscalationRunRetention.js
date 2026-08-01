'use strict';

const prisma = require('../db/prisma');
const logger = require('../logger');
const { purgeCitizenEscalationRuns } = require('../services/citizenEscalationRunHistory');

const DEFAULT_RETENTION_DAYS = 90;
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000;

function createCitizenEscalationRunRetention({
  db = prisma,
  retentionDays = Number(process.env.CITIZEN_ESCALATION_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS,
  intervalMs = Number(process.env.CITIZEN_ESCALATION_RETENTION_INTERVAL_MS) || DEFAULT_INTERVAL_MS,
  runImmediately = true,
  purge = purgeCitizenEscalationRuns,
  log = logger
} = {}) {
  let timer = null;
  let running = false;
  let stopped = false;

  async function runOnce() {
    if (running || stopped) {
      return { skipped: true, reason: running ? 'already-running' : 'stopped' };
    }

    running = true;
    try {
      const result = await purge(db, retentionDays, new Date());
      log.info('Rétention des cycles d’escalade citoyenne exécutée', result);
      return { skipped: false, ...result };
    } catch (error) {
      log.error('Échec de la rétention des cycles d’escalade citoyenne', {
        error: error.message,
        stack: error.stack
      });
      return { skipped: false, error };
    } finally {
      running = false;
    }
  }

  function start() {
    if (timer || stopped) return;
    timer = setInterval(() => void runOnce(), intervalMs);
    if (typeof timer.unref === 'function') timer.unref();
    if (runImmediately) void runOnce();
  }

  function stop() {
    stopped = true;
    if (timer) clearInterval(timer);
    timer = null;
  }

  return {
    start,
    stop,
    runOnce,
    isRunning: () => running,
    isStarted: () => Boolean(timer)
  };
}

function startCitizenEscalationRunRetention(options) {
  const retention = createCitizenEscalationRunRetention(options);
  retention.start();
  return retention;
}

module.exports = {
  DEFAULT_RETENTION_DAYS,
  DEFAULT_INTERVAL_MS,
  createCitizenEscalationRunRetention,
  startCitizenEscalationRunRetention
};
