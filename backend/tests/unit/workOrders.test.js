const { createWorkOrder, transitionWorkOrder } = require('../../src/services/workOrders');
const { assignWorkOrder } = require('../../src/services/publicWorksAssignments');
const { addMaterial, getExecutionSummary } = require('../../src/services/workOrderFieldExecution');

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
    actorId: '11111111-1111-4111-8111-111111111111',
  });

  expect(result).toMatchObject({ municipalityId: 7, status: 'DRAFT', priority: 'NORMAL' });
  expect(db.$executeRawUnsafe).toHaveBeenCalledTimes(2);
  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(1);
});

test('refuse une transition inconnue', async () => {
  await expect(transitionWorkOrder({}, { municipalityId: 7, id: 'x', actorId: 'y', toStatus: 'LOST' })).rejects.toMatchObject({ statusCode: 400 });
});

test('refuse la transition d un ordre absent de la municipalité', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValueOnce([]) };

  await expect(transitionWorkOrder(db, {
    municipalityId: 7,
    id: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    toStatus: 'PLANNED',
  })).rejects.toMatchObject({ statusCode: 404 });
});

test('refuse une équipe hors municipalité', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValueOnce([{ id: 'order', status: 'DRAFT' }]).mockResolvedValueOnce([]) };
  await expect(assignWorkOrder(db, { municipalityId: 7, workOrderId: '33333333-3333-4333-8333-333333333333', teamId: '44444444-4444-4444-8444-444444444444', actorId: '11111111-1111-4111-8111-111111111111' })).rejects.toMatchObject({ statusCode: 409 });
});

test('calcule le coût matériel', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValueOnce([{ id: 'order', status: 'IN_PROGRESS' }]).mockResolvedValueOnce([]).mockResolvedValueOnce([{ quantity: 2, unitCost: 12.5 }]).mockResolvedValueOnce([]) };
  const result = await getExecutionSummary(db, { municipalityId: 7, workOrderId: '33333333-3333-4333-8333-333333333333' });
  expect(result.materialCost).toBe(25);
});

test('enregistre un matériau après validation de l ordre', async () => {
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: 'order', status: 'IN_PROGRESS' }]), $executeRawUnsafe: jest.fn().mockResolvedValue(1) };
  await expect(addMaterial(db, { municipalityId: 7, workOrderId: '33333333-3333-4333-8333-333333333333', itemCode: 'ASPH', description: 'Asphalte', quantity: 1, unit: 't', unitCost: 100, actorId: '11111111-1111-4111-8111-111111111111' })).resolves.toMatchObject({ itemCode: 'ASPH' });
});