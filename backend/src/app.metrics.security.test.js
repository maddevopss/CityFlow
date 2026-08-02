const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('./app');
const config = require('./config');

describe('GET /metrics/http', () => {
  it('refuse une requête sans jeton', async () => {
    const response = await request(app).get('/metrics/http');

    expect(response.status).toBe(401);
  });

  it('refuse un utilisateur non administrateur', async () => {
    const token = jwt.sign(
      { id: 'viewer-id', role: 'VIEWER', municipalityId: 1 },
      config.jwtSecret
    );

    const response = await request(app)
      .get('/metrics/http')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('autorise et limite un administrateur', async () => {
    const token = jwt.sign(
      { id: 'admin-id', role: 'ADMIN', municipalityId: 1 },
      config.jwtSecret
    );

    const response = await request(app)
      .get('/metrics/http')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers.ratelimit).toBeDefined();
    expect(response.body).toEqual({
      generatedAt: expect.any(String),
      metrics: expect.any(Array)
    });
  });
});
