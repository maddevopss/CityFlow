CREATE TABLE "OperationalAlert" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "outboxEventId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'CRITICAL',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "message" TEXT NOT NULL,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledgedAt" TIMESTAMP(3),
  "acknowledgedBy" UUID,

  CONSTRAINT "OperationalAlert_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OperationalAlert_municipalityId_fkey"
    FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "OperationalAlert_outboxEventId_fkey"
    FOREIGN KEY ("outboxEventId") REFERENCES "OutboxEvent"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OperationalAlert_outbox_type_key"
  ON "OperationalAlert"("outboxEventId", "type");
CREATE INDEX "OperationalAlert_municipality_status_idx"
  ON "OperationalAlert"("municipalityId", "status", "createdAt");

ALTER TABLE "OperationalAlert"
  ADD CONSTRAINT "OperationalAlert_type_check"
  CHECK ("type" IN ('DIFFUSION_DEAD'));

ALTER TABLE "OperationalAlert"
  ADD CONSTRAINT "OperationalAlert_severity_check"
  CHECK ("severity" IN ('WARNING', 'CRITICAL'));

ALTER TABLE "OperationalAlert"
  ADD CONSTRAINT "OperationalAlert_status_check"
  CHECK ("status" IN ('OPEN', 'ACKNOWLEDGED'));
