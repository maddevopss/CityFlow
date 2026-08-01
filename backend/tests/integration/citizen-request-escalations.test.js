const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  $queryRawUnsafe: jest.fn(),
  citizenRequest: { findMany: jest.fn() },
  user: { findMany: jest.fn() },
  notification: { findMany: jest.fn(), createMany: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const config = require('../../src/config');

const managerToken = jwt.sign({
  sub: '22222222-2222-4222-8222-222222222222',
  municipalityId: 7,
  role: 'MANAGER'
}, config.jwtSecret);
const agentToken = jwt.sign({
  sub: '33333333-3333-4333-8333-333333333333',
  municipalityId: 7,
  role: 'AGENT'
}, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
});

test('refuse l’exécution à un agent non gestionnaire', async () => {
  const response = await request(app)
    .post('/api/v1/municipal/citizen-requests/escalations/run')
    .set('Authorization', `Bearer ${agentToken}`);

  expect(response.status).toBe(403);
});

test('exécute les escalades dans la municipalité du gestionnaire', async () => {
  prisma.citizenRequest.findMany.mockResolvedValue([]);

  const response = await request(app)
    .post('/api/v1/municipal/citizen-requests/escalations/run')
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(202);
  expect(response.body).toMatchObject({ scanned: 0, candidates: 0, created: 0 });
  expect(prisma.citizenRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ municipalityId: 7 })
  }));
});

test('retourne uniquement l’historique de la municipalité authentifiée', async () => {
  prisma.$queryRawUnsafe.mockResolvedValue([
    { id: '1', status: 'SUCCESS', scanned: 12, candidates: 2, notificationsCreated: 4 }
  ]);

  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests/escalations/history?limit=10')
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ limit: 10, items: [expect.objectContaining({ status: 'SUCCESS' })] });
  expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.stringContaining('WHERE "municipality_id" = $1'),
    7,
    10
  );
});

test('refuse l’historique à un agent non gestionnaire', async () => {
  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests/escalations/history')
    .set('Authorization', `Bearer ${agentToken}`);

  expect(response.status).toBe(403);
});
