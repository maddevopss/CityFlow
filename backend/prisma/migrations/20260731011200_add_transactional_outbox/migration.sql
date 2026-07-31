CREATE TABLE "OutboxEvent" (
  "id" UUID NOT NULL,
  "aggregateId" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "processedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OutboxEvent_aggregateId_fkey"
    FOREIGN KEY ("aggregateId") REFERENCES "RoadEvent"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OutboxEvent_municipalityId_fkey"
    FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OutboxEvent_dedupeKey_key" ON "OutboxEvent"("dedupeKey");
CREATE INDEX "OutboxEvent_pending_idx"
  ON "OutboxEvent"("status", "availableAt", "createdAt");
CREATE INDEX "OutboxEvent_aggregate_idx"
  ON "OutboxEvent"("aggregateId", "createdAt");

ALTER TABLE "OutboxEvent"
  ADD CONSTRAINT "OutboxEvent_status_check"
  CHECK ("status" IN ('PENDING', 'PROCESSING', 'PROCESSED'));
