const request = require('supertest');

jest.mock('./db/prisma', () => ({
  citizenRequest: {
    findFirst: jest.fn()
  },
  citizenMessage: {
    findMany: jest.fn()
  },
  $transaction: jest.fn()
}));

const prisma = require('./db/prisma');
const app = require('./app');

const requestId = '33333333-3333-4333-8333-333333333333';

describe('sécurité des messages citoyens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limite la lecture avant authentification et avant accès à la base', async () => {
    const response = await request(app).get(
      `/api/v1/citizen/requests/${requestId}/messages`
    );

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(prisma.citizenRequest.findFirst).not.toHaveBeenCalled();
  });

  it('limite l’écriture avant authentification et avant accès à la base', async () => {
    const response = await request(app)
      .post(`/api/v1/citizen/requests/${requestId}/messages`)
      .send({ body: 'Message' });

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(prisma.citizenRequest.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
