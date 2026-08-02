const ASSET_TYPES = Object.freeze([
  'BUILDING',
  'PARK',
  'NETWORK',
  'EQUIPMENT',
  'VEHICLE',
  'OTHER'
]);

const ASSET_STATUSES = Object.freeze([
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'UNDER_MAINTENANCE',
  'RETIRED',
  'DISPOSED'
]);

const ASSET_CONDITIONS = Object.freeze([
  'UNKNOWN',
  'EXCELLENT',
  'GOOD',
  'FAIR',
  'POOR',
  'CRITICAL'
]);

const ASSET_OWNERSHIP_TYPES = Object.freeze([
  'OWNED',
  'LEASED',
  'SHARED',
  'OTHER'
]);

function normalizeAssetNumber(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function isSupportedAssetType(value) {
  return ASSET_TYPES.includes(value);
}

function isSupportedAssetStatus(value) {
  return ASSET_STATUSES.includes(value);
}

function isSupportedAssetCondition(value) {
  return ASSET_CONDITIONS.includes(value);
}

module.exports = {
  ASSET_TYPES,
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  ASSET_OWNERSHIP_TYPES,
  normalizeAssetNumber,
  isSupportedAssetType,
  isSupportedAssetStatus,
  isSupportedAssetCondition
};
