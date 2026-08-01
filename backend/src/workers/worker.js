const { Worker } = require('bullmq');
const config = require('../config');
const logger = require('../logger');
const diffuseEvent = require('./jobs/diffuseEvent');
const { startOutboxDispatcher } = require('./outboxDispatcher');
const { startDeliverySlaMonitor } = require('./deliverySlaMonitor');
const { startCitizenRequestEscalationScheduler } = require('./citizenRequestEscalationScheduler');

const worker = new Worker('diffusion', diffuseEvent, {
  connection: { url: config.redisUrl }
});

worker.on('completed', job => {
  logger.info(`Job ${job.id} terminé`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} échoué`, { error: err.message });
});

startOutboxDispatcher();
const deliverySlaMonitor = startDeliverySlaMonitor();
const citizenEscalationScheduler = startCitizenRequestEscalationScheduler();

async function shutdown(signal) {
  logger.info(`Arrêt du worker reçu (${signal})`);
  deliverySlaMonitor.stop();
  citizenEscalationScheduler.stop();
  await worker.close();
  process.exit(0);
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Rejet de promesse non géré dans le worker', {
    error: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Exception non interceptée dans le worker, arrêt du processus', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

logger.info('Worker de diffusion, distributeur de sortie et surveillances périodiques démarrés');
