const { Queue } = require('bullmq');
const config = require('../config');

const queue = new Queue('diffusion', {
  connection: { url: config.redisUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

module.exports = { queue };
