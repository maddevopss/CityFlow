const request = require('supertest');
const app = require('./app');

describe('limitation des routes d’événements', () => {
  it('limite une lecture avant de refuser le jeton manquant', async () => {
    const response = await request(app).get('/api/v1/events');

    expect(response.status).toBe(401);
    expect(response.headers.ratelimit).toBeDefined();
  });

  it('limite une écriture avant de refuser le jeton manquant', async () => {
    const response = await request(app).post('/api/v1/events').send({});

    expect(response.status).toBe(401);
    expect(response.headers.ratelimit).toBeDefined();
  });
});
