CREATE TABLE "MunicipalBuilding" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "assetId" UUID NOT NULL REFERENCES "MunicipalAsset"("id") ON DELETE CASCADE,
  "buildingUse" TEXT NOT NULL,
  "constructionYear" INTEGER,
  "floorCount" INTEGER,
  "grossAreaM2" NUMERIC(14,2),
  "occupancyCapacity" INTEGER,
  "heritageStatus" TEXT NOT NULL DEFAULT 'NONE',
  "accessibilityStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "fireSafetyStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "energyRating" TEXT,
  "lastRenovationYear" INTEGER,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdBy" UUID NOT NULL,
  "updatedBy" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "assetId"),
  CHECK ("constructionYear" IS NULL OR "constructionYear" BETWEEN 1600 AND 2200),
  CHECK ("lastRenovationYear" IS NULL OR "lastRenovationYear" BETWEEN 1600 AND 2200),
  CHECK ("floorCount" IS NULL OR "floorCount" > 0),
  CHECK ("grossAreaM2" IS NULL OR "grossAreaM2" > 0),
  CHECK ("occupancyCapacity" IS NULL OR "occupancyCapacity" >= 0),
  CHECK ("heritageStatus" IN ('NONE','LISTED','PROTECTED','PENDING')),
  CHECK ("accessibilityStatus" IN ('UNKNOWN','COMPLIANT','PARTIAL','NON_COMPLIANT')),
  CHECK ("fireSafetyStatus" IN ('UNKNOWN','COMPLIANT','ACTION_REQUIRED','NON_COMPLIANT')),
  CHECK ("version" > 0)
);

CREATE INDEX "MunicipalBuilding_municipality_use_idx"
  ON "MunicipalBuilding"("municipalityId", "buildingUse", "updatedAt");
CREATE INDEX "MunicipalBuilding_municipality_safety_idx"
  ON "MunicipalBuilding"("municipalityId", "fireSafetyStatus", "accessibilityStatus");
