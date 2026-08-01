const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  $transaction: jest.fn(),
  citizenRequest: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  citizenRequestEvent: { create: jest.fn() },
  notification: { create: jest.fn(), count: jest.fn(), findMany: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const config = require('../../src/config');

const citizenId = '11111111-1111-4111-8111-111111111111';
const agentId = '22222222-2222-4222-8222-222222222222';
const requestId = '33333333-3333-4333-8333-333333333333';
const citizenToken = jwt.sign({ sub: citizenId, municipalityId: 7, role: 'CITIZEN' }, config.jwtSecret);
const agentToken = jwt.sign({ sub: agentId, municipalityId: 7, role: 'AGENT' }, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
  prisma.$transaction.mockImplementation(async value => {
    if (typeof value === 'function') return value(prisma);
    return Promise.all(value);
  });
});

test('crée une demande et son événement initial', async () => {
  prisma.citizenRequest.create.mockResolvedValue({ id: requestId, municipalityId: 7, citizenId, status: 'SUBMITTED', category: 'LIGHTING' });
  prisma.citizenRequestEvent.create.mockResolvedValue({});
  const res = await request(app).post('/api/v1/citizen/requests').set('Authorization', `Bearer ${citizenToken}`).send({
    title: 'Lampadaire brisé',
    description: 'Le lampadaire ne fonctionne plus depuis trois jours.',
    category: 'LIGHTING'
  });
  expect(res.status).toBe(201);
  expect(res.body.status).toBe('SUBMITTED');
  expect(prisma.citizenRequestEvent.create).toHaveBeenCalled();
});

test('masque une demande appartenant à un autre citoyen', async () => {
  prisma.citizenRequest.findFirst.mockResolvedValue({ id: requestId, municipalityId: 7, citizenId: agentId, events: [], messages: [] });
  const res = await request(app).get(`/api/v1/citizen/requests/${requestId}`).set('Authorization', `Bearer ${citizenToken}`);
  expect(res.status).toBe(404);
});

test('affecte une demande avec un rôle municipal', async () => {
  prisma.citizenRequest.findFirst.mockResolvedValue({ id: requestId, municipalityId: 7, citizenId, status: 'SUBMITTED' });
  prisma.citizenRequest.update.mockResolvedValue({ id: requestId, municipalityId: 7, citizenId, status: 'IN_REVIEW' });
  prisma.citizenRequestEvent.create.mockResolvedValue({});
  const res = await request(app).post(`/api/v1/citizen/requests/${requestId}/assign`).set('Authorization', `Bearer ${agentToken}`).send({ team: 'EQUIPE-TERRAIN-1' });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('IN_REVIEW');
});

test('crée une notification lors de la résolution', async () => {
  prisma.citizenRequest.findFirst.mockResolvedValue({ id: requestId, municipalityId: 7, citizenId, status: 'IN_PROGRESS' });
  prisma.citizenRequest.update.mockResolvedValue({ id: requestId, municipalityId: 7, citizenId, status: 'RESOLVED' });
  prisma.citizenRequestEvent.create.mockResolvedValue({});
  prisma.notification.create.mockResolvedValue({});
  const res = await request(app).post(`/api/v1/citizen/requests/${requestId}/status`).set('Authorization', `Bearer ${agentToken}`).send({ status: 'RESOLVED', resolution: 'Ampoule remplacée.' });
  expect(res.status).toBe(200);
  expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({
      eventType: 'REQUEST_UPDATED',
      requestId,
      channel: 'IN_APP',
      status: 'PENDING'
    })
  }));
});
