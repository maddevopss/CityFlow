const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/municipalParks', () => ({
  PARK_TYPES: ['NEIGHBORHOOD','REGIONAL','RIVERFRONT','SPORTS','NATURE','PLAZA','OTHER'],
  MAINTENANCE_LEVELS: ['MINIMAL','STANDARD','ENHANCED','INTENSIVE'],
  getPark: jest.fn(),
  savePark: jest.fn()
}));

const service = require('../../src/services/municipalParks');
const app = require('../../src/app');
const secret = process.env.JWT_SECRET || 'test-secret';
const assetId = '33333333-3333-4333-8333-333333333333';

function token(role, municipalityId = 7) {
  return jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role, municipalityId }, secret, { expiresIn: '1h' });
}

describe('municipal parks API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exige une authentification', async () => {
    const response = await request(app).get(`/api/v1/municipal-assets/${assetId}/park`);
    expect(response.status).toBe(401);
  });

  it('autorise la lecture municipale', async () => {
    service.getPark.mockResolvedValue({ assetId, parkType: 'NATURE' });
    const response = await request(app)
      .get(`/api/v1/municipal-assets/${assetId}/park`)
      .set('Authorization', `Bearer ${token('VIEWER')}`);
    expect(response.status).toBe(200);
    expect(service.getPark).toHaveBeenCalledWith(expect.anything(), { municipalityId: 7, assetId });
  });

  it('refuse une écriture à un lecteur', async () => {
    const response = await request(app)
      .put(`/api/v1/municipal-assets/${assetId}/park`)
      .set('Authorization', `Bearer ${token('VIEWER')}`)
      .send({ parkType: 'NATURE' });
    expect(response.status).toBe(403);
  });

  it('valide les données avant le service', async () => {
    const response = await request(app)
      .put(`/api/v1/municipal-assets/${assetId}/park`)
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .send({ parkType: 'INVALID', areaSquareMeters: -1 });
    expect(response.status).toBe(400);
    expect(service.savePark).not.toHaveBeenCalled();
  });

  it('transmet uniquement la municipalité du jeton', async () => {
    service.savePark.mockResolvedValue({ assetId, version: 1 });
    const response = await request(app)
      .put(`/api/v1/municipal-assets/${assetId}/park`)
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .set('Idempotency-Key', 'park-save-001')
      .send({ parkType: 'NEIGHBORHOOD', municipalityId: 999 });
    expect(response.status).toBe(200);
    expect(service.savePark).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ municipalityId: 7, assetId }));
  });
});