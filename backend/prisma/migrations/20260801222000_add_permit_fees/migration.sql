CREATE TABLE "PermitFee" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "municipalityId" INTEGER NOT NULL,
  "permitId" UUID NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'CAD',
  "status" VARCHAR(20) NOT NULL DEFAULT 'DUE',
  "note" TEXT,
  "assessedBy" UUID,
  "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paymentReference" VARCHAR(200),
  "paidBy" UUID,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PermitFee_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PermitFee_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PermitFee_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "RoadEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PermitFee_amount_positive" CHECK ("amountCents" >= 0),
  CONSTRAINT "PermitFee_status_valid" CHECK ("status" IN ('DUE', 'PAID', 'WAIVED'))
);

CREATE UNIQUE INDEX "PermitFee_municipalityId_permitId_key" ON "PermitFee"("municipalityId", "permitId");
CREATE UNIQUE INDEX "PermitFee_paymentReference_key" ON "PermitFee"("paymentReference") WHERE "paymentReference" IS NOT NULL;
CREATE INDEX "PermitFee_municipalityId_status_updatedAt_idx" ON "PermitFee"("municipalityId", "status", "updatedAt");
