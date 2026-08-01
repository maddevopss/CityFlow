const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({ inspection: { findFirst: jest.fn(), update: jest.fn() } }));
const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'INSPECTOR', municipalityId: 7 }, secret, { expiresIn: '1h' });
const inspectionId = '33333333-3333-4333-8333-333333333333';
const updatedAt = new Date('2026-08-01T12:00:00.000Z');
const operation = {
  idempotencyKey: 'offline-operation-001',
  inspectionId,
  action: 'COMPLETE',
  baseUpdatedAt: updatedAt.toISOString(),
  payload: { outcome: 'COMPLIANT', findings: 'Travaux conformes', completedAt: '2026-08-01T13:00:00.000Z' }
};

describe('Inspection sync API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('applique une opération hors ligne sans conflit', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED', updatedAt });
    prisma.inspection.update.mockResolvedValue({ id: inspectionId, updatedAt: new Date('2026-08-01T13:01:00.000Z') });
    const res = await request(app).post('/api/v1/inspection-sync/batch').set('Authorization', `Bearer ${token}`).send({ operations: [operation] });
    expect(res.status).toBe(200);
    expect(res.body.results[0].status).toBe('APPLIED');
  });

  it('signale un conflit de version', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED', updatedAt: new Date('2026-08-01T12:30:00.000Z') });
    const res = await request(app).post('/api/v1/inspection-sync/batch').set('Authorization', `Bearer ${token}`).send({ operations: [operation] });
    expect(res.body.results[0].status).toBe('CONFLICT');
    expect(prisma.inspection.update).not.toHaveBeenCalled();
  });

  it('rejette un lot invalide', async () => {
    const res = await request(app).post('/api/v1/inspection-sync/batch').set('Authorization', `Bearer ${token}`).send({ operations: [] });
    expect(res.status).toBe(400);
  });
});
