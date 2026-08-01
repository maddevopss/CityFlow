ALTER TABLE "PermitFee"
  ADD COLUMN "waivedReason" TEXT,
  ADD COLUMN "waivedBy" UUID,
  ADD COLUMN "waivedAt" TIMESTAMPTZ;

CREATE INDEX "PermitFee_status_idx" ON "PermitFee" ("municipalityId", "status");
