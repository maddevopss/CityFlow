const request = require('supertest');
const app = require('./app');

describe('sécurité de l’export GeoJSON public', () => {
  it('limite et valide la requête avant l’accès aux données', async () => {
    const response = await request(app).get('/api/v1/exports/geojson');

    expect(response.status).toBe(400);
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });
});
