const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({ inspection: { findFirst: jest.fn() } }));
const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'INSPECTOR', municipalityId: 7 }, secret, { expiresIn: '1h' });
const inspectionId = '33333333-3333-4333-8333-333333333333';

describe('Inspection reports API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('génère un rapport déterministe pour une inspection terminée', async () => {
    prisma.inspection.findFirst.mockResolvedValue({
      id: inspectionId,
      address: '10 rue Principale',
      inspectionType: 'FINAL',
      status: 'COMPLETED',
      outcome: 'COMPLIANT',
      findings: 'Conforme',
      completedAt: new Date('2026-08-01T13:00:00.000Z'),
      evidence: [{ id: '55555555-5555-4555-8555-555555555555', sha256: 'a'.repeat(64), fileName: 'photo.jpg' }]
    });
    const res = await request(app).get(`/api/v1/inspection-reports/${inspectionId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(res.body.signature.status).toBe('UNSIGNED');
  });

  it('refuse un rapport avant la clôture', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED', evidence: [] });
    const res = await request(app).get(`/api/v1/inspection-reports/${inspectionId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(409);
  });
});
