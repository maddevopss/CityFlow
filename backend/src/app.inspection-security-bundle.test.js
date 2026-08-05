const request = require('supertest');

jest.mock('./db/prisma', () => ({
  user: { findMany: jest.fn(), findFirst: jest.fn() },
  inspection: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  inspectionEvidence: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  },
  $transaction: jest.fn()
}));

const prisma = require('./db/prisma');
const app = require('./app');

const inspectionId = '33333333-3333-4333-8333-333333333333';

function expectRateLimitedBeforeDatabase(response) {
  expect(response.status).toBe(401);
  expect(response.headers['ratelimit-limit']).toBeDefined();
}

describe('sécurité regroupée des inspections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limite la lecture des inspections avant authentification', async () => {
    const response = await request(app).get('/api/v1/inspections');

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.inspection.findMany).not.toHaveBeenCalled();
  });

  it('limite les affectations avant authentification', async () => {
    const response = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/assign`)
      .send({ inspectorId: '44444444-4444-4444-8444-444444444444' });

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('limite les transitions de fin avant authentification', async () => {
    const response = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/complete`)
      .send({ outcome: 'COMPLIANT', findings: 'Conforme' });

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
    expect(prisma.inspection.update).not.toHaveBeenCalled();
  });

  it('limite la lecture des preuves avant authentification', async () => {
    const response = await request(app).get(
      `/api/v1/inspections/${inspectionId}/evidence`
    );

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
    expect(prisma.inspectionEvidence.findMany).not.toHaveBeenCalled();
  });

  it('limite l’ajout de preuves avant authentification', async () => {
    const response = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/evidence`)
      .send({});

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.inspection.findFirst).not.toHaveBeenCalled();
    expect(prisma.inspectionEvidence.create).not.toHaveBeenCalled();
  });

  it('limite le calendrier avant authentification', async () => {
    const response = await request(app).get(
      '/api/v1/inspection-calendar?from=2026-08-03T00:00:00.000Z&to=2026-08-04T00:00:00.000Z'
    );

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.inspection.findMany).not.toHaveBeenCalled();
  });

  it('limite l’export ICS avant authentification', async () => {
    const response = await request(app).get(
      '/api/v1/inspection-calendar/export.ics?from=2026-08-03T00:00:00.000Z&to=2026-08-04T00:00:00.000Z'
    );

    expectRateLimitedBeforeDatabase(response);
    expect(prisma.inspection.findMany).not.toHaveBeenCalled();
  });
});
