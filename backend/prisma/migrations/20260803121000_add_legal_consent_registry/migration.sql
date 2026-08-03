CREATE TABLE "LegalConsent" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "municipalityId" INTEGER,
  "consentType" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "documentVersion" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "requestId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LegalConsent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LegalConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "LegalConsent_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "LegalConsent_status_check" CHECK ("status" IN ('ACCEPTED', 'REVOKED')),
  CONSTRAINT "LegalConsent_timestamps_check" CHECK (
    ("status" = 'ACCEPTED' AND "acceptedAt" IS NOT NULL AND "revokedAt" IS NULL)
    OR ("status" = 'REVOKED' AND "revokedAt" IS NOT NULL)
  )
);

CREATE INDEX "LegalConsent_userId_consentType_createdAt_idx"
  ON "LegalConsent"("userId", "consentType", "createdAt");
CREATE INDEX "LegalConsent_municipalityId_consentType_createdAt_idx"
  ON "LegalConsent"("municipalityId", "consentType", "createdAt");
CREATE INDEX "LegalConsent_documentId_documentVersion_idx"
  ON "LegalConsent"("documentId", "documentVersion");

CREATE OR REPLACE FUNCTION prevent_legal_consent_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'LegalConsent is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "LegalConsent_prevent_update"
BEFORE UPDATE ON "LegalConsent"
FOR EACH ROW EXECUTE FUNCTION prevent_legal_consent_mutation();

CREATE TRIGGER "LegalConsent_prevent_delete"
BEFORE DELETE ON "LegalConsent"
FOR EACH ROW EXECUTE FUNCTION prevent_legal_consent_mutation();
