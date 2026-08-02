const {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  archiveAsset
} = require('../../src/services/municipalAssets');

const municipalityId = 7;
const assetId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';

function transactionDb(queryResults = []) {
  const tx = {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1)
  };
  const db = {
    $queryRawUnsafe: jest.fn(),
    $transaction: jest.fn(async (callback) => callback(tx))
  };
  queryResults.forEach((result) => db.$queryRawUnsafe.mockResolvedValueOnce(result));
  return { db, tx };
}

describe('municipal assets service', () => {
  it('retourne un actif uniquement dans sa municipalité', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: assetId, municipalityId }]) };
    await expect(getAsset(db, { municipalityId, id: assetId })).resolves.toMatchObject({ id: assetId });
    expect(db.$queryRawUnsafe).toHaveBeenCalledWith(expect.stringContaining('"municipalityId"=$2'), assetId, municipalityId, false);
  });

  it('retourne null lorsque l actif est absent', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };
    await expect(getAsset(db, { municipalityId, id: assetId })).resolves.toBeNull();
  });

  it('pagine, filtre et plafonne la limite', async () => {
    const db = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([{ id: assetId }])
        .mockResolvedValueOnce([{ total: 101 }])
    };
    const result = await listAssets(db, {
      municipalityId,
      assetType: 'BUILDING',
      status: 'ACTIVE',
      q: 'hotel de ville',
      page: 2,
      limit: 500,
      sortBy: 'name',
      sortDirection: 'asc'
    });
    expect(result.items).toHaveLength(1);
    expect(result.pagination).toEqual({ page: 2, limit: 100, total: 101, totalPages: 2 });
    expect(db.$queryRawUnsafe.mock.calls[0][0]).toContain('ORDER BY "name" ASC');
    expect(db.$queryRawUnsafe.mock.calls[0]).toContain(100);
    expect(db.$queryRawUnsafe.mock.calls[0]).toContain(100);
  });

  it('rejoue une création idempotente sans nouvelle écriture', async () => {
    const existing = { id: assetId, municipalityId, assetNumber: 'BAT-001' };
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([existing]) };
    const result = await createAsset(db, {
      municipalityId,
      actorId,
      idempotencyKey: 'create-bat-001',
      assetNumber: 'bat 001',
      name: 'Hôtel de ville',
      assetType: 'BUILDING'
    });
    expect(result).toEqual({ item: existing, replayed: true });
    expect(db.$transaction).toBeUndefined();
  });

  it('crée un actif et son événement append-only', async () => {
    const created = { id: assetId, municipalityId, assetNumber: 'BAT-001', status: 'DRAFT' };
    const { db, tx } = transactionDb([[], [created]]);
    const result = await createAsset(db, {
      municipalityId,
      actorId,
      idempotencyKey: 'create-bat-001',
      assetNumber: 'bat 001',
      name: 'Hôtel de ville',
      assetType: 'BUILDING',
      location: { latitude: 45.5, longitude: -73.5 }
    });
    expect(result.replayed).toBe(false);
    expect(result.item).toEqual(created);
    expect(tx.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    expect(tx.$executeRawUnsafe.mock.calls[0]).toContain('BAT-001');
    expect(tx.$executeRawUnsafe.mock.calls[1][0]).toContain('ASSET_CREATED');
  });

  it('refuse une mise à jour avec une version périmée', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: assetId, municipalityId, version: 3, status: 'ACTIVE' }]) };
    await expect(updateAsset(db, {
      municipalityId,
      id: assetId,
      actorId,
      version: 2,
      name: 'Nouveau nom'
    })).rejects.toMatchObject({ statusCode: 409, code: 'ASSET_VERSION_CONFLICT' });
  });

  it('refuse de modifier un actif archivé', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: assetId, municipalityId, version: 1, archivedAt: new Date() }]) };
    await expect(updateAsset(db, {
      municipalityId,
      id: assetId,
      actorId,
      version: 1,
      name: 'Nouveau nom'
    })).rejects.toMatchObject({ statusCode: 409, code: 'ASSET_ARCHIVED' });
  });

  it('archive logiquement et conserve une preuve', async () => {
    const current = { id: assetId, municipalityId, status: 'ACTIVE', archivedAt: null };
    const archived = { ...current, archivedAt: new Date() };
    const { db, tx } = transactionDb([[current], [archived]]);
    const result = await archiveAsset(db, {
      municipalityId,
      id: assetId,
      actorId,
      reason: 'Remplacé par un nouvel équipement',
      idempotencyKey: 'archive-asset-001'
    });
    expect(result.replayed).toBe(false);
    expect(result.item.archivedAt).toBeTruthy();
    expect(tx.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    expect(tx.$executeRawUnsafe.mock.calls[1][0]).toContain('ASSET_ARCHIVED');
  });

  it('rejoue l archivage d un actif déjà archivé', async () => {
    const archived = { id: assetId, municipalityId, status: 'RETIRED', archivedAt: new Date() };
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([archived]) };
    await expect(archiveAsset(db, {
      municipalityId,
      id: assetId,
      actorId,
      reason: 'Déjà archivé',
      idempotencyKey: 'archive-asset-001'
    })).resolves.toEqual({ item: archived, replayed: true });
  });
});
