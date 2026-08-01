-- Indexes aligned with the paginated inspection listing filters.
CREATE INDEX "Inspection_municipalityId_status_scheduledAt_id_idx"
ON "Inspection"("municipalityId", "status", "scheduledAt", "id");

CREATE INDEX "Inspection_municipalityId_inspectionType_scheduledAt_id_idx"
ON "Inspection"("municipalityId", "inspectionType", "scheduledAt", "id");

CREATE INDEX "Inspection_municipalityId_assignedTo_status_scheduledAt_idx"
ON "Inspection"("municipalityId", "assignedTo", "status", "scheduledAt");

-- PostgreSQL trigram indexes accelerate case-insensitive partial search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Inspection_address_trgm_idx"
ON "Inspection" USING GIN ("address" gin_trgm_ops);

CREATE INDEX "Inspection_notes_trgm_idx"
ON "Inspection" USING GIN ("notes" gin_trgm_ops);

CREATE INDEX "Inspection_findings_trgm_idx"
ON "Inspection" USING GIN ("findings" gin_trgm_ops);
