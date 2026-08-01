const {
  LOCK_NAMESPACE,
  CitizenEscalationAlreadyRunningError,
  executeCitizenEscalationWithLock
} = require('../../src/services/citizenEscalationExecutionLock');

describe('citizenEscalationExecutionLock', () => {
  test('exécute la tâche dans la transaction lorsque le verrou est acquis', async () => {
    const tx = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ acquired: true }]) };
    const db = { $transaction: jest.fn((task) => task(tx)) };
    const task = jest.fn().mockResolvedValue({ created: 2 });

    await expect(executeCitizenEscalationWithLock(db, 7, task)).resolves.toEqual({ created: 2 });
    expect(tx.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('pg_try_advisory_xact_lock'),
      LOCK_NAMESPACE,
      7
    );
    expect(task).toHaveBeenCalledWith(tx);
  });

  test('refuse la tâche lorsque le verrou est déjà détenu', async () => {
    const tx = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ acquired: false }]) };
    const db = { $transaction: jest.fn((task) => task(tx)) };
    const task = jest.fn();

    await expect(executeCitizenEscalationWithLock(db, 7, task))
      .rejects.toBeInstanceOf(CitizenEscalationAlreadyRunningError);
    expect(task).not.toHaveBeenCalled();
  });
});
