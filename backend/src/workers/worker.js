const { Worker } = require('bullmq');
const config = require('../config');
const diffuseEvent = require('./jobs/diffuseEvent');
const { startOutboxDispatcher } = require('./outboxDispatcher');

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

console.log('⚙️  Worker de diffusion et distributeur de sortie démarrés');
