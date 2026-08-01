'use strict';

const prisma = require('../db/prisma');
const logger = require('../logger');
const { escalateCitizenRequestServiceLevels } = require('../services/citizenRequestEscalations');

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

function createCitizenRequestEscalationScheduler({
  db = prisma,
  intervalMs = Number(process.env.CITIZEN_ESCALATION_INTERVAL_MS) || DEFAULT_INTERVAL_MS,
  runImmediately = true,
  log = logger,
  escalate = escalateCitizenRequestServiceLevels
} = {}) {
  let timer = null;
  let running = false;
  let stopped = false;

  async function runOnce() {
    if (running || stopped) return { skipped: true, reason: running ? 'already-running' : 'stopped' };

    running = true;
    try {
      const municipalities = await db.municipality.findMany({ select: { id: true } });
      const results = [];
      for (const municipality of municipalities) {
        results.push({
          municipalityId: municipality.id,
          ...(await escalate(db, municipality.id))
        });
      }
      const summary = results.reduce((total, item) => ({
        scanned: total.scanned + item.scanned,
        candidates: total.candidates + item.candidates,
        created: total.created + item.created
      }), { scanned: 0, candidates: 0, created: 0 });
      log.info('Escalades citoyennes périodiques exécutées', {
        municipalities: municipalities.length,
        ...summary
      });
      return { skipped: false, municipalities: municipalities.length, results, ...summary };
    } catch (error) {
      log.error('Échec du planificateur des escalades citoyennes', {
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

function startCitizenRequestEscalationScheduler(options) {
  const scheduler = createCitizenRequestEscalationScheduler(options);
  scheduler.start();
  return scheduler;
}

module.exports = {
  DEFAULT_INTERVAL_MS,
  createCitizenRequestEscalationScheduler,
  startCitizenRequestEscalationScheduler
};
