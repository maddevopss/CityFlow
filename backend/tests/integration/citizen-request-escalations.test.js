const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => {
  const prisma = {
    $queryRawUnsafe: jest.fn(),
    citizenRequest: { findMany: jest.fn() },
    user: { findMany: jest.fn(), findUnique: jest.fn() },
    notification: { findMany: jest.fn(), createMany: jest.fn() }
  };
  prisma.$transaction = jest.fn((task) => task(prisma));
  return prisma;
});

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
  prisma.user.findUnique.mockImplementation(({ where }) => Promise.resolve({
    id: where.id,
    role: where.id === '22222222-2222-4222-8222-222222222222' ? 'MANAGER' : 'AGENT',
    municipalityId: 7,
    isActive: true
  }));
  prisma.$transaction.mockImplementation((task) => task(prisma));
  prisma.$queryRawUnsafe.mockResolvedValue([{ acquired: true }]);
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
  expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.stringContaining('pg_try_advisory_xact_lock'),
    expect.any(Number),
    7
  );
  expect(prisma.citizenRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ municipalityId: 7 })
  }));
});

test('refuse un second cycle déjà en cours dans la municipalité', async () => {
  prisma.$queryRawUnsafe.mockResolvedValue([{ acquired: false }]);

  const response = await request(app)
    .post('/api/v1/municipal/citizen-requests/escalations/run')
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(409);
  expect(response.body).toEqual(expect.objectContaining({
    code: 'CITIZEN_ESCALATION_ALREADY_RUNNING'
  }));
  expect(prisma.citizenRequest.findMany).not.toHaveBeenCalled();
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
