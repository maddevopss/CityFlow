const { Worker } = require('bullmq');
const config = require('../config');
const diffuseEvent = require('./jobs/diffuseEvent');
const { startOutboxDispatcher } = require('./outboxDispatcher');
const { startDeliverySlaMonitor } = require('./deliverySlaMonitor');

const worker = new Worker('diffusion', diffuseEvent, {
  connection: { url: config.redisUrl }
});

worker.on('completed', job => {
  console.log(`✅ Job ${job.id} terminé`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} échoué:`, err.message);
});

startOutboxDispatcher();
const deliverySlaMonitor = startDeliverySlaMonitor();

async function shutdown(signal) {
  console.log(`🛑 Arrêt du worker reçu (${signal})`);
  deliverySlaMonitor.stop();
  await worker.close();
  process.exit(0);
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

console.log('⚙️  Worker de diffusion, distributeur de sortie et surveillance des objectifs démarrés');
