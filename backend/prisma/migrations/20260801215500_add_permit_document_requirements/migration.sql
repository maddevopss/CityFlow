CREATE TABLE "PermitDocumentRequirement" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "permitSubtype" TEXT NOT NULL,
  "requiredDocumentTypes" JSONB NOT NULL DEFAULT '[]',
  "updatedBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PermitDocumentRequirement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PermitDocumentRequirement_municipalityId_permitSubtype_key"
  ON "PermitDocumentRequirement"("municipalityId", "permitSubtype");

CREATE INDEX "PermitDocumentRequirement_municipalityId_updatedAt_idx"
  ON "PermitDocumentRequirement"("municipalityId", "updatedAt");

ALTER TABLE "PermitDocumentRequirement"
  ADD CONSTRAINT "PermitDocumentRequirement_municipalityId_fkey"
  FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
