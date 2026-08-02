CREATE TABLE "MunicipalPark" (
  "assetId" UUID PRIMARY KEY REFERENCES "MunicipalAsset"("id") ON DELETE CASCADE,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "parkType" TEXT NOT NULL,
  "areaSquareMeters" NUMERIC(14,2),
  "openingHours" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "amenities" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "accessible" BOOLEAN NOT NULL DEFAULT FALSE,
  "hasRestrooms" BOOLEAN NOT NULL DEFAULT FALSE,
  "hasParking" BOOLEAN NOT NULL DEFAULT FALSE,
  "hasLighting" BOOLEAN NOT NULL DEFAULT FALSE,
  "maintenanceLevel" TEXT NOT NULL DEFAULT 'STANDARD',
  "responsibleDepartment" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdBy" UUID NOT NULL,
  "updatedBy" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "assetId"),
  CHECK ("parkType" IN ('NEIGHBORHOOD','REGIONAL','RIVERFRONT','SPORTS','NATURE','PLAZA','OTHER')),
  CHECK ("maintenanceLevel" IN ('MINIMAL','STANDARD','ENHANCED','INTENSIVE')),
  CHECK ("areaSquareMeters" IS NULL OR "areaSquareMeters" >= 0),
  CHECK ("version" > 0)
);

CREATE INDEX "MunicipalPark_municipality_type_idx"
  ON "MunicipalPark"("municipalityId", "parkType", "maintenanceLevel");
CREATE INDEX "MunicipalPark_municipality_accessible_idx"
  ON "MunicipalPark"("municipalityId", "accessible", "updatedAt");