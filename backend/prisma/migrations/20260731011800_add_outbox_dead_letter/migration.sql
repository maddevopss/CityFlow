ALTER TABLE "OutboxEvent"
  DROP CONSTRAINT "OutboxEvent_status_check";

ALTER TABLE "OutboxEvent"
  ADD CONSTRAINT "OutboxEvent_status_check"
  CHECK ("status" IN ('PENDING', 'PROCESSING', 'PROCESSED', 'DEAD'));

ALTER TABLE "OutboxEvent"
  ADD COLUMN "deadAt" TIMESTAMP(3),
  ADD COLUMN "resolvedAt" TIMESTAMP(3),
  ADD COLUMN "resolvedBy" UUID;

CREATE INDEX "OutboxEvent_dead_municipality_idx"
  ON "OutboxEvent"("municipalityId", "status", "deadAt");
