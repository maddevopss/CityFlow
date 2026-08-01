const {
  recordCitizenEscalationRun,
  listCitizenEscalationRuns
} = require('../../src/services/citizenEscalationRunHistory');

describe('citizenEscalationRunHistory', () => {
  test('enregistre un cycle réussi avec des paramètres séparés', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: 42n }]) };
    const startedAt = new Date('2026-08-01T12:00:00Z');
    const completedAt = new Date('2026-08-01T12:00:02Z');

    await expect(recordCitizenEscalationRun(db, {
      municipalityId: 7,
      source: 'SCHEDULED',
      status: 'SUCCESS',
      scanned: 10,
      candidates: 2,
      created: 4,
      startedAt,
      completedAt
    })).resolves.toEqual({ id: 42n });

    expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "citizen_escalation_runs"'),
      7,
      'SCHEDULED',
      'SUCCESS',
      10,
      2,
      4,
      2000,
      null,
      startedAt,
      completedAt
    );
  });

  test('limite l’historique à la municipalité demandée', async () => {
    const rows = [{ id: 1n, status: 'SUCCESS' }];
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue(rows) };

    await expect(listCitizenEscalationRuns(db, 7, 10)).resolves.toEqual(rows);
    expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('WHERE "municipality_id" = $1'),
      7,
      10
    );
  });
});
