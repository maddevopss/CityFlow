const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  municipality: { findUnique: jest.fn() },
  citizenReport: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  citizenReportMessage: { create: jest.fn() },
  $transaction: jest.fn()
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'CITIZEN_SERVICE_AGENT', municipalityId: 7 }, process.env.JWT_SECRET || 'test-secret');
const reportId = '33333333-3333-4333-8333-333333333333';

describe('Citizen reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async value => {
      if (Array.isArray(value)) return Promise.all(value);
      return value({ citizenReport: prisma.citizenReport, citizenReportMessage: prisma.citizenReportMessage });
    });
  });

  it('crée un signalement public avec jeton de suivi', async () => {
    prisma.municipality.findUnique.mockResolvedValue({ id: 7 });
    prisma.citizenReport.count.mockResolvedValue(0);
    prisma.citizenReport.create.mockResolvedValue({ id: reportId, publicNumber: 'REQ-7-0000001', status: 'RECEIVED', createdAt: new Date() });
    const response = await request(app).post('/api/v1/citizen-reports/public').send({ municipalityId: 7, category: 'ROAD', title: 'Nid-de-poule', description: 'Trou important sur la chaussée' });
    expect(response.status).toBe(201);
    expect(response.body.trackingToken).toBeDefined();
  });

  it('refuse le suivi public sans jeton', async () => {
    const response = await request(app).get('/api/v1/citizen-reports/public/REQ-7-0000001');
    expect(response.status).toBe(401);
  });

  it('trace une transition municipale', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue({ id: reportId, status: 'RECEIVED' });
    prisma.citizenReport.update.mockResolvedValue({ id: reportId, status: 'TRIAGED' });
    prisma.citizenReportMessage.create.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444' });
    const response = await request(app).post(`/api/v1/citizen-reports/${reportId}/transition`).set('Authorization', `Bearer ${token}`).send({ status: 'TRIAGED', priority: 'HIGH', reason: 'Pris en charge par les travaux publics' });
    expect(response.status).toBe(200);
  });
});
