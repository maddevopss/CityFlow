const { queue } = require('./queue');
const {
  claimOutboxBatch,
  markOutboxProcessed,
  markOutboxFailed
} = require('../services/outbox');
const logger = require('../logger');

let running = false;

async function dispatchOutboxBatch() {
  if (running) return;
  running = true;

  try {
    const entries = await claimOutboxBatch({ limit: 25 });

    for (const entry of entries) {
      try {
        if (entry.eventType !== 'ROAD_EVENT_DIFFUSION_REQUESTED') {
          throw new Error(`Type de sortie non pris en charge: ${entry.eventType}`);
        }

        await queue.add('diffuseEvent', entry.payload, {
          jobId: `outbox-${entry.id}`
        });

        await markOutboxProcessed(entry.id);
      } catch (error) {
        await markOutboxFailed(entry.id, error);
        logger.error(`Sortie ${entry.id} non distribuée`, { error: error.message });
      }
    }
  } finally {
    running = false;
  }
}

function startOutboxDispatcher({ intervalMs = 2000 } = {}) {
  const timer = setInterval(() => {
    dispatchOutboxBatch().catch(error => {
      logger.error('Échec du distributeur de sortie', { error: error.message });
    });
  }, intervalMs);

  timer.unref();
  dispatchOutboxBatch().catch(error => {
    logger.error('Échec initial du distributeur de sortie', { error: error.message });
  });

  return timer;
}

module.exports = { dispatchOutboxBatch, startOutboxDispatcher };
