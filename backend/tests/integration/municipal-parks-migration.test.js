const fs = require('fs');
const path = require('path');

const migration = fs.readFileSync(path.join(__dirname, '../../prisma/migrations/20260802015000_municipal_parks/migration.sql'), 'utf8');

describe('municipal parks migration', () => {
  it('crée une spécialisation isolée par municipalité', () => {
    expect(migration).toContain('CREATE TABLE "MunicipalPark"');
    expect(migration).toContain('"municipalityId" INTEGER NOT NULL');
    expect(migration).toContain('UNIQUE ("municipalityId", "assetId")');
  });

  it('contraint les types, niveaux et superficies', () => {
    expect(migration).toContain("'NEIGHBORHOOD','REGIONAL','RIVERFRONT','SPORTS','NATURE','PLAZA','OTHER'");
    expect(migration).toContain("'MINIMAL','STANDARD','ENHANCED','INTENSIVE'");
    expect(migration).toContain('"areaSquareMeters" >= 0');
  });
});