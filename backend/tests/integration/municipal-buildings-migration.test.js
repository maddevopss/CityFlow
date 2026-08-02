const fs = require('fs');
const path = require('path');

const migration = fs.readFileSync(path.join(
  __dirname,
  '../../prisma/migrations/20260802014600_municipal_buildings/migration.sql'
), 'utf8');

test('crée une seule spécialisation bâtiment isolée par municipalité', () => {
  expect(migration).toContain('CREATE TABLE "MunicipalBuilding"');
  expect(migration).toContain('"municipalityId" INTEGER NOT NULL');
  expect(migration).toContain('UNIQUE ("municipalityId", "assetId")');
  expect((migration.match(/CREATE TABLE/g) || [])).toHaveLength(1);
});

test('contraint les données de bâtiment sensibles', () => {
  expect(migration).toContain('"floorCount" > 0');
  expect(migration).toContain('"grossAreaM2" > 0');
  expect(migration).toContain("'COMPLIANT','ACTION_REQUIRED','NON_COMPLIANT'");
  expect(migration).toContain('MunicipalBuilding_municipality_safety_idx');
});
