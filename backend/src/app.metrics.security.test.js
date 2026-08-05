const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('./db/prisma', () => ({
  user: {
    findUnique: jest.fn()
  }
}));

const prisma = require('./db/prisma');
const app = require('./app');
const config = require('./config');

describe('GET /metrics/http', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limite puis refuse une requête sans jeton', async () => {
    const response = await request(app).get('/metrics/http');

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });

  it('refuse un utilisateur non administrateur', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'viewer-id',
      role: 'VIEWER',
      municipalityId: 1,
      isActive: true
    });

    const token = jwt.sign(
      { sub: 'viewer-id', role: 'VIEWER', municipalityId: 1 },
      config.jwtSecret
    );

    const response = await request(app)
      .get('/metrics/http')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('autorise et limite un administrateur', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-id',
      role: 'ADMIN',
      municipalityId: 1,
      isActive: true
    });

    const token = jwt.sign(
      { sub: 'admin-id', role: 'ADMIN', municipalityId: 1 },
      config.jwtSecret
    );

    const response = await request(app)
      .get('/metrics/http')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.body).toEqual({
      generatedAt: expect.any(String),
      metrics: expect.any(Array)
    });
  });
});
