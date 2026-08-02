const request = require('supertest');

jest.mock('./db/prisma', () => ({
  citizenRequest: {
    groupBy: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn()
  },
  citizenRequestEvent: {
    createMany: jest.fn()
  },
  citizenEscalationRun: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn()
}));

const prisma = require('./db/prisma');
const app = require('./app');

function expectLimitedBeforeDatabase(response) {
  expect(response.status).toBe(401);
  expect(response.headers.ratelimit).toBeDefined();
}

describe('sécurité regroupée des opérations citoyennes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limite le résumé municipal avant authentification', async () => {
    const response = await request(app).get(
      '/api/v1/municipal/citizen-requests/summary'
    );

    expectLimitedBeforeDatabase(response);
    expect(prisma.citizenRequest.groupBy).not.toHaveBeenCalled();
    expect(prisma.citizenRequest.count).not.toHaveBeenCalled();
  });

  it('limite les affectations massives avant authentification', async () => {
    const response = await request(app)
      .post('/api/v1/municipal/citizen-requests/bulk-assign')
      .send({
        requestIds: ['33333333-3333-4333-8333-333333333333'],
        team: 'Voirie'
      });

    expectLimitedBeforeDatabase(response);
    expect(prisma.citizenRequest.findMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('limite l’historique des escalades avant authentification', async () => {
    const response = await request(app).get(
      '/api/v1/municipal/citizen-requests/escalations/history'
    );

    expectLimitedBeforeDatabase(response);
    expect(prisma.citizenEscalationRun.findMany).not.toHaveBeenCalled();
  });

  it('limite l’exécution des escalades avant authentification', async () => {
    const response = await request(app).post(
      '/api/v1/municipal/citizen-requests/escalations/run'
    );

    expectLimitedBeforeDatabase(response);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.citizenEscalationRun.create).not.toHaveBeenCalled();
  });
});
