const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'INSPECTOR', municipalityId: 7 }, secret, { expiresIn: '1h' });

describe('Inspection route optimization API', () => {
  it('ordonne les arrêts par proximité', async () => {
    const res = await request(app)
      .post('/api/v1/inspection-route-optimization')
      .set('Authorization', `Bearer ${token}`)
      .send({
        origin: { id: 'origin', latitude: 45, longitude: -73 },
        stops: [
          { id: 'far', latitude: 46, longitude: -74 },
          { id: 'near', latitude: 45.1, longitude: -73.1 }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.orderedStops[0].id).toBe('near');
    expect(res.body.strategy).toBe('NEAREST_NEIGHBOUR');
  });

  it('refuse une tournée vide', async () => {
    const res = await request(app)
      .post('/api/v1/inspection-route-optimization')
      .set('Authorization', `Bearer ${token}`)
      .send({ origin: { id: 'origin', latitude: 45, longitude: -73 }, stops: [] });
    expect(res.status).toBe(400);
  });
});
