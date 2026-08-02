const { getBuilding, upsertBuilding } = require('../../src/services/municipalBuildings');

const assetId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';

function db(results = []) {
  const query = jest.fn();
  results.forEach((result) => query.mockResolvedValueOnce(result));
  return { $queryRawUnsafe: query, $executeRawUnsafe: jest.fn().mockResolvedValue(1) };
}

test('refuse un actif absent de la municipalité', async () => {
  await expect(getBuilding(db([[]]), { municipalityId: 7, assetId }))
    .rejects.toMatchObject({ statusCode: 404, code: 'ASSET_NOT_FOUND' });
});

test('refuse un actif qui n est pas un bâtiment', async () => {
  await expect(getBuilding(db([[{ id: assetId, assetType: 'PARK' }]]), { municipalityId: 7, assetId }))
    .rejects.toMatchObject({ statusCode: 409, code: 'ASSET_TYPE_MISMATCH' });
});

test('retourne une fiche bâtiment existante', async () => {
  const item = { id: 'building-1', assetId, version: 1 };
  await expect(getBuilding(db([[{ id: assetId, assetType: 'BUILDING' }], [item]]), { municipalityId: 7, assetId }))
    .resolves.toEqual(item);
});

test('détecte un conflit de version', async () => {
  const database = db([[{ id: assetId, assetType: 'BUILDING', version: 2 }], [{ id: 'b', version: 3 }]]);
  await expect(upsertBuilding(database, {
    municipalityId: 7, assetId, actorId, version: 2, buildingUse: 'ADMINISTRATION',
    heritageStatus: 'NONE', accessibilityStatus: 'UNKNOWN', fireSafetyStatus: 'UNKNOWN'
  })).rejects.toMatchObject({ statusCode: 409, code: 'BUILDING_VERSION_CONFLICT' });
  expect(database.$executeRawUnsafe).not.toHaveBeenCalled();
});

test('crée une fiche et ajoute un événement append-only', async () => {
  const item = { id: 'b', assetId, buildingUse: 'ADMINISTRATION', version: 1 };
  const database = db([[{ id: assetId, assetType: 'BUILDING', version: 1 }], [], [item]]);
  await expect(upsertBuilding(database, {
    municipalityId: 7, assetId, actorId, version: null, buildingUse: 'ADMINISTRATION',
    heritageStatus: 'NONE', accessibilityStatus: 'COMPLIANT', fireSafetyStatus: 'COMPLIANT', metadata: {}
  })).resolves.toEqual(item);
  expect(database.$executeRawUnsafe).toHaveBeenCalledTimes(2);
  expect(database.$executeRawUnsafe.mock.calls[1]).toContain('BUILDING_CREATED');
});
