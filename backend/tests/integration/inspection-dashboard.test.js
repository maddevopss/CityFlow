const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  inspection: { groupBy: jest.fn(), count: jest.fn() },
  inspectionReminder: { count: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const agentToken = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 }, secret);
const inspectorId = '22222222-2222-4222-8222-222222222222';
const inspectorToken = jwt.sign({ sub: inspectorId, role: 'INSPECTOR', municipalityId: 7 }, secret);

describe('Inspection dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === inspectorId ? 'INSPECTOR' : 'MUNICIPAL_AGENT',
      municipalityId: 7,
      isActive: true
    }));
    prisma.inspection.groupBy
      .mockResolvedValueOnce([
        { status: 'SCHEDULED', _count: { _all: 6 } },
        { status: 'COMPLETED', _count: { _all: 4 } }
      ])
      .mockResolvedValueOnce([{ outcome: 'COMPLIANT', _count: { _all: 3 } }]);
    prisma.inspection.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(3);
    prisma.inspectionReminder.count.mockResolvedValue(2);
  });

  it('retourne les indicateurs municipaux', async () => {
    const res = await request(app).get('/api/v1/inspection-dashboard').set('Authorization', `Bearer ${agentToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 10, scheduled: 6, completed: 4, upcoming: 2, overdue: 1, unassigned: 3, completionRate: 40 });
  });

  it('limite les agrégats aux inspections de l’inspecteur', async () => {
    const res = await request(app).get('/api/v1/inspection-dashboard').set('Authorization', `Bearer ${inspectorToken}`);
    expect(res.status).toBe(200);
    expect(prisma.inspection.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { municipalityId: 7, assignedTo: inspectorId } }));
    expect(res.body.unassigned).toBe(0);
  });

  it('refuse les requêtes non authentifiées', async () => {
    const res = await request(app).get('/api/v1/inspection-dashboard');
    expect(res.status).toBe(401);
  });
});
