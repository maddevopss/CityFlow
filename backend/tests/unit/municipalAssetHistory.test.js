const { listAssetHistory, restoreAsset } = require('../../src/services/municipalAssetHistory');

const municipalityId = 7;
const assetId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';

describe('municipal asset history service', () => {
  it('refuse un actif hors municipalité', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };
    await expect(listAssetHistory(db, { municipalityId, assetId })).rejects.toMatchObject({ statusCode: 404, code: 'ASSET_NOT_FOUND' });
  });

  it('liste l historique paginé avec filtres', async () => {
    const db = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([{ id: assetId, archivedAt: null }])
        .mockResolvedValueOnce([{ id: 'event-1', eventType: 'UPDATED' }])
        .mockResolvedValueOnce([{ total: 1 }])
    };
    const result = await listAssetHistory(db, {
      municipalityId,
      assetId,
      eventType: 'UPDATED',
      actorId,
      page: 2,
      limit: 10
    });
    expect(result.pagination).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
    expect(db.$queryRawUnsafe.mock.calls[1]).toEqual(expect.arrayContaining([municipalityId, assetId, 'UPDATED', actorId, 10, 10]));
  });

  it('refuse la restauration d un actif actif', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: assetId, archivedAt: null }]) };
    await expect(restoreAsset(db, {
      municipalityId,
      assetId,
      actorId,
      status: 'INACTIVE',
      reason: 'Restauration demandée',
      idempotencyKey: 'restore-001'
    })).rejects.toMatchObject({ statusCode: 409, code: 'ASSET_NOT_ARCHIVED' });
  });

  it('rejoue une restauration idempotente', async () => {
    const archived = { id: assetId, archivedAt: '2026-08-01T00:00:00.000Z' };
    const db = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([archived])
        .mockResolvedValueOnce([{ id: 'event-1' }])
    };
    await expect(restoreAsset(db, {
      municipalityId,
      assetId,
      actorId,
      status: 'INACTIVE',
      reason: 'Restauration demandée',
      idempotencyKey: 'restore-001'
    })).resolves.toEqual({ item: archived, replayed: true });
  });

  it('restaure dans une transaction et ajoute un événement', async () => {
    const archived = { id: assetId, archivedAt: '2026-08-01T00:00:00.000Z' };
    const restored = { id: assetId, archivedAt: null, status: 'INACTIVE' };
    const tx = {
      $queryRawUnsafe: jest.fn().mockResolvedValue([restored]),
      $executeRawUnsafe: jest.fn().mockResolvedValue(1)
    };
    const db = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([archived])
        .mockResolvedValueOnce([]),
      $transaction: jest.fn(async (callback) => callback(tx))
    };
    await expect(restoreAsset(db, {
      municipalityId,
      assetId,
      actorId,
      status: 'INACTIVE',
      reason: 'Réactivation après validation complète',
      idempotencyKey: 'restore-001'
    })).resolves.toEqual({ item: restored, replayed: false });
    expect(tx.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("'RESTORED'"),
      expect.any(String), municipalityId, assetId, actorId, expect.stringContaining('Réactivation'), 'restore-001'
    );
  });
});
