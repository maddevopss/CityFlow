CREATE TABLE "Asset" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id"),
  "publicCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "criticality" TEXT NOT NULL DEFAULT 'MEDIUM',
  "description" TEXT,
  "address" TEXT,
  "geometry" JSONB,
  "parentId" UUID REFERENCES "Asset"("id"),
  "acquisitionDate" TIMESTAMPTZ,
  "replacementValue" NUMERIC(14,2),
  "warrantyExpiresAt" TIMESTAMPTZ,
  "createdBy" UUID NOT NULL,
  "updatedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Asset_municipality_publicCode_key" UNIQUE ("municipalityId", "publicCode")
);
CREATE INDEX "Asset_municipality_category_status_idx" ON "Asset"("municipalityId", "category", "status");
CREATE INDEX "Asset_municipality_criticality_status_idx" ON "Asset"("municipalityId", "criticality", "status");
CREATE TABLE "AssetConditionAssessment" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "assetId" UUID NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "condition" TEXT NOT NULL,
  "score" INTEGER NOT NULL CHECK ("score" BETWEEN 0 AND 100),
  "notes" TEXT,
  "assessedAt" TIMESTAMPTZ NOT NULL,
  "assessedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AssetConditionAssessment_municipality_asset_assessed_idx" ON "AssetConditionAssessment"("municipalityId", "assetId", "assessedAt");
