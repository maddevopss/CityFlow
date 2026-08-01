const {
  DEFAULT_RETENTION_DAYS,
  DEFAULT_INTERVAL_MS,
  createCitizenEscalationRunRetention
} = require('../../src/workers/citizenEscalationRunRetention');
const { purgeCitizenEscalationRuns } = require('../../src/services/citizenEscalationRunHistory');

describe('citizenEscalationRunRetention', () => {
  test('utilise quatre-vingt-dix jours et une exécution quotidienne par défaut', () => {
    expect(DEFAULT_RETENTION_DAYS).toBe(90);
    expect(DEFAULT_INTERVAL_MS).toBe(24 * 60 * 60 * 1000);
  });

  test('supprime uniquement les cycles plus anciens que le seuil', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ deleted: 6 }]) };
    const now = new Date('2026-08-01T12:00:00Z');

    await expect(purgeCitizenEscalationRuns(db, 30, now)).resolves.toMatchObject({
      deleted: 6,
      retentionDays: 30,
      cutoff: new Date('2026-07-02T12:00:00Z')
    });
    expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('WHERE "completed_at" < $1'),
      new Date('2026-07-02T12:00:00Z')
    );
  });

  test('ignore une deuxième purge pendant une exécution active', async () => {
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    const purge = jest.fn().mockReturnValue(pending);
    const retention = createCitizenEscalationRunRetention({
      db: {},
      purge,
      log: { info: jest.fn(), error: jest.fn() },
      runImmediately: false
    });

    const first = retention.runOnce();
    await Promise.resolve();
    await expect(retention.runOnce()).resolves.toEqual({ skipped: true, reason: 'already-running' });
    release({ deleted: 0, retentionDays: 90, cutoff: new Date() });
    await first;
    expect(purge).toHaveBeenCalledTimes(1);
  });

  test('arrête proprement la minuterie', () => {
    jest.useFakeTimers();
    const retention = createCitizenEscalationRunRetention({
      db: {},
      purge: jest.fn(),
      log: { info: jest.fn(), error: jest.fn() },
      runImmediately: false,
      intervalMs: 1000
    });

    retention.start();
    expect(retention.isStarted()).toBe(true);
    retention.stop();
    expect(retention.isStarted()).toBe(false);
    jest.useRealTimers();
  });
});
