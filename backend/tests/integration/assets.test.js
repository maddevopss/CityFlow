const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  asset: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  assetConditionAssessment: { create: jest.fn() },
  $transaction: jest.fn(values => Promise.all(values))
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'ASSET_MANAGER', municipalityId: 7 }, process.env.JWT_SECRET || 'test-secret');
const assetId = '33333333-3333-4333-8333-333333333333';

describe('Assets API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crée un actif dans la municipalité du jeton', async () => {
    prisma.asset.create.mockResolvedValue({ id: assetId, publicCode: 'BLD-001' });
    const response = await request(app).post('/api/v1/assets').set('Authorization', `Bearer ${token}`).send({ publicCode: 'BLD-001', name: 'Hôtel de ville', category: 'BUILDING' });
    expect(response.status).toBe(201);
    expect(prisma.asset.create).toHaveBeenCalledWith({ data: expect.objectContaining({ municipalityId: 7, createdBy: '11111111-1111-4111-8111-111111111111' }) });
  });

  it('refuse un parent d’une autre municipalité', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);
    const response = await request(app).post('/api/v1/assets').set('Authorization', `Bearer ${token}`).send({ publicCode: 'EQ-001', name: 'Pompe', category: 'EQUIPMENT', parentId: assetId });
    expect(response.status).toBe(400);
  });

  it('enregistre une évaluation de condition', async () => {
    prisma.asset.findFirst.mockResolvedValue({ id: assetId });
    prisma.assetConditionAssessment.create.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444', score: 70 });
    const response = await request(app).post(`/api/v1/assets/${assetId}/assessments`).set('Authorization', `Bearer ${token}`).send({ condition: 'FAIR', score: 70 });
    expect(response.status).toBe(201);
  });
});
