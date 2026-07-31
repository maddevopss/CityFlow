CREATE TABLE "EventAudit" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "municipalityId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "actorId" UUID,
  "actorRole" TEXT,
  "previousStatus" TEXT,
  "newStatus" TEXT,
  "reason" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventAudit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EventAudit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "RoadEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "EventAudit_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "EventAudit_eventId_occurredAt_idx" ON "EventAudit"("eventId", "occurredAt");
CREATE INDEX "EventAudit_municipalityId_occurredAt_idx" ON "EventAudit"("municipalityId", "occurredAt");

CREATE OR REPLACE FUNCTION prevent_event_audit_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'EventAudit is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EventAudit_prevent_update"
BEFORE UPDATE ON "EventAudit"
FOR EACH ROW EXECUTE FUNCTION prevent_event_audit_mutation();

CREATE TRIGGER "EventAudit_prevent_delete"
BEFORE DELETE ON "EventAudit"
FOR EACH ROW EXECUTE FUNCTION prevent_event_audit_mutation();
