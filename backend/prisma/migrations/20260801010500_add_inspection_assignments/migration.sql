ALTER TABLE "Inspection"
ADD COLUMN "assignedTo" UUID,
ADD COLUMN "assignedAt" TIMESTAMP(3),
ADD COLUMN "assignedBy" UUID;

ALTER TABLE "Inspection"
ADD CONSTRAINT "Inspection_assignedTo_fkey"
FOREIGN KEY ("assignedTo") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Inspection_municipalityId_assignedTo_idx"
ON "Inspection"("municipalityId", "assignedTo");
