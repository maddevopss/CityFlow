const request = require('supertest');
const app = require('./app');

describe('limitation des routes d’opérations', () => {
  it('limite une lecture avant de refuser le jeton manquant', async () => {
    const response = await request(app).get('/api/v1/operations/diffusion');

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });

  it('limite une écriture avant de refuser le jeton manquant', async () => {
    const response = await request(app).post(
      '/api/v1/operations/diffusion/00000000-0000-4000-8000-000000000000/retry'
    );

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });
});
