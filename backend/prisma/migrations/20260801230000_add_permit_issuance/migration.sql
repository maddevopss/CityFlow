CREATE TABLE "PermitIssuance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "municipalityId" INTEGER NOT NULL,
  "permitId" UUID NOT NULL,
  "issuanceNumber" TEXT NOT NULL,
  "issuedBy" UUID NOT NULL,
  "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PermitIssuance_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "RoadEvent"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "PermitIssuance_municipalityId_permitId_key"
  ON "PermitIssuance" ("municipalityId", "permitId");
CREATE UNIQUE INDEX "PermitIssuance_municipalityId_issuanceNumber_key"
  ON "PermitIssuance" ("municipalityId", "issuanceNumber");
CREATE INDEX "PermitIssuance_municipalityId_issuedAt_idx"
  ON "PermitIssuance" ("municipalityId", "issuedAt");
