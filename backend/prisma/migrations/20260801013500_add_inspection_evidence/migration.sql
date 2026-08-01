CREATE TABLE "InspectionEvidence" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "inspectionId" UUID NOT NULL,
  "evidenceType" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "description" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL,
  "uploadedBy" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InspectionEvidence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InspectionEvidence_municipalityId_storageKey_key"
  ON "InspectionEvidence"("municipalityId", "storageKey");
CREATE INDEX "InspectionEvidence_municipalityId_inspectionId_idx"
  ON "InspectionEvidence"("municipalityId", "inspectionId");
CREATE INDEX "InspectionEvidence_inspectionId_capturedAt_idx"
  ON "InspectionEvidence"("inspectionId", "capturedAt");
CREATE INDEX "InspectionEvidence_sha256_idx"
  ON "InspectionEvidence"("sha256");

ALTER TABLE "InspectionEvidence"
  ADD CONSTRAINT "InspectionEvidence_municipalityId_fkey"
  FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionEvidence"
  ADD CONSTRAINT "InspectionEvidence_inspectionId_fkey"
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
