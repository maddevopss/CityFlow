CREATE TABLE "PermitApplication" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL REFERENCES "Municipality"("id"),
  "publicNumber" TEXT NOT NULL,
  "applicantName" TEXT NOT NULL,
  "applicantEmail" TEXT NOT NULL,
  "permitType" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "assignedReviewerId" UUID,
  "submittedAt" TIMESTAMPTZ,
  "decidedAt" TIMESTAMPTZ,
  "issuedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  "createdBy" UUID NOT NULL,
  "updatedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PermitApplication_municipality_publicNumber_key" UNIQUE ("municipalityId", "publicNumber")
);
CREATE INDEX "PermitApplication_municipality_status_created_idx" ON "PermitApplication"("municipalityId", "status", "createdAt");
CREATE INDEX "PermitApplication_municipality_reviewer_status_idx" ON "PermitApplication"("municipalityId", "assignedReviewerId", "status");

CREATE TABLE "PermitDocument" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "applicationId" UUID NOT NULL REFERENCES "PermitApplication"("id") ON DELETE CASCADE,
  "documentType" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "uploadedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PermitDocument_municipality_storage_key" UNIQUE ("municipalityId", "storageKey")
);
CREATE INDEX "PermitDocument_municipality_application_idx" ON "PermitDocument"("municipalityId", "applicationId");

CREATE TABLE "PermitDecision" (
  "id" UUID PRIMARY KEY,
  "municipalityId" INTEGER NOT NULL,
  "applicationId" UUID NOT NULL REFERENCES "PermitApplication"("id") ON DELETE CASCADE,
  "decision" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "conditions" JSONB NOT NULL DEFAULT '[]',
  "decidedBy" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "PermitDecision_municipality_application_created_idx" ON "PermitDecision"("municipalityId", "applicationId", "createdAt");
