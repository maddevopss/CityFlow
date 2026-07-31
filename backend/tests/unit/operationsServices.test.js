const {
  DELIVERY_SLA,
  getDeliveryServiceLevels,
  createDeliverySlaAlerts
} = require('../../src/services/deliveryServiceLevels');
const {
  getAlertSummary,
  listOperationalAlerts,
  acknowledgeOperationalAlert
} = require('../../src/services/operationalAlerts');
const {
  MAX_ATTEMPTS,
  appendOutboxEvent,
  claimOutboxBatch,
  markOutboxProcessed,
  markOutboxFailed,
  getOutboxSummary,
  listDeadOutboxEvents,
  retryDeadOutboxEvent
} = require('../../src/services/outbox');

jest.mock('uuid', () => ({
  v4: jest.fn()
    .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
    .mockReturnValueOnce('22222222-2222-4222-8222-222222222222')
    .mockReturnValue('33333333-3333-4333-8333-333333333333')
}));

function createDb({ queryRows = [], executeResult = 1 } = {}) {
  return {
    $queryRaw: jest.fn().mockResolvedValue(queryRows),
    $executeRaw: jest.fn().mockResolvedValue(executeResult)
  };
}

describe('delivery service levels', () => {
  test.each([
    [{ deadCount: 1, criticalCount: 0, stuckCount: 0, warningCount: 0 }, 'CRITICAL'],
    [{ deadCount: 0, criticalCount: 1, stuckCount: 0, warningCount: 0 }, 'CRITICAL'],
    [{ deadCount: 0, criticalCount: 0, stuckCount: 1, warningCount: 0 }, 'CRITICAL'],
    [{ deadCount: 0, criticalCount: 0, stuckCount: 0, warningCount: 2 }, 'WARNING'],
    [{ deadCount: 0, criticalCount: 0, stuckCount: 0, warningCount: 0 }, 'HEALTHY']
  ])('calcule la santé %#', async (metrics, expectedHealth) => {
    const db = createDb({ queryRows: [metrics] });
    await expect(getDeliveryServiceLevels({ municipalityId: 7, db })).resolves.toEqual({
      windowHours: 24,
      thresholds: DELIVERY_SLA,
      health: expectedHealth,
      metrics
    });
  });

  test('utilise un objet vide quand aucune ligne n’est retournée', async () => {
    const db = createDb({ queryRows: [] });
    await expect(getDeliveryServiceLevels({ municipalityId: 7, db })).resolves.toMatchObject({
      health: 'HEALTHY',
      metrics: {}
    });
  });

  test('crée les alertes de dépassement', async () => {
    const db = createDb({ executeResult: 3 });
    await expect(createDeliverySlaAlerts({ municipalityId: 7, db })).resolves.toBe(3);
    await createDeliverySlaAlerts({ db });
    expect(db.$executeRaw).toHaveBeenCalledTimes(2);
  });
});

describe('operational alerts', () => {
  test('retourne le résumé et la liste', async () => {
    const rows = [{ id: 'alert-1' }];
    const db = createDb({ queryRows: rows });
    await expect(getAlertSummary({ municipalityId: 7, db })).resolves.toBe(rows);
    await expect(listOperationalAlerts({ municipalityId: 7, status: 'ACKNOWLEDGED', limit: 10, db })).resolves.toBe(rows);
    await listOperationalAlerts({ municipalityId: 7, db });
  });

  test('retourne une alerte acquittée ou null', async () => {
    const alert = { id: 'alert-1', status: 'ACKNOWLEDGED' };
    const dbFound = createDb({ queryRows: [alert] });
    const args = {
      id: '44444444-4444-4444-8444-444444444444',
      municipalityId: 7,
      actorId: '55555555-5555-4555-8555-555555555555'
    };
    await expect(acknowledgeOperationalAlert({ ...args, db: dbFound })).resolves.toBe(alert);
    await expect(acknowledgeOperationalAlert({ ...args, db: createDb({ queryRows: [] }) })).resolves.toBeNull();
  });
});

describe('outbox service', () => {
  test('expose la limite de tentatives', () => {
    expect(MAX_ATTEMPTS).toBe(8);
  });

  test('ajoute et réclame des événements', async () => {
    const db = createDb({ queryRows: [{ id: 'outbox-1' }] });
    await expect(appendOutboxEvent({
      aggregateId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      municipalityId: 7,
      eventType: 'EVENT_PUBLISHED',
      payload: { id: 1 },
      dedupeKey: 'event-1',
      db
    })).resolves.toBe('11111111-1111-4111-8111-111111111111');
    await expect(claimOutboxBatch({ limit: 5, db })).resolves.toEqual([{ id: 'outbox-1' }]);
    await claimOutboxBatch({ db });
  });

  test('marque un événement traité ou échoué', async () => {
    const db = createDb();
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    await markOutboxProcessed(id, db);
    await markOutboxFailed(id, new Error('diffusion impossible'), db);
    await markOutboxFailed(id, 'échec brut', db);
    await markOutboxFailed(id, new Error('x'.repeat(5000)), db);
    expect(db.$executeRaw).toHaveBeenCalledTimes(4);
  });

  test('transforme le résumé par statut', async () => {
    const rows = [
      { status: 'PENDING', count: 2, oldestCreatedAt: '2026-07-31T00:00:00Z' },
      { status: 'DEAD', count: 1, oldestCreatedAt: '2026-07-30T00:00:00Z' }
    ];
    await expect(getOutboxSummary({ municipalityId: 7, db: createDb({ queryRows: rows }) })).resolves.toEqual({
      PENDING: { count: 2, oldestCreatedAt: '2026-07-31T00:00:00Z' },
      DEAD: { count: 1, oldestCreatedAt: '2026-07-30T00:00:00Z' }
    });
    await expect(getOutboxSummary({ municipalityId: 7, db: createDb({ queryRows: [] }) })).resolves.toEqual({});
  });

  test('liste et retente les événements morts', async () => {
    const rows = [{ id: 'outbox-dead-1' }];
    const db = createDb({ queryRows: rows });
    await expect(listDeadOutboxEvents({ municipalityId: 7, limit: 5, db })).resolves.toBe(rows);
    await listDeadOutboxEvents({ municipalityId: 7, db });

    const args = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      municipalityId: 7,
      actorId: '55555555-5555-4555-8555-555555555555'
    };
    await expect(retryDeadOutboxEvent({ ...args, db: createDb({ queryRows: rows }) })).resolves.toBe(rows[0]);
    await expect(retryDeadOutboxEvent({ ...args, db: createDb({ queryRows: [] }) })).resolves.toBeNull();
  });
});
