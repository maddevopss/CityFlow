const request = require('supertest');
const { version } = require('../package.json');
const app = require('./app');

describe('préparation de livraison', () => {
  it('expose un contrôle de santé versionné et traçable', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'cityflow-backend',
        version,
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    );
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
