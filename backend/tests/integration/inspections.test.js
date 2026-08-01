const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  inspection: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

describe('Inspections API', () => {
  const inspectionId = '33333333-3333-4333-8333-333333333333';
  let agentToken;
  let viewerToken;

  beforeAll(() => {
    const secret = process.env.JWT_SECRET || 'test-secret';
    agentToken = jwt.sign(
      { sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 },
      secret,
      { expiresIn: '1h' }
    );
    viewerToken = jwt.sign(
      { sub: '22222222-2222-4222-8222-222222222222', role: 'VIEWER', municipalityId: 7 },
      secret,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuse une requête sans authentification', async () => {
    const res = await request(app).get('/api/v1/inspections');
    expect(res.status).toBe(401);
  });

  it('refuse les rôles non autorisés', async () => {
    const res = await request(app)
      .get('/api/v1/inspections')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(prisma.inspection.findMany).not.toHaveBeenCalled();
  });

  it('liste uniquement les inspections de la municipalité du jeton', async () => {
    prisma.inspection.findMany.mockResolvedValue([{ id: inspectionId, municipalityId: 7 }]);

    const res = await request(app)
      .get('/api/v1/inspections?status=SCHEDULED')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(prisma.inspection.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7, status: 'SCHEDULED' },
      orderBy: { scheduledAt: 'asc' }
    });
  });

  it('refuse un statut de filtre inconnu', async () => {
    const res = await request(app)
      .get('/api/v1/inspections?status=DELETED')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(400);
  });

  it('crée une inspection avec la municipalité et l’auteur du jeton', async () => {
    prisma.inspection.create.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED' });

    const res = await request(app)
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        scheduledAt: '2026-08-10T14:00:00.000Z',
        address: '100 rue Principale',
        inspectionType: 'FINAL',
        notes: 'Vérification finale'
      });

    expect(res.status).toBe(201);
    expect(prisma.inspection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        municipalityId: 7,
        createdBy: '11111111-1111-4111-8111-111111111111',
        status: 'SCHEDULED',
        inspectionType: 'FINAL'
      })
    });
  });

  it('refuse les données de création invalides', async () => {
    const res = await request(app)
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ scheduledAt: 'pas-une-date', address: 'x', inspectionType: 'AUTRE' });

    expect(res.status).toBe(400);
    expect(prisma.inspection.create).not.toHaveBeenCalled();
  });

  it('ne retourne pas une inspection d’une autre municipalité', async () => {
    prisma.inspection.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/inspections/${inspectionId}`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(404);
    expect(prisma.inspection.findFirst).toHaveBeenCalledWith({
      where: { id: inspectionId, municipalityId: 7 }
    });
  });

  it('termine une inspection planifiée avec acteur et constat', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED' });
    prisma.inspection.update.mockResolvedValue({ id: inspectionId, status: 'COMPLETED' });

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/complete`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ outcome: 'COMPLIANT', findings: 'Travaux conformes au permis.' });

    expect(res.status).toBe(200);
    expect(prisma.inspection.update).toHaveBeenCalledWith({
      where: { id: inspectionId },
      data: expect.objectContaining({
        status: 'COMPLETED',
        outcome: 'COMPLIANT',
        completedBy: '11111111-1111-4111-8111-111111111111'
      })
    });
  });

  it('refuse de terminer une inspection déjà fermée', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, status: 'COMPLETED' });

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/complete`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ outcome: 'COMPLIANT', findings: 'Déjà traitée.' });

    expect(res.status).toBe(409);
    expect(prisma.inspection.update).not.toHaveBeenCalled();
  });
});
