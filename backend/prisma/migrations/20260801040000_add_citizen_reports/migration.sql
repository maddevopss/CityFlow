CREATE TABLE "CitizenReport" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "publicNumber" TEXT NOT NULL,
  "trackingTokenHash" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "address" TEXT,
  "geometry" JSONB,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "reporterName" TEXT,
  "reporterEmail" TEXT,
  "reporterPhone" TEXT,
  "consentToContact" BOOLEAN NOT NULL DEFAULT FALSE,
  "assignedTeamId" UUID,
  "duplicateOfId" UUID,
  "workOrderId" UUID,
  "acknowledgedAt" TIMESTAMPTZ,
  "resolvedAt" TIMESTAMPTZ,
  "closedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CitizenReport_municipality_publicNumber_key" UNIQUE ("municipalityId", "publicNumber")
);
CREATE INDEX "CitizenReport_municipality_status_priority_idx" ON "CitizenReport"("municipalityId", "status", "priority");
CREATE INDEX "CitizenReport_municipality_category_created_idx" ON "CitizenReport"("municipalityId", "category", "createdAt");
CREATE INDEX "CitizenReport_work_order_idx" ON "CitizenReport"("workOrderId");
CREATE TABLE "CitizenReportMessage" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "reportId" UUID NOT NULL REFERENCES "CitizenReport"("id") ON DELETE CASCADE,
  "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
  "message" TEXT NOT NULL,
  "authorType" TEXT NOT NULL,
  "authorId" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "CitizenReportMessage_municipality_report_created_idx" ON "CitizenReportMessage"("municipalityId", "reportId", "createdAt");
