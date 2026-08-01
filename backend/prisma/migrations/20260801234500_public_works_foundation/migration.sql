CREATE TABLE "PublicWorksTeam" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "supervisorId" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "name")
);

CREATE TABLE "PublicWorksVehicle" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "unitNumber" TEXT NOT NULL,
  "vehicleType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "odometerKm" NUMERIC(12,2),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "unitNumber")
);

CREATE TABLE "WorkOrder" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'OTHER',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "location" JSONB,
  "citizenRequestId" UUID,
  "roadEventId" UUID,
  "permitId" UUID,
  "assignedTeamId" UUID REFERENCES "PublicWorksTeam"("id") ON DELETE SET NULL,
  "assignedVehicleId" UUID REFERENCES "PublicWorksVehicle"("id") ON DELETE SET NULL,
  "plannedStartAt" TIMESTAMPTZ,
  "plannedEndAt" TIMESTAMPTZ,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "closedAt" TIMESTAMPTZ,
  "createdBy" UUID NOT NULL,
  "closedBy" UUID,
  "resolution" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "number")
);

CREATE TABLE "WorkOrderEvent" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "workOrderId" UUID NOT NULL REFERENCES "WorkOrder"("id") ON DELETE CASCADE,
  "actorId" UUID,
  "eventType" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkOrderEvidence" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "workOrderId" UUID NOT NULL REFERENCES "WorkOrder"("id") ON DELETE CASCADE,
  "evidenceType" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "description" TEXT,
  "capturedAt" TIMESTAMPTZ NOT NULL,
  "uploadedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("municipalityId", "storageKey")
);

CREATE TABLE "WorkOrderMaterial" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id") ON DELETE CASCADE,
  "workOrderId" UUID NOT NULL REFERENCES "WorkOrder"("id") ON DELETE CASCADE,
  "itemCode" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" NUMERIC(12,3) NOT NULL,
  "unit" TEXT NOT NULL,
  "unitCost" NUMERIC(12,2),
  "recordedBy" UUID NOT NULL,
  "recordedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "WorkOrder_municipality_status_idx" ON "WorkOrder"("municipalityId", "status", "updatedAt");
CREATE INDEX "WorkOrder_municipality_team_idx" ON "WorkOrder"("municipalityId", "assignedTeamId", "status");
CREATE INDEX "WorkOrder_sources_idx" ON "WorkOrder"("citizenRequestId", "roadEventId", "permitId");
CREATE INDEX "WorkOrderEvent_order_created_idx" ON "WorkOrderEvent"("municipalityId", "workOrderId", "createdAt");
CREATE INDEX "WorkOrderEvidence_order_created_idx" ON "WorkOrderEvidence"("municipalityId", "workOrderId", "createdAt");
CREATE INDEX "WorkOrderMaterial_order_idx" ON "WorkOrderMaterial"("municipalityId", "workOrderId");