const {
  DEFAULT_INTERVAL_MS,
  createCitizenRequestEscalationScheduler
} = require('../../src/workers/citizenRequestEscalationScheduler');

describe('citizenRequestEscalationScheduler', () => {
  test('utilise un intervalle de quinze minutes par défaut', () => {
    expect(DEFAULT_INTERVAL_MS).toBe(15 * 60 * 1000);
  });

  test('exécute les escalades pour chaque municipalité et agrège le résultat', async () => {
    const db = {
      municipality: { findMany: jest.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]) }
    };
    const escalate = jest.fn()
      .mockResolvedValueOnce({ scanned: 3, candidates: 1, created: 2 })
      .mockResolvedValueOnce({ scanned: 4, candidates: 2, created: 3 });
    const recordRun = jest.fn().mockResolvedValue({ id: 1 });
    const log = { info: jest.fn(), error: jest.fn() };
    const scheduler = createCitizenRequestEscalationScheduler({ db, escalate, recordRun, log, runImmediately: false });

    await expect(scheduler.runOnce()).resolves.toMatchObject({
      skipped: false,
      municipalities: 2,
      scanned: 7,
      candidates: 3,
      created: 5,
      failed: 0
    });
    expect(escalate).toHaveBeenNthCalledWith(1, db, 7);
    expect(escalate).toHaveBeenNthCalledWith(2, db, 8);
    expect(recordRun).toHaveBeenCalledTimes(2);
    expect(recordRun).toHaveBeenCalledWith(db, expect.objectContaining({ municipalityId: 7, status: 'SUCCESS', scanned: 3 }));
  });

  test('journalise un échec municipal et poursuit les autres municipalités', async () => {
    const db = {
      municipality: { findMany: jest.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]) }
    };
    const escalate = jest.fn()
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce({ scanned: 2, candidates: 1, created: 1 });
    const recordRun = jest.fn().mockResolvedValue({ id: 1 });
    const scheduler = createCitizenRequestEscalationScheduler({
      db,
      escalate,
      recordRun,
      log: { info: jest.fn(), error: jest.fn() },
      runImmediately: false
    });

    await expect(scheduler.runOnce()).resolves.toMatchObject({ municipalities: 2, failed: 1, scanned: 2, created: 1 });
    expect(escalate).toHaveBeenCalledTimes(2);
    expect(recordRun).toHaveBeenNthCalledWith(1, db, expect.objectContaining({ municipalityId: 7, status: 'FAILED', errorMessage: 'database unavailable' }));
  });

  test('ignore une deuxième exécution pendant qu’une exécution est active', async () => {
    let release;
    const pending = new Promise((resolve) => { release = resolve; });
    const db = {
      municipality: { findMany: jest.fn().mockResolvedValue([{ id: 7 }]) }
    };
    const escalate = jest.fn().mockReturnValue(pending);
    const scheduler = createCitizenRequestEscalationScheduler({
      db,
      escalate,
      recordRun: jest.fn().mockResolvedValue({ id: 1 }),
      log: { info: jest.fn(), error: jest.fn() },
      runImmediately: false
    });

    const first = scheduler.runOnce();
    await Promise.resolve();
    await expect(scheduler.runOnce()).resolves.toEqual({ skipped: true, reason: 'already-running' });
    release({ scanned: 1, candidates: 0, created: 0 });
    await first;
    expect(escalate).toHaveBeenCalledTimes(1);
  });

  test('arrête proprement la minuterie', () => {
    jest.useFakeTimers();
    const scheduler = createCitizenRequestEscalationScheduler({
      db: { municipality: { findMany: jest.fn().mockResolvedValue([]) } },
      escalate: jest.fn(),
      recordRun: jest.fn(),
      log: { info: jest.fn(), error: jest.fn() },
      runImmediately: false,
      intervalMs: 1000
    });

    scheduler.start();
    expect(scheduler.isStarted()).toBe(true);
    scheduler.stop();
    expect(scheduler.isStarted()).toBe(false);
    jest.useRealTimers();
  });
});
