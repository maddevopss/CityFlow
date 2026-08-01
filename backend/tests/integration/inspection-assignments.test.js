const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  inspection: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  user: {
    findMany: jest.fn(),
    findFirst: jest.fn()
  }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

describe('Inspection assignments API', () => {
  const inspectionId = '33333333-3333-4333-8333-333333333333';
  const inspectorId = '44444444-4444-4444-8444-444444444444';
  const secret = process.env.JWT_SECRET || 'test-secret';
  const agentToken = jwt.sign(
    { sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 },
    secret,
    { expiresIn: '1h' }
  );
  const inspectorToken = jwt.sign(
    { sub: inspectorId, role: 'INSPECTOR', municipalityId: 7 },
    secret,
    { expiresIn: '1h' }
  );

  beforeEach(() => jest.clearAllMocks());

  it('liste seulement les inspecteurs actifs de la municipalité', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: inspectorId, fullName: 'Alice Inspectrice' }]);

    const res = await request(app)
      .get('/api/v1/inspections/inspectors')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7, role: 'INSPECTOR', isActive: true },
      select: { id: true, fullName: true, email: true },
      orderBy: [{ fullName: 'asc' }, { email: 'asc' }]
    });
  });

  it('affecte une inspection planifiée à un inspecteur valide', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED' });
    prisma.user.findFirst.mockResolvedValue({ id: inspectorId });
    prisma.inspection.update.mockResolvedValue({ id: inspectionId, assignedTo: inspectorId });

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ inspectorId });

    expect(res.status).toBe(200);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: inspectorId, municipalityId: 7, role: 'INSPECTOR', isActive: true },
      select: { id: true }
    });
    expect(prisma.inspection.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: inspectionId },
      data: expect.objectContaining({ assignedTo: inspectorId, assignedBy: '11111111-1111-4111-8111-111111111111' })
    }));
  });

  it('refuse une affectation par un inspecteur', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/assign`)
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ inspectorId });

    expect(res.status).toBe(403);
    expect(prisma.inspection.update).not.toHaveBeenCalled();
  });

  it('refuse un inspecteur externe ou inactif', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED' });
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ inspectorId });

    expect(res.status).toBe(400);
    expect(prisma.inspection.update).not.toHaveBeenCalled();
  });

  it('limite un inspecteur à ses propres inspections', async () => {
    prisma.inspection.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/inspections?status=SCHEDULED')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(200);
    expect(prisma.inspection.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7, status: 'SCHEDULED', assignedTo: inspectorId },
      orderBy: { scheduledAt: 'asc' }
    });
  });
});
