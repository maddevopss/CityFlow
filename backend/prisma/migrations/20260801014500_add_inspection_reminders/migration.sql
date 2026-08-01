CREATE TABLE "InspectionReminder" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "municipalityId" INTEGER NOT NULL,
  "inspectionId" UUID NOT NULL,
  "recipientId" UUID NOT NULL,
  "reminderType" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "acknowledgedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InspectionReminder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InspectionReminder_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "InspectionReminder_unique_schedule" ON "InspectionReminder"("inspectionId", "recipientId", "reminderType", "scheduledFor");
CREATE INDEX "InspectionReminder_recipient_status_idx" ON "InspectionReminder"("municipalityId", "recipientId", "status");
CREATE INDEX "InspectionReminder_schedule_idx" ON "InspectionReminder"("scheduledFor", "status");
