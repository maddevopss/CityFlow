const { createDeliverySlaAlerts } = require('../services/deliveryServiceLevels');
const defaultLogger = require('../logger');

const DEFAULT_INTERVAL_MS = 60_000;

function createDeliverySlaMonitor({
  intervalMs = Number(process.env.DELIVERY_SLA_MONITOR_INTERVAL_MS) || DEFAULT_INTERVAL_MS,
  evaluate = createDeliverySlaAlerts,
  logger = defaultLogger,
  runImmediately = true
} = {}) {
  let timer = null;
  let running = false;
  let stopped = false;

  async function runOnce() {
    if (running || stopped) return { skipped: true };

    running = true;
    try {
      const createdAlerts = await evaluate();
      return { skipped: false, createdAlerts };
    } catch (error) {
      logger.error('❌ Échec de la surveillance des objectifs de diffusion:', error);
      return { skipped: false, error };
    } finally {
      running = false;
    }
  }

  function start() {
    if (timer || stopped) return;

    timer = setInterval(runOnce, intervalMs);
    if (typeof timer.unref === 'function') timer.unref();

    if (runImmediately) {
      void runOnce();
    }
  }

  function stop() {
    stopped = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  return {
    start,
    stop,
    runOnce,
    isRunning: () => running,
    isStarted: () => Boolean(timer)
  };
}

function startDeliverySlaMonitor(options) {
  const monitor = createDeliverySlaMonitor(options);
  monitor.start();
  return monitor;
}

module.exports = {
  DEFAULT_INTERVAL_MS,
  createDeliverySlaMonitor,
  startDeliverySlaMonitor
};
