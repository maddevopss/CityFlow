const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  inspection: { findFirst: jest.fn() },
  inspectionEvidence: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

describe('Inspection evidence API', () => {
  const inspectionId = '33333333-3333-4333-8333-333333333333';
  const secret = process.env.JWT_SECRET || 'test-secret';
  const agentToken = jwt.sign(
    { sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 },
    secret,
    { expiresIn: '1h' }
  );
  const inspectorToken = jwt.sign(
    { sub: '44444444-4444-4444-8444-444444444444', role: 'INSPECTOR', municipalityId: 7 },
    secret,
    { expiresIn: '1h' }
  );
  const payload = {
    evidenceType: 'PHOTO',
    fileName: 'facade.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 2048,
    storageKey: 'municipalities/7/inspections/333/facade.jpg',
    sha256: 'a'.repeat(64),
    description: 'Façade après travaux',
    capturedAt: '2026-08-01T12:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === '44444444-4444-4444-8444-444444444444' ? 'INSPECTOR' : 'MUNICIPAL_AGENT',
      municipalityId: 7,
      isActive: true
    }));
  });

  it('enregistre une preuve dans la municipalité du jeton', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId });
    prisma.inspectionEvidence.findFirst.mockResolvedValue(null);
    prisma.inspectionEvidence.create.mockResolvedValue({ id: 'evidence-1', ...payload });

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/evidence`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(prisma.inspectionEvidence.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        municipalityId: 7,
        inspectionId,
        uploadedBy: '11111111-1111-4111-8111-111111111111',
        sha256: payload.sha256
      })
    });
  });

  it('refuse une empreinte SHA-256 invalide', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/evidence`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ ...payload, sha256: 'invalide' });

    expect(res.status).toBe(400);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
  });

  it('refuse une preuve dupliquée pour la même inspection', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId });
    prisma.inspectionEvidence.findFirst.mockResolvedValue({ id: 'existing' });

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/evidence`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send(payload);

    expect(res.status).toBe(409);
    expect(prisma.inspectionEvidence.create).not.toHaveBeenCalled();
  });

  it('limite un inspecteur à une inspection qui lui est affectée', async () => {
    prisma.inspection.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/inspections/${inspectionId}/evidence`)
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(404);
    expect(prisma.inspection.findFirst).toHaveBeenCalledWith({
      where: { id: inspectionId, municipalityId: 7, assignedTo: '44444444-4444-4444-8444-444444444444' },
      select: { id: true }
    });
  });

  it('liste les preuves dans un ordre déterministe', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId });
    prisma.inspectionEvidence.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get(`/api/v1/inspections/${inspectionId}/evidence`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(prisma.inspectionEvidence.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7, inspectionId },
      orderBy: [{ capturedAt: 'asc' }, { createdAt: 'asc' }]
    });
  });
});
