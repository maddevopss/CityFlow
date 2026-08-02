const {
  ASSET_TYPES,
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  ASSET_OWNERSHIP_TYPES,
  normalizeAssetNumber,
  isSupportedAssetType,
  isSupportedAssetStatus,
  isSupportedAssetCondition
} = require('../../src/domain/municipalAssets');

describe('municipal assets domain contracts', () => {
  it('expose les catégories municipales prévues', () => {
    expect(ASSET_TYPES).toEqual([
      'BUILDING',
      'PARK',
      'NETWORK',
      'EQUIPMENT',
      'VEHICLE',
      'OTHER'
    ]);
    expect(ASSET_STATUSES).toContain('UNDER_MAINTENANCE');
    expect(ASSET_CONDITIONS).toContain('CRITICAL');
    expect(ASSET_OWNERSHIP_TYPES).toContain('LEASED');
  });

  it('normalise un numéro d actif sans caractères ambigus', () => {
    expect(normalizeAssetNumber('  parc / nord  001 ')).toBe('PARC-NORD-001');
    expect(normalizeAssetNumber('vehicule---12')).toBe('VEHICULE-12');
    expect(normalizeAssetNumber(null)).toBe('');
  });

  it('valide uniquement les valeurs supportées', () => {
    expect(isSupportedAssetType('BUILDING')).toBe(true);
    expect(isSupportedAssetType('UNKNOWN')).toBe(false);
    expect(isSupportedAssetStatus('ACTIVE')).toBe(true);
    expect(isSupportedAssetStatus('LOST')).toBe(false);
    expect(isSupportedAssetCondition('GOOD')).toBe(true);
    expect(isSupportedAssetCondition('BROKEN')).toBe(false);
  });

  it('protège les listes de référence contre les mutations', () => {
    expect(Object.isFrozen(ASSET_TYPES)).toBe(true);
    expect(() => ASSET_TYPES.push('ILLEGAL')).toThrow();
  });
});
