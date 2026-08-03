CREATE TABLE "SecurityAudit" (
  "id" UUID NOT NULL,
  "municipalityId" INTEGER,
  "actorId" UUID,
  "action" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "requestId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityAudit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SecurityAudit_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SecurityAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "SecurityAudit_municipalityId_occurredAt_idx" ON "SecurityAudit"("municipalityId", "occurredAt");
CREATE INDEX "SecurityAudit_actorId_occurredAt_idx" ON "SecurityAudit"("actorId", "occurredAt");
CREATE INDEX "SecurityAudit_action_occurredAt_idx" ON "SecurityAudit"("action", "occurredAt");

CREATE OR REPLACE FUNCTION prevent_security_audit_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'SecurityAudit is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "SecurityAudit_prevent_update"
BEFORE UPDATE ON "SecurityAudit"
FOR EACH ROW EXECUTE FUNCTION prevent_security_audit_mutation();

CREATE TRIGGER "SecurityAudit_prevent_delete"
BEFORE DELETE ON "SecurityAudit"
FOR EACH ROW EXECUTE FUNCTION prevent_security_audit_mutation();
