const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  inspection: { findMany: jest.fn() }
}));
const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const agentToken = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 }, secret);
const inspectorToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'INSPECTOR', municipalityId: 7 }, secret);

describe('Inspection trends API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ isActive: true });
  });

  it('retourne les tendances mensuelles isolées par municipalité', async () => {
    const now = new Date();
    prisma.inspection.findMany.mockResolvedValue([{ scheduledAt: now, completedAt: now, status: 'COMPLETED', outcome: 'COMPLIANT' }]);
    const res = await request(app).get('/api/v1/inspection-trends?months=3').set('Authorization', `Bearer ${agentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.trends).toHaveLength(3);
    expect(prisma.inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ municipalityId: 7 }) }));
  });

  it('limite un inspecteur à ses propres données', async () => {
    prisma.inspection.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/inspection-trends').set('Authorization', `Bearer ${inspectorToken}`);
    expect(res.status).toBe(200);
    expect(prisma.inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ assignedTo: '22222222-2222-4222-8222-222222222222' }) }));
  });

  it('refuse une période invalide', async () => {
    const res = await request(app).get('/api/v1/inspection-trends?months=24').set('Authorization', `Bearer ${agentToken}`);
    expect(res.status).toBe(400);
    expect(prisma.inspection.findMany).not.toHaveBeenCalled();
  });
});
