-- Garantit qu'un même permis externe ne peut produire qu'un seul événement par municipalité.
CREATE UNIQUE INDEX "RoadEvent_municipalityId_sourceType_sourceRef_key"
ON "RoadEvent"("municipalityId", "sourceType", "sourceRef")
WHERE "sourceRef" IS NOT NULL;
