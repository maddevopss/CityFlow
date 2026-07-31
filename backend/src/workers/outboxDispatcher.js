const { queue } = require('./queue');
const {
  claimOutboxBatch,
  markOutboxProcessed,
  markOutboxFailed
} = require('../services/outbox');

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
        console.error(`❌ Sortie ${entry.id} non distribuée:`, error.message);
      }
    }
  } finally {
    running = false;
  }
}

function startOutboxDispatcher({ intervalMs = 2000 } = {}) {
  const timer = setInterval(() => {
    dispatchOutboxBatch().catch(error => {
      console.error('❌ Échec du distributeur de sortie:', error.message);
    });
  }, intervalMs);

  timer.unref();
  dispatchOutboxBatch().catch(error => {
    console.error('❌ Échec initial du distributeur de sortie:', error.message);
  });

  return timer;
}

module.exports = { dispatchOutboxBatch, startOutboxDispatcher };
