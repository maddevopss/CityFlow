const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(operations => Promise.all(operations)),
  inspection: {
    count: jest.fn(),
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
    prisma.user.findUnique.mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === '22222222-2222-4222-8222-222222222222' ? 'VIEWER' : 'MUNICIPAL_AGENT',
      municipalityId: 7,
      isActive: true
    }));
    prisma.inspection.count.mockResolvedValue(0);
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
    prisma.inspection.count.mockResolvedValue(1);
    prisma.inspection.findMany.mockResolvedValue([{ id: inspectionId, municipalityId: 7 }]);

    const res = await request(app)
      .get('/api/v1/inspections?status=SCHEDULED')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.pagination).toEqual(expect.objectContaining({ page: 1, pageSize: 25, total: 1, totalPages: 1 }));
    expect(prisma.inspection.count).toHaveBeenCalledWith({
      where: { municipalityId: 7, status: 'SCHEDULED' }
    });
    expect(prisma.inspection.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7, status: 'SCHEDULED' },
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      skip: 0,
      take: 25
    });
  });

  it('liste sans filtre de statut', async () => {
    prisma.inspection.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/inspections')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: [],
      pagination: {
        page: 1,
        pageSize: 25,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    });
    expect(prisma.inspection.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7 },
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      skip: 0,
      take: 25
    });
  });

  it('applique pagination, type et recherche', async () => {
    prisma.inspection.count.mockResolvedValue(26);
    prisma.inspection.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/inspections?page=2&pageSize=10&inspectionType=FINAL&q=Principale')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual(expect.objectContaining({
      page: 2,
      pageSize: 10,
      total: 26,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    }));
    expect(prisma.inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ municipalityId: 7, inspectionType: 'FINAL', OR: expect.any(Array) }),
      skip: 10,
      take: 10
    }));
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

  it('normalise les champs optionnels absents à null', async () => {
    prisma.inspection.create.mockResolvedValue({ id: inspectionId, status: 'SCHEDULED' });

    const res = await request(app)
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        scheduledAt: '2026-08-10T14:00:00.000Z',
        address: '200 rue Principale',
        inspectionType: 'PRE_WORK'
      });

    expect(res.status).toBe(201);
    expect(prisma.inspection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ permitId: null, notes: null })
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

  it('retourne une inspection de la municipalité du jeton', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, municipalityId: 7 });

    const res = await request(app)
      .get(`/api/v1/inspections/${inspectionId}`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(inspectionId);
  });

  it('refuse un identifiant invalide en consultation', async () => {
    const res = await request(app)
      .get('/api/v1/inspections/invalide')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(400);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
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

  it('refuse un identifiant invalide à la fermeture', async () => {
    const res = await request(app)
      .post('/api/v1/inspections/invalide/complete')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ outcome: 'COMPLIANT', findings: 'Constat valide.' });

    expect(res.status).toBe(400);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
  });

  it('retourne 404 lorsqu’une inspection à fermer est absente', async () => {
    prisma.inspection.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/complete`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ outcome: 'NON_COMPLIANT', findings: 'Inspection introuvable.' });

    expect(res.status).toBe(404);
    expect(prisma.inspection.update).not.toHaveBeenCalled();
  });

  it('refuse les données de fermeture invalides', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/complete`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ outcome: 'AUTRE', findings: 'x' });

    expect(res.status).toBe(400);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
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
