const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  workOrder: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  workLog: { create: jest.fn() },
  $transaction: jest.fn(values => Promise.all(values))
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'PUBLIC_WORKS_MANAGER', municipalityId: 7 }, process.env.JWT_SECRET || 'test-secret');
const workerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'FIELD_WORKER', municipalityId: 7 }, process.env.JWT_SECRET || 'test-secret');
const id = '33333333-3333-4333-8333-333333333333';

describe('Work orders API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crée un ordre numéroté et isolé', async () => {
    prisma.workOrder.count.mockResolvedValue(0);
    prisma.workOrder.create.mockResolvedValue({ id, publicNumber: 'WO-7-000001', status: 'DRAFT' });
    const response = await request(app).post('/api/v1/work-orders').set('Authorization', `Bearer ${token}`).send({ title: 'Réparer une conduite', description: 'Fuite sur conduite principale', workType: 'CORRECTIVE', priority: 'HIGH' });
    expect(response.status).toBe(201);
    expect(prisma.workOrder.create).toHaveBeenCalledWith({ data: expect.objectContaining({ municipalityId: 7, publicNumber: 'WO-7-000001' }) });
  });

  it('démarre seulement un ordre affecté', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id, status: 'DRAFT' });
    const response = await request(app).post(`/api/v1/work-orders/${id}/start`).set('Authorization', `Bearer ${workerToken}`);
    expect(response.status).toBe(409);
  });

  it('ajoute un journal pendant l’intervention', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id, status: 'IN_PROGRESS' });
    prisma.workLog.create.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444' });
    const response = await request(app).post(`/api/v1/work-orders/${id}/logs`).set('Authorization', `Bearer ${workerToken}`).send({ logType: 'TIME', description: 'Intervention terrain', hours: 2 });
    expect(response.status).toBe(201);
  });
});
