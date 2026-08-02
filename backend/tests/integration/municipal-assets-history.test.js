const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/municipalAssetHistory', () => ({
  listAssetHistory: jest.fn(),
  restoreAsset: jest.fn()
}));

const service = require('../../src/services/municipalAssetHistory');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const actorId = '11111111-1111-4111-8111-111111111111';
const assetId = '33333333-3333-4333-8333-333333333333';
const token = (role, municipalityId = 7) => jwt.sign({ sub: actorId, role, municipalityId }, secret, { expiresIn: '1h' });

describe('municipal asset history API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('valide l identifiant et les dates', async () => {
    const response = await request(app)
      .get('/api/v1/municipal-assets/invalide/history?from=2026-08-02&to=2026-08-01')
      .set('Authorization', `Bearer ${token('VIEWER')}`);
    expect(response.status).toBe(400);
    expect(service.listAssetHistory).not.toHaveBeenCalled();
  });

  it('permet la lecture à un viewer et transmet la municipalité', async () => {
    service.listAssetHistory.mockResolvedValue({ items: [], pagination: { page: 1, limit: 25, total: 0, totalPages: 0 } });
    const response = await request(app)
      .get(`/api/v1/municipal-assets/${assetId}/history?eventType=UPDATED`)
      .set('Authorization', `Bearer ${token('VIEWER')}`);
    expect(response.status).toBe(200);
    expect(service.listAssetHistory).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ municipalityId: 7, assetId, eventType: 'UPDATED' }));
  });

  it('refuse la restauration à un agent municipal', async () => {
    const response = await request(app)
      .post(`/api/v1/municipal-assets/${assetId}/restore`)
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .set('Idempotency-Key', 'restore-001')
      .send({ reason: 'Réactivation après validation complète' });
    expect(response.status).toBe(403);
  });

  it('exige une clé et un motif valides', async () => {
    const response = await request(app)
      .post(`/api/v1/municipal-assets/${assetId}/restore`)
      .set('Authorization', `Bearer ${token('MANAGER')}`)
      .send({ reason: 'court' });
    expect(response.status).toBe(400);
    expect(service.restoreAsset).not.toHaveBeenCalled();
  });

  it('restaure un actif archivé de la municipalité', async () => {
    service.restoreAsset.mockResolvedValue({ item: { id: assetId, archivedAt: null, status: 'INACTIVE' }, replayed: false });
    const response = await request(app)
      .post(`/api/v1/municipal-assets/${assetId}/restore`)
      .set('Authorization', `Bearer ${token('ADMIN')}`)
      .set('Idempotency-Key', 'restore-001')
      .send({ reason: 'Réactivation après validation complète', status: 'INACTIVE' });
    expect(response.status).toBe(201);
    expect(service.restoreAsset).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ municipalityId: 7, assetId, actorId, idempotencyKey: 'restore-001' }));
  });

  it('traduit les erreurs métier sans divulguer une autre municipalité', async () => {
    const error = new Error('Actif municipal introuvable');
    error.statusCode = 404;
    error.code = 'ASSET_NOT_FOUND';
    service.listAssetHistory.mockRejectedValue(error);
    const response = await request(app)
      .get(`/api/v1/municipal-assets/${assetId}/history`)
      .set('Authorization', `Bearer ${token('VIEWER', 99)}`);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('ASSET_NOT_FOUND');
  });
});
