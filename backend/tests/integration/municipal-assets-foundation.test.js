const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '../../prisma/migrations/20260802013000_municipal_assets_foundation/migration.sql'
);

const migration = fs.readFileSync(migrationPath, 'utf8');

describe('municipal assets foundation migration', () => {
  it('crée le registre et son historique append-only', () => {
    expect(migration).toContain('CREATE TABLE "MunicipalAsset"');
    expect(migration).toContain('CREATE TABLE "MunicipalAssetEvent"');
    expect(migration).toContain('"municipalityId" INTEGER NOT NULL');
    expect(migration).toContain('UNIQUE ("municipalityId", "assetNumber")');
    expect(migration).toContain('UNIQUE ("municipalityId", "idempotencyKey")');
  });

  it('contraint les types, états, conditions et valeurs financières', () => {
    expect(migration).toContain("'BUILDING','PARK','NETWORK','EQUIPMENT','VEHICLE','OTHER'");
    expect(migration).toContain("'DRAFT','ACTIVE','INACTIVE','UNDER_MAINTENANCE','RETIRED','DISPOSED'");
    expect(migration).toContain("'UNKNOWN','EXCELLENT','GOOD','FAIR','POOR','CRITICAL'");
    expect(migration).toContain('"acquisitionCost" >= 0');
    expect(migration).toContain('"residualValue" >= 0');
    expect(migration).toContain('"usefulLifeYears" > 0');
  });

  it('ajoute les index d isolation, de recherche et d audit', () => {
    expect(migration).toContain('MunicipalAsset_municipality_type_status_idx');
    expect(migration).toContain('MunicipalAsset_municipality_condition_idx');
    expect(migration).toContain('MunicipalAsset_name_search_idx');
    expect(migration).toContain('MunicipalAssetEvent_asset_created_idx');
    expect(migration).toContain('MunicipalAssetEvent_type_created_idx');
  });

  it('ne crée aucune route ou permission implicite dans la migration', () => {
    expect(migration).not.toContain('CREATE ROLE');
    expect(migration).not.toContain('GRANT ');
    expect(migration).not.toContain('CREATE POLICY');
  });
});
