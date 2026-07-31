jest.mock('../../src/services/deliveryServiceLevels', () => ({
  createDeliverySlaAlerts: jest.fn()
}));

const { createDeliverySlaAlerts } = require('../../src/services/deliveryServiceLevels');
const {
  createDeliverySlaMonitor,
  DEFAULT_INTERVAL_MS
} = require('../../src/workers/deliverySlaMonitor');

describe('deliverySlaMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    createDeliverySlaAlerts.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('utilise un intervalle d’une minute par défaut', () => {
    expect(DEFAULT_INTERVAL_MS).toBe(60_000);
  });

  it('évalue immédiatement puis à chaque intervalle', async () => {
    const monitor = createDeliverySlaMonitor({ intervalMs: 1_000 });

    monitor.start();
    await Promise.resolve();
    expect(createDeliverySlaAlerts).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1_000);
    await Promise.resolve();
    expect(createDeliverySlaAlerts).toHaveBeenCalledTimes(2);

    monitor.stop();
  });

  it('empêche deux évaluations concurrentes', async () => {
    let resolveEvaluation;
    createDeliverySlaAlerts.mockImplementation(() => new Promise(resolve => {
      resolveEvaluation = resolve;
    }));

    const monitor = createDeliverySlaMonitor({ runImmediately: false });
    const first = monitor.runOnce();
    const second = await monitor.runOnce();

    expect(second).toEqual({ skipped: true });
    expect(createDeliverySlaAlerts).toHaveBeenCalledTimes(1);

    resolveEvaluation(3);
    await expect(first).resolves.toEqual({ skipped: false, createdAlerts: 3 });
  });

  it('journalise une erreur sans arrêter les prochaines évaluations', async () => {
    const logger = { error: jest.fn() };
    createDeliverySlaAlerts
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce(2);

    const monitor = createDeliverySlaMonitor({ logger, runImmediately: false });

    const failed = await monitor.runOnce();
    const recovered = await monitor.runOnce();

    expect(failed.error).toBeInstanceOf(Error);
    expect(recovered).toEqual({ skipped: false, createdAlerts: 2 });
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('cesse toute nouvelle évaluation après arrêt', async () => {
    const monitor = createDeliverySlaMonitor({ runImmediately: false });
    monitor.start();
    monitor.stop();

    jest.advanceTimersByTime(DEFAULT_INTERVAL_MS * 2);
    await Promise.resolve();

    expect(createDeliverySlaAlerts).not.toHaveBeenCalled();
    await expect(monitor.runOnce()).resolves.toEqual({ skipped: true });
  });
});
