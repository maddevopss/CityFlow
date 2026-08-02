const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/municipalBuildings', () => ({
  getBuilding: jest.fn(),
  upsertBuilding: jest.fn()
}));

const service = require('../../src/services/municipalBuildings');
const app = require('../../src/app');
const secret = process.env.JWT_SECRET || 'test-secret';
const assetId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';
const token = (role, municipalityId = 7) => jwt.sign({ sub: actorId, role, municipalityId }, secret, { expiresIn: '1h' });

beforeEach(() => jest.clearAllMocks());

test('exige une authentification', async () => {
  expect((await request(app).get(`/api/v1/municipal-assets/${assetId}/building`)).status).toBe(401);
});

test('permet la lecture aux lecteurs', async () => {
  service.getBuilding.mockResolvedValue({ assetId, buildingUse: 'ADMINISTRATION' });
  const response = await request(app).get(`/api/v1/municipal-assets/${assetId}/building`)
    .set('Authorization', `Bearer ${token('VIEWER')}`);
  expect(response.status).toBe(200);
  expect(service.getBuilding).toHaveBeenCalledWith(expect.anything(), { municipalityId: 7, assetId });
});

test('refuse l écriture au lecteur', async () => {
  const response = await request(app).put(`/api/v1/municipal-assets/${assetId}/building`)
    .set('Authorization', `Bearer ${token('VIEWER')}`)
    .send({ buildingUse: 'ADMINISTRATION' });
  expect(response.status).toBe(403);
});

test('valide les données avant le service', async () => {
  const response = await request(app).put(`/api/v1/municipal-assets/${assetId}/building`)
    .set('Authorization', `Bearer ${token('MANAGER')}`)
    .send({ buildingUse: '', floorCount: 0 });
  expect(response.status).toBe(400);
  expect(service.upsertBuilding).not.toHaveBeenCalled();
});

test('enregistre la fiche dans la municipalité du jeton', async () => {
  service.upsertBuilding.mockResolvedValue({ assetId, buildingUse: 'ADMINISTRATION', version: 1 });
  const response = await request(app).put(`/api/v1/municipal-assets/${assetId}/building`)
    .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
    .send({ buildingUse: 'ADMINISTRATION', floorCount: 3, accessibilityStatus: 'COMPLIANT', fireSafetyStatus: 'COMPLIANT' });
  expect(response.status).toBe(200);
  expect(service.upsertBuilding).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ municipalityId: 7, assetId, actorId }));
});
