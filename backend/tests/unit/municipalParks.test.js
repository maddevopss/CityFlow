const { PARK_TYPES, MAINTENANCE_LEVELS, getPark, savePark } = require('../../src/services/municipalParks');

const assetId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';

describe('municipal parks service', () => {
  it('expose les référentiels immuables', () => {
    expect(PARK_TYPES).toContain('NEIGHBORHOOD');
    expect(MAINTENANCE_LEVELS).toContain('ENHANCED');
    expect(Object.isFrozen(PARK_TYPES)).toBe(true);
  });

  it('refuse un actif qui n est pas un parc', async () => {
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: assetId, assetType: 'BUILDING', archivedAt: null }]) };
    await expect(getPark(db, { municipalityId: 7, assetId })).rejects.toMatchObject({ code: 'ASSET_TYPE_MISMATCH' });
  });

  it('refuse une version périmée', async () => {
    const tx = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([{ id: assetId, assetType: 'PARK', archivedAt: null }])
        .mockResolvedValueOnce([{ version: 3 }]),
      $executeRawUnsafe: jest.fn()
    };
    const db = { $transaction: (callback) => callback(tx) };
    await expect(savePark(db, {
      municipalityId: 7,
      assetId,
      actorId,
      version: 2,
      parkType: 'NEIGHBORHOOD',
      maintenanceLevel: 'STANDARD'
    })).rejects.toMatchObject({ code: 'PARK_VERSION_CONFLICT' });
  });

  it('ajoute une preuve append-only lors de l enregistrement', async () => {
    const tx = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([{ id: assetId, assetType: 'PARK', archivedAt: null }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ assetId, version: 1 }]),
      $executeRawUnsafe: jest.fn().mockResolvedValue(1)
    };
    const db = { $transaction: (callback) => callback(tx) };
    await savePark(db, {
      municipalityId: 7,
      assetId,
      actorId,
      version: null,
      parkType: 'NATURE',
      maintenanceLevel: 'ENHANCED',
      amenities: ['TRAIL'],
      openingHours: {}
    });
    expect(tx.$executeRawUnsafe).toHaveBeenCalledWith(expect.stringContaining('PARK_PROFILE_SAVED'), expect.anything(), 7, assetId, actorId, expect.any(String), null);
  });
});