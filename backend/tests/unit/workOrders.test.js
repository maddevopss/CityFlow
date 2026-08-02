const {
  createWorkOrder,
  getWorkOrder,
  listWorkOrders,
  transitionWorkOrder,
} = require('../../src/services/workOrders');
const { assignWorkOrder } = require('../../src/services/publicWorksAssignments');
const { addMaterial, getExecutionSummary } = require('../../src/services/workOrderFieldExecution');

const ACTOR_ID = '11111111-1111-4111-8111-111111111111';
const WORK_ORDER_ID = '33333333-3333-4333-8333-333333333333';

test('crée un ordre de travail isolé par municipalité', async () => {
  const createdOrder = { id: 'order-1', municipalityId: 7, status: 'DRAFT', priority: 'NORMAL' };
  const db = {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $queryRawUnsafe: jest.fn().mockResolvedValueOnce([createdOrder]),
  };

  const result = await createWorkOrder(db, {
    municipalityId: 7,
    title: 'Réparer',
    description: 'Réparer le trottoir',
    priority: 'INCONNUE',
    actorId: ACTOR_ID,
  });

  expect(result).toMatchObject({ municipalityId: 7, status: 'DRAFT', priority: 'NORMAL' });
  expect(db.$executeRawUnsafe).toHaveBeenCalledTimes(2);
  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(1);
});

test('conserve les valeurs explicites lors de la création', async () => {
  const createdOrder = { id: 'order-2', municipalityId: 7, number: 'WO-MANUEL', priority: 'URGENT' };
  const db = {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $queryRawUnsafe: jest.fn().mockResolvedValueOnce([createdOrder]),
  };

  const result = await createWorkOrder(db, {
    municipalityId: 7,
    number: 'WO-MANUEL',
    title: 'Sécuriser',
    description: 'Sécuriser la chaussée',
    category: 'ROAD',
    priority: 'URGENT',
    location: { latitude: 45.5, longitude: -73.5 },
    citizenRequestId: WORK_ORDER_ID,
    roadEventId: WORK_ORDER_ID,
    permitId: WORK_ORDER_ID,
    plannedStartAt: '2026-08-03T08:00:00.000Z',
    plannedEndAt: '2026-08-03T12:00:00.000Z',
    actorId: ACTOR_ID,
  });

  expect(result).toEqual(createdOrder);
  const insertArgs = db.$executeRawUnsafe.mock.calls[0];
  expect(insertArgs).toContain('WO-MANUEL');
  expect(insertArgs).toContain('ROAD');
  expect(insertArgs).toContain('URGENT');
});

test('liste avec filtres et limite plafonnée', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: WORK_ORDER_ID }]) };

  const rows = await listWorkOrders(db, {
    municipalityId: 7,
    status: 'ASSIGNED',
    assignedTeamId: WORK_ORDER_ID,
    q: 'trottoir',
    limit: 500,
  });

  expect(rows).toHaveLength(1);
  expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.any(String),
    7,
    'ASSIGNED',
    WORK_ORDER_ID,
    'trottoir',
    100
  );
});

test('liste avec les valeurs par défaut', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };

  await expect(listWorkOrders(db, { municipalityId: 7 })).resolves.toEqual([]);
  expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.any(String),
    7,
    null,
    null,
    null,
    50
  );
});

test('retourne null quand un ordre est absent', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };
  await expect(getWorkOrder(db, { municipalityId: 7, id: WORK_ORDER_ID })).resolves.toBeNull();
});

test('refuse une transition inconnue', async () => {
  await expect(transitionWorkOrder({}, {
    municipalityId: 7,
    id: 'x',
    actorId: 'y',
    toStatus: 'LOST',
  })).rejects.toMatchObject({ statusCode: 400 });
});

test('refuse la transition d un ordre absent de la municipalité', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValueOnce([]) };

  await expect(transitionWorkOrder(db, {
    municipalityId: 7,
    id: WORK_ORDER_ID,
    actorId: ACTOR_ID,
    toStatus: 'PLANNED',
  })).rejects.toMatchObject({ statusCode: 404 });
});

test.each([
  ['IN_PROGRESS', 'startedAt'],
  ['COMPLETED', 'completedAt'],
  ['CLOSED', 'closedAt'],
  ['BLOCKED', 'resolution'],
])('applique la transition %s', async (toStatus, expectedSqlFragment) => {
  const current = { id: WORK_ORDER_ID, municipalityId: 7, status: 'ASSIGNED' };
  const updated = { ...current, status: toStatus };
  const db = {
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce([current])
      .mockResolvedValueOnce([updated]),
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
  };

  const result = await transitionWorkOrder(db, {
    municipalityId: 7,
    id: WORK_ORDER_ID,
    actorId: ACTOR_ID,
    toStatus,
    resolution: toStatus === 'BLOCKED' ? 'Matériel manquant' : undefined,
  });

  expect(result.status).toBe(toStatus);
  expect(db.$executeRawUnsafe.mock.calls[0][0]).toContain(expectedSqlFragment);
  expect(db.$executeRawUnsafe).toHaveBeenCalledTimes(2);
});

test('refuse une équipe hors municipalité', async () => {
  const db = {
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce([{ id: 'order', status: 'DRAFT' }])
      .mockResolvedValueOnce([]),
  };

  await expect(assignWorkOrder(db, {
    municipalityId: 7,
    workOrderId: WORK_ORDER_ID,
    teamId: '44444444-4444-4444-8444-444444444444',
    actorId: ACTOR_ID,
  })).rejects.toMatchObject({ statusCode: 409 });
});

test('calcule le coût matériel', async () => {
  const db = {
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce([{ id: 'order', status: 'IN_PROGRESS' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ quantity: 2, unitCost: 12.5 }])
      .mockResolvedValueOnce([]),
  };

  const result = await getExecutionSummary(db, {
    municipalityId: 7,
    workOrderId: WORK_ORDER_ID,
  });

  expect(result.materialCost).toBe(25);
});

test('enregistre un matériau après validation de l ordre', async () => {
  const db = {
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: 'order', status: 'IN_PROGRESS' }]),
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
  };

  await expect(addMaterial(db, {
    municipalityId: 7,
    workOrderId: WORK_ORDER_ID,
    itemCode: 'ASPH',
    description: 'Asphalte',
    quantity: 1,
    unit: 't',
    unitCost: 100,
    actorId: ACTOR_ID,
  })).resolves.toMatchObject({ itemCode: 'ASPH' });
});