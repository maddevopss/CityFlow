const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(),
  citizenRequest: {
    groupBy: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn()
  },
  citizenRequestEvent: { createMany: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const config = require('../../src/config');

const agentId = '22222222-2222-4222-8222-222222222222';
const requestIdA = '33333333-3333-4333-8333-333333333333';
const requestIdB = '44444444-4444-4444-8444-444444444444';
const token = jwt.sign({ sub: agentId, municipalityId: 7, role: 'AGENT' }, config.jwtSecret);
const citizenToken = jwt.sign({ sub: agentId, municipalityId: 7, role: 'CITIZEN' }, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
  prisma.user.findUnique.mockResolvedValue({ isActive: true });
  prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
});

test('refuse la console à un citoyen', async () => {
  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests/summary')
    .set('Authorization', `Bearer ${citizenToken}`);

  expect(response.status).toBe(403);
});

test('retourne un résumé isolé par municipalité', async () => {
  prisma.citizenRequest.groupBy.mockResolvedValue([
    { status: 'SUBMITTED', _count: { _all: 3 } },
    { status: 'IN_PROGRESS', _count: { _all: 2 } }
  ]);
  prisma.citizenRequest.count
    .mockResolvedValueOnce(2)
    .mockResolvedValueOnce(1);

  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests/summary')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    byStatus: { SUBMITTED: 3, IN_PROGRESS: 2 },
    unassigned: 2,
    overdue: 1
  });
  expect(prisma.citizenRequest.groupBy).toHaveBeenCalledWith(expect.objectContaining({
    where: { municipalityId: 7 }
  }));
});

test('liste les demandes avec filtres et pagination', async () => {
  prisma.citizenRequest.findMany.mockResolvedValue([{ id: requestIdA, status: 'SUBMITTED' }]);
  prisma.citizenRequest.count.mockResolvedValue(1);

  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests?status=SUBMITTED&unassigned=true&q=lampadaire&page=2&pageSize=10')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.pagination).toEqual({ page: 2, pageSize: 10, total: 1, totalPages: 1 });
  expect(prisma.citizenRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ municipalityId: 7, status: 'SUBMITTED', assignedTo: null }),
    skip: 10,
    take: 10
  }));
});

test('affecte en lot et crée un événement pour chaque demande', async () => {
  prisma.citizenRequest.findMany.mockResolvedValue([
    { id: requestIdA, status: 'SUBMITTED' },
    { id: requestIdB, status: 'ACKNOWLEDGED' }
  ]);
  prisma.citizenRequest.updateMany.mockResolvedValue({ count: 2 });
  prisma.citizenRequestEvent.createMany.mockResolvedValue({ count: 2 });

  const response = await request(app)
    .post('/api/v1/municipal/citizen-requests/bulk-assign')
    .set('Authorization', `Bearer ${token}`)
    .send({ requestIds: [requestIdA, requestIdB], team: 'Voirie de soir' });

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ updated: 2, team: 'Voirie de soir' });
  expect(prisma.citizenRequest.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { municipalityId: 7, id: { in: [requestIdA, requestIdB] } },
    data: expect.objectContaining({ assignedTo: agentId, assignedTeam: 'Voirie de soir', status: 'IN_REVIEW' })
  }));
  expect(prisma.citizenRequestEvent.createMany).toHaveBeenCalledWith({
    data: expect.arrayContaining([
      expect.objectContaining({ requestId: requestIdA, eventType: 'REQUEST_ASSIGNED', fromStatus: 'SUBMITTED', toStatus: 'IN_REVIEW' }),
      expect.objectContaining({ requestId: requestIdB, eventType: 'REQUEST_ASSIGNED', fromStatus: 'ACKNOWLEDGED', toStatus: 'IN_REVIEW' })
    ])
  });
});

test('refuse une affectation partielle hors municipalité', async () => {
  prisma.citizenRequest.findMany.mockResolvedValue([{ id: requestIdA, status: 'SUBMITTED' }]);

  const response = await request(app)
    .post('/api/v1/municipal/citizen-requests/bulk-assign')
    .set('Authorization', `Bearer ${token}`)
    .send({ requestIds: [requestIdA, requestIdB], team: 'Voirie' });

  expect(response.status).toBe(404);
  expect(prisma.citizenRequest.updateMany).not.toHaveBeenCalled();
});

test('refuse les demandes déjà fermées', async () => {
  prisma.citizenRequest.findMany.mockResolvedValue([{ id: requestIdA, status: 'CLOSED' }]);

  const response = await request(app)
    .post('/api/v1/municipal/citizen-requests/bulk-assign')
    .set('Authorization', `Bearer ${token}`)
    .send({ requestIds: [requestIdA], team: 'Voirie' });

  expect(response.status).toBe(409);
  expect(response.body.requestIds).toEqual([requestIdA]);
  expect(prisma.citizenRequest.updateMany).not.toHaveBeenCalled();
});
