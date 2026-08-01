CREATE TABLE "Inspection" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "permitId" UUID,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "address" TEXT NOT NULL,
  "inspectionType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "outcome" TEXT,
  "notes" TEXT,
  "findings" TEXT,
  "createdBy" UUID NOT NULL,
  "completedBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Inspection_municipalityId_status_idx"
  ON "Inspection"("municipalityId", "status");

CREATE INDEX "Inspection_municipalityId_scheduledAt_idx"
  ON "Inspection"("municipalityId", "scheduledAt");

CREATE INDEX "Inspection_permitId_idx"
  ON "Inspection"("permitId");

ALTER TABLE "Inspection"
  ADD CONSTRAINT "Inspection_municipalityId_fkey"
  FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
