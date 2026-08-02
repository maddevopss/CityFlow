CREATE TABLE "MunicipalAsset" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "assetNumber" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "assetType" TEXT NOT NULL,
  "assetSubtype" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "condition" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "ownershipType" TEXT NOT NULL DEFAULT 'OWNED',
  "department" TEXT,
  "address" TEXT,
  "location" JSONB,
  "acquisitionDate" DATE,
  "acquisitionCost" NUMERIC(16,2),
  "commissionedAt" DATE,
  "usefulLifeYears" INTEGER,
  "residualValue" NUMERIC(16,2),
  "currency" TEXT NOT NULL DEFAULT 'CAD',
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdBy" UUID NOT NULL,
  "updatedBy" UUID,
  "retiredAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "assetNumber"),
  CHECK ("assetType" IN ('BUILDING','PARK','NETWORK','EQUIPMENT','VEHICLE','OTHER')),
  CHECK ("status" IN ('DRAFT','ACTIVE','INACTIVE','UNDER_MAINTENANCE','RETIRED','DISPOSED')),
  CHECK ("condition" IN ('UNKNOWN','EXCELLENT','GOOD','FAIR','POOR','CRITICAL')),
  CHECK ("ownershipType" IN ('OWNED','LEASED','SHARED','OTHER')),
  CHECK ("acquisitionCost" IS NULL OR "acquisitionCost" >= 0),
  CHECK ("residualValue" IS NULL OR "residualValue" >= 0),
  CHECK ("usefulLifeYears" IS NULL OR "usefulLifeYears" > 0),
  CHECK ("version" > 0)
);

CREATE TABLE "MunicipalAssetEvent" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "assetId" UUID NOT NULL REFERENCES "MunicipalAsset"("id") ON DELETE CASCADE,
  "actorId" UUID,
  "eventType" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "fromCondition" TEXT,
  "toCondition" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "idempotencyKey" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "idempotencyKey")
);

CREATE INDEX "MunicipalAsset_municipality_type_status_idx"
  ON "MunicipalAsset"("municipalityId", "assetType", "status", "updatedAt");
CREATE INDEX "MunicipalAsset_municipality_condition_idx"
  ON "MunicipalAsset"("municipalityId", "condition", "updatedAt");
CREATE INDEX "MunicipalAsset_municipality_department_idx"
  ON "MunicipalAsset"("municipalityId", "department", "status");
CREATE INDEX "MunicipalAsset_name_search_idx"
  ON "MunicipalAsset" USING GIN (to_tsvector('simple', COALESCE("assetNumber", '') || ' ' || COALESCE("name", '') || ' ' || COALESCE("address", '')));
CREATE INDEX "MunicipalAssetEvent_asset_created_idx"
  ON "MunicipalAssetEvent"("municipalityId", "assetId", "createdAt");
CREATE INDEX "MunicipalAssetEvent_type_created_idx"
  ON "MunicipalAssetEvent"("municipalityId", "eventType", "createdAt");
