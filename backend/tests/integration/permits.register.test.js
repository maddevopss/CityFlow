const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: {
    findUnique: jest.fn().mockResolvedValue({ isActive: true })
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({ isActive: true })
  },
  roadEvent: { findMany: jest.fn(), count: jest.fn() },
  municipality: { findUnique: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const config = require('../../src/config');

const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', municipalityId: 7, role: 'MUNICIPAL_AGENT' }, config.jwtSecret);
const citizenToken = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', municipalityId: 7, role: 'CITIZEN' }, config.jwtSecret);

beforeEach(() => jest.clearAllMocks());

test('refuse un rôle non municipal', async () => {
  const response = await request(app).get('/api/v1/permits').set('Authorization', `Bearer ${citizenToken}`);
  expect(response.status).toBe(403);
});

test('liste les permis avec filtres, pagination et isolation municipale', async () => {
  prisma.roadEvent.findMany.mockResolvedValue([{ id: 'event-1', sourceRef: 'PERMIT-001', status: 'DRAFT' }]);
  prisma.roadEvent.count.mockResolvedValue(1);

  const response = await request(app)
    .get('/api/v1/permits?status=DRAFT&q=PERMIT&page=2&pageSize=10')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.pagination).toEqual({ page: 2, pageSize: 10, total: 1, totalPages: 1 });
  expect(prisma.roadEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ municipalityId: 7, sourceType: 'PERMIT', status: 'DRAFT' }),
    skip: 10,
    take: 10
  }));
});

test('refuse un statut inconnu', async () => {
  const response = await request(app).get('/api/v1/permits?status=DELETED').set('Authorization', `Bearer ${token}`);
  expect(response.status).toBe(400);
  expect(prisma.roadEvent.findMany).not.toHaveBeenCalled();
});
