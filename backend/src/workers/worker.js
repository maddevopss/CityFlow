const { Worker } = require('bullmq');
const config = require('../config');
const diffuseEvent = require('./jobs/diffuseEvent');

const worker = new Worker('diffusion', diffuseEvent, {
  connection: { url: config.redisUrl }
});

worker.on('completed', job => {
  console.log(`✅ Job ${job.id} terminé`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} échoué:`, err.message);
});

console.log('⚙️  Worker de diffusion démarré');
