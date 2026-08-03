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

const token = jwt.sign({
  sub: '22222222-2222-4222-8222-222222222222',
  municipalityId: 7,
  role: 'MUNICIPAL_AGENT'
}, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
  prisma.user.findUnique.mockResolvedValue({
    id: '22222222-2222-4222-8222-222222222222',
    role: 'MUNICIPAL_AGENT',
    municipalityId: 7,
    isActive: true
  });
});

test('retourne et filtre les niveaux de service de la municipalité', async () => {
  prisma.citizenRequest.findMany.mockResolvedValue([
    {
      id: '33333333-3333-4333-8333-333333333333',
      title: 'Conduite brisée',
      category: 'WATER',
      status: 'IN_PROGRESS',
      assignedTeam: 'Aqueduc',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      title: 'Banc réparé',
      category: 'PARKS',
      status: 'RESOLVED',
      assignedTeam: 'Parcs',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ]);

  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests/service-levels?level=BREACHED&limit=25')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.summary).toMatchObject({ BREACHED: 1, COMPLETED: 1 });
  expect(response.body.items).toHaveLength(1);
  expect(response.body.items[0].serviceLevel.level).toBe('BREACHED');
  expect(prisma.citizenRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { municipalityId: 7 },
    take: 25
  }));
});

test('refuse un niveau de service inconnu', async () => {
  const response = await request(app)
    .get('/api/v1/municipal/citizen-requests/service-levels?level=LOST')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(400);
  expect(prisma.citizenRequest.findMany).not.toHaveBeenCalled();
});
