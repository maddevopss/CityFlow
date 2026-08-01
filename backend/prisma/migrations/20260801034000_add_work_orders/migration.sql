CREATE TABLE "WorkOrder" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "publicNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "workType" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "assetId" UUID,
  "citizenReportId" UUID,
  "assignedTeamId" UUID,
  "scheduledStart" TIMESTAMPTZ,
  "scheduledEnd" TIMESTAMPTZ,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "verifiedAt" TIMESTAMPTZ,
  "estimatedCost" NUMERIC(14,2),
  "actualCost" NUMERIC(14,2),
  "createdBy" UUID NOT NULL,
  "updatedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkOrder_municipality_publicNumber_key" UNIQUE ("municipalityId", "publicNumber")
);
CREATE INDEX "WorkOrder_municipality_status_priority_idx" ON "WorkOrder"("municipalityId", "status", "priority");
CREATE INDEX "WorkOrder_municipality_team_status_idx" ON "WorkOrder"("municipalityId", "assignedTeamId", "status");
CREATE INDEX "WorkOrder_asset_idx" ON "WorkOrder"("assetId");
CREATE INDEX "WorkOrder_citizen_report_idx" ON "WorkOrder"("citizenReportId");

CREATE TABLE "WorkLog" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "workOrderId" UUID NOT NULL REFERENCES "WorkOrder"("id") ON DELETE CASCADE,
  "logType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "hours" NUMERIC(8,2),
  "materialCost" NUMERIC(14,2),
  "equipmentCost" NUMERIC(14,2),
  "performedAt" TIMESTAMPTZ NOT NULL,
  "performedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "WorkLog_municipality_order_performed_idx" ON "WorkLog"("municipalityId", "workOrderId", "performedAt");
