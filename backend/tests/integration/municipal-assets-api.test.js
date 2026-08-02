const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/municipalAssets', () => {
  const domain = jest.requireActual('../../src/domain/municipalAssets');
  return {
    ...domain,
    listAssets: jest.fn(),
    getAsset: jest.fn(),
    createAsset: jest.fn(),
    updateAsset: jest.fn(),
    archiveAsset: jest.fn()
  };
});

const service = require('../../src/services/municipalAssets');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const actorId = '11111111-1111-4111-8111-111111111111';
const assetId = '33333333-3333-4333-8333-333333333333';

function token(role, municipalityId = 7) {
  return jwt.sign({ sub: actorId, role, municipalityId }, secret, { expiresIn: '1h' });
}

describe('municipal assets API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exige une authentification', async () => {
    const response = await request(app).get('/api/v1/municipal-assets');
    expect(response.status).toBe(401);
  });

  it('exige une municipalité', async () => {
    const response = await request(app)
      .get('/api/v1/municipal-assets')
      .set('Authorization', `Bearer ${token('ADMIN', undefined)}`);
    expect(response.status).toBe(403);
    expect(service.listAssets).not.toHaveBeenCalled();
  });

  it('valide les filtres et la pagination', async () => {
    const response = await request(app)
      .get('/api/v1/municipal-assets?assetType=INVALID&limit=500')
      .set('Authorization', `Bearer ${token('VIEWER')}`);
    expect(response.status).toBe(400);
    expect(service.listAssets).not.toHaveBeenCalled();
  });

  it('liste les actifs avec accès en lecture seule', async () => {
    service.listAssets.mockResolvedValue({ items: [{ id: assetId }], pagination: { page: 1, limit: 25, total: 1, totalPages: 1 } });
    const response = await request(app)
      .get('/api/v1/municipal-assets?q=hotel&assetType=BUILDING')
      .set('Authorization', `Bearer ${token('VIEWER')}`);
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(service.listAssets).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ municipalityId: 7, q: 'hotel', assetType: 'BUILDING' }));
  });

  it('retourne 404 sans divulguer un actif externe', async () => {
    service.getAsset.mockResolvedValue(null);
    const response = await request(app)
      .get(`/api/v1/municipal-assets/${assetId}`)
      .set('Authorization', `Bearer ${token('VIEWER')}`);
    expect(response.status).toBe(404);
    expect(service.getAsset).toHaveBeenCalledWith(expect.anything(), { municipalityId: 7, id: assetId });
  });

  it('exige une clé idempotente pour créer', async () => {
    const response = await request(app)
      .post('/api/v1/municipal-assets')
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .send({ assetNumber: 'BAT-001', name: 'Hôtel de ville', assetType: 'BUILDING' });
    expect(response.status).toBe(400);
    expect(service.createAsset).not.toHaveBeenCalled();
  });

  it('refuse la création à un lecteur', async () => {
    const response = await request(app)
      .post('/api/v1/municipal-assets')
      .set('Authorization', `Bearer ${token('VIEWER')}`)
      .set('Idempotency-Key', 'create-bat-001')
      .send({ assetNumber: 'BAT-001', name: 'Hôtel de ville', assetType: 'BUILDING' });
    expect(response.status).toBe(403);
  });

  it('crée un actif et distingue une répétition', async () => {
    const item = { id: assetId, assetNumber: 'BAT-001' };
    service.createAsset.mockResolvedValueOnce({ item, replayed: false }).mockResolvedValueOnce({ item, replayed: true });

    const first = await request(app)
      .post('/api/v1/municipal-assets')
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .set('Idempotency-Key', 'create-bat-001')
      .send({ assetNumber: 'BAT-001', name: 'Hôtel de ville', assetType: 'BUILDING' });
    const replay = await request(app)
      .post('/api/v1/municipal-assets')
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .set('Idempotency-Key', 'create-bat-001')
      .send({ assetNumber: 'BAT-001', name: 'Hôtel de ville', assetType: 'BUILDING' });

    expect(first.status).toBe(201);
    expect(replay.status).toBe(200);
    expect(replay.body.replayed).toBe(true);
  });

  it('valide la version lors d une modification', async () => {
    const response = await request(app)
      .patch(`/api/v1/municipal-assets/${assetId}`)
      .set('Authorization', `Bearer ${token('MANAGER')}`)
      .send({ name: 'Nom sans version' });
    expect(response.status).toBe(400);
    expect(service.updateAsset).not.toHaveBeenCalled();
  });

  it('traduit un conflit de version', async () => {
    const error = new Error('La fiche a été modifiée');
    error.statusCode = 409;
    error.code = 'ASSET_VERSION_CONFLICT';
    service.updateAsset.mockRejectedValue(error);
    const response = await request(app)
      .patch(`/api/v1/municipal-assets/${assetId}`)
      .set('Authorization', `Bearer ${token('MANAGER')}`)
      .send({ version: 1, name: 'Nouveau nom' });
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('ASSET_VERSION_CONFLICT');
  });

  it('réserve l archivage aux gestionnaires', async () => {
    const response = await request(app)
      .delete(`/api/v1/municipal-assets/${assetId}`)
      .set('Authorization', `Bearer ${token('MUNICIPAL_AGENT')}`)
      .set('Idempotency-Key', 'archive-bat-001')
      .send({ reason: 'Actif remplacé après inspection complète' });
    expect(response.status).toBe(403);
  });

  it('archive logiquement avec un motif et une clé', async () => {
    service.archiveAsset.mockResolvedValue({ item: { id: assetId, archivedAt: new Date().toISOString() }, replayed: false });
    const response = await request(app)
      .delete(`/api/v1/municipal-assets/${assetId}`)
      .set('Authorization', `Bearer ${token('ADMIN')}`)
      .set('Idempotency-Key', 'archive-bat-001')
      .send({ reason: 'Actif remplacé après inspection complète' });
    expect(response.status).toBe(200);
    expect(service.archiveAsset).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ municipalityId: 7, id: assetId }));
  });
});
