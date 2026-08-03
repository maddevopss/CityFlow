const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: {
    findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === '22222222-2222-4222-8222-222222222222' ? 'MANAGER' : 'CITIZEN',
      municipalityId: 7,
      isActive: true
    }))
  },
  roadEvent: {
    findFirst: jest.fn()
  },
  inspection: {
    findMany: jest.fn()
  }
}));

jest.mock('../../src/services/eventAudit', () => ({
  listEventAudit: jest.fn()
}));

const prisma = require('../../src/db/prisma');
const { listEventAudit } = require('../../src/services/eventAudit');
const app = require('../../src/app');
const config = require('../../src/config');

const permitId = '33333333-3333-4333-8333-333333333333';
const token = jwt.sign({
  sub: '22222222-2222-4222-8222-222222222222',
  municipalityId: 7,
  role: 'MANAGER'
}, config.jwtSecret);
const citizenToken = jwt.sign({
  sub: '11111111-1111-4111-8111-111111111111',
  municipalityId: 7,
  role: 'CITIZEN'
}, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
});

test('retourne le permis, son historique et ses inspections', async () => {
  prisma.roadEvent.findFirst.mockResolvedValue({
    id: permitId,
    municipalityId: 7,
    sourceRef: 'PERMIT-001',
    sourceType: 'PERMIT',
    status: 'APPROVED',
    details: { contractor: 'Entrepreneur exemple' }
  });
  listEventAudit.mockResolvedValue([
    { id: 'audit-1', action: 'CREATED', newStatus: 'DRAFT' },
    { id: 'audit-2', action: 'APPROVED', previousStatus: 'SUBMITTED', newStatus: 'APPROVED' }
  ]);
  prisma.inspection.findMany.mockResolvedValue([
    { id: '44444444-4444-4444-8444-444444444444', status: 'SCHEDULED' }
  ]);

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}`)
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.permit).toMatchObject({ id: permitId, sourceRef: 'PERMIT-001', status: 'APPROVED' });
  expect(response.body.history).toHaveLength(2);
  expect(response.body.inspections).toHaveLength(1);
  expect(prisma.roadEvent.findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: permitId, municipalityId: 7, sourceType: 'PERMIT' }
  }));
  expect(listEventAudit).toHaveBeenCalledWith({ eventId: permitId, municipalityId: 7, db: prisma });
  expect(prisma.inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { municipalityId: 7, permitId }
  }));
});

test('masque un permis absent ou appartenant à une autre municipalité', async () => {
  prisma.roadEvent.findFirst.mockResolvedValue(null);

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}`)
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(404);
  expect(listEventAudit).not.toHaveBeenCalled();
  expect(prisma.inspection.findMany).not.toHaveBeenCalled();
});

test('refuse un identifiant invalide', async () => {
  const response = await request(app)
    .get('/api/v1/permits/invalide')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(400);
  expect(prisma.roadEvent.findFirst).not.toHaveBeenCalled();
});

test('refuse le détail à un citoyen', async () => {
  const response = await request(app)
    .get(`/api/v1/permits/${permitId}`)
    .set('Authorization', `Bearer ${citizenToken}`);

  expect(response.status).toBe(403);
  expect(prisma.roadEvent.findFirst).not.toHaveBeenCalled();
});
