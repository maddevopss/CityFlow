ALTER TABLE "RoadEvent"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT',
  ADD COLUMN "statusReason" TEXT,
  ADD COLUMN "submittedBy" UUID,
  ADD COLUMN "approvedBy" UUID,
  ADD COLUMN "publishedBy" UUID,
  ADD COLUMN "closedBy" UUID,
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "closedAt" TIMESTAMP(3);
