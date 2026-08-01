const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  asset: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  assetConditionAssessment: { create: jest.fn() },
  $transaction: jest.fn(values => Promise.all(values))
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'ASSET_MANAGER', municipalityId: 7 }, secret);
const viewerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'VIEWER', municipalityId: 7 }, secret);
const assetId = '33333333-3333-4333-8333-333333333333';

describe('Assets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(values => Promise.all(values));
  });

  it('refuse une requête non authentifiée', async () => {
    expect((await request(app).get('/api/v1/assets')).status).toBe(401);
  });

  it('refuse un rôle non autorisé', async () => {
    expect((await request(app).get('/api/v1/assets').set('Authorization', `Bearer ${viewerToken}`)).status).toBe(403);
  });

  it('liste avec pagination et tous les filtres', async () => {
    prisma.asset.count.mockResolvedValue(22);
    prisma.asset.findMany.mockResolvedValue([{ id: assetId }]);
    const response = await request(app)
      .get('/api/v1/assets?page=2&pageSize=10&category=BUILDING&status=ACTIVE&criticality=CRITICAL&q=hotel')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, pageSize: 10, total: 22, totalPages: 3 });
    expect(prisma.asset.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
  });

  it('liste avec les valeurs par défaut', async () => {
    prisma.asset.count.mockResolvedValue(0);
    prisma.asset.findMany.mockResolvedValue([]);
    const response = await request(app).get('/api/v1/assets').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.pageSize).toBe(25);
  });

  it('refuse des filtres invalides', async () => {
    expect((await request(app).get('/api/v1/assets?page=0&category=UNKNOWN').set('Authorization', `Bearer ${token}`)).status).toBe(400);
  });

  it('crée un actif dans la municipalité du jeton', async () => {
    prisma.asset.create.mockResolvedValue({ id: assetId, publicCode: 'BLD-001' });
    const response = await request(app).post('/api/v1/assets').set('Authorization', `Bearer ${token}`).send({ publicCode: 'BLD-001', name: 'Hôtel de ville', category: 'BUILDING' });
    expect(response.status).toBe(201);
    expect(prisma.asset.create).toHaveBeenCalledWith({ data: expect.objectContaining({ municipalityId: 7, acquisitionDate: null, warrantyExpiresAt: null, createdBy: '11111111-1111-4111-8111-111111111111' }) });
  });

  it('crée un actif avec parent et dates', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId });
    prisma.asset.create.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444' });
    const response = await request(app).post('/api/v1/assets').set('Authorization', `Bearer ${token}`).send({ publicCode: 'EQ-002', name: 'Pompe principale', category: 'EQUIPMENT', parentId: assetId, acquisitionDate: '2025-01-01T00:00:00.000Z', warrantyExpiresAt: '2028-01-01T00:00:00.000Z' });
    expect(response.status).toBe(201);
    expect(prisma.asset.create).toHaveBeenCalledWith({ data: expect.objectContaining({ parentId: assetId, acquisitionDate: expect.any(Date), warrantyExpiresAt: expect.any(Date) }) });
  });

  it('refuse une création invalide', async () => {
    const response = await request(app).post('/api/v1/assets').set('Authorization', `Bearer ${token}`).send({ publicCode: 'x', name: 'x', category: 'UNKNOWN' });
    expect(response.status).toBe(400);
  });

  it('refuse un parent d’une autre municipalité', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);
    const response = await request(app).post('/api/v1/assets').set('Authorization', `Bearer ${token}`).send({ publicCode: 'EQ-001', name: 'Pompe', category: 'EQUIPMENT', parentId: assetId });
    expect(response.status).toBe(400);
  });

  it('retourne un actif détaillé', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId, municipalityId: 7 });
    expect((await request(app).get(`/api/v1/assets/${assetId}`).set('Authorization', `Bearer ${token}`)).status).toBe(200);
  });

  it('refuse un identifiant invalide', async () => {
    expect((await request(app).get('/api/v1/assets/invalide').set('Authorization', `Bearer ${token}`)).status).toBe(400);
  });

  it('retourne 404 pour un actif absent', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);
    expect((await request(app).get(`/api/v1/assets/${assetId}`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });

  it('enregistre une évaluation de condition avec notes', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId });
    prisma.assetConditionAssessment.create.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444', score: 70 });
    const response = await request(app).post(`/api/v1/assets/${assetId}/assessments`).set('Authorization', `Bearer ${token}`).send({ condition: 'FAIR', score: 70, notes: 'Usure modérée', assessedAt: '2026-08-01T00:00:00.000Z' });
    expect(response.status).toBe(201);
    expect(prisma.assetConditionAssessment.create).toHaveBeenCalledWith({ data: expect.objectContaining({ notes: 'Usure modérée', assessedAt: expect.any(Date) }) });
  });

  it('normalise les notes absentes dans une évaluation', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId });
    prisma.assetConditionAssessment.create.mockResolvedValue({ id: 'assessment-1' });
    const response = await request(app).post(`/api/v1/assets/${assetId}/assessments`).set('Authorization', `Bearer ${token}`).send({ condition: 'GOOD', score: 85 });
    expect(response.status).toBe(201);
    expect(prisma.assetConditionAssessment.create).toHaveBeenCalledWith({ data: expect.objectContaining({ notes: null }) });
  });

  it('refuse une évaluation invalide', async () => {
    expect((await request(app).post(`/api/v1/assets/${assetId}/assessments`).set('Authorization', `Bearer ${token}`).send({ condition: 'UNKNOWN', score: 200 })).status).toBe(400);
  });

  it('retourne 404 pour l’évaluation d’un actif absent', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);
    expect((await request(app).post(`/api/v1/assets/${assetId}/assessments`).set('Authorization', `Bearer ${token}`).send({ condition: 'GOOD', score: 80 })).status).toBe(404);
  });

  it('change l’état d’un actif', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId, status: 'ACTIVE' });
    prisma.asset.update.mockResolvedValue({ id: assetId, status: 'OUT_OF_SERVICE' });
    const response = await request(app).post(`/api/v1/assets/${assetId}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'OUT_OF_SERVICE', reason: 'Bris mécanique' });
    expect(response.status).toBe(200);
  });

  it('refuse un changement d’état invalide', async () => {
    expect((await request(app).post(`/api/v1/assets/${assetId}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'UNKNOWN', reason: 'x' })).status).toBe(400);
  });

  it('retourne 404 pour le changement d’état d’un actif absent', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);
    expect((await request(app).post(`/api/v1/assets/${assetId}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'ACTIVE', reason: 'Remis en service' })).status).toBe(404);
  });

  it('refuse de modifier un actif disposé', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId, status: 'DISPOSED' });
    expect((await request(app).post(`/api/v1/assets/${assetId}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'ACTIVE', reason: 'Tentative interdite' })).status).toBe(409);
  });
});
