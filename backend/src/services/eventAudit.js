const { v4: uuidv4 } = require('uuid');
const prisma = require('../db/prisma');

async function appendEventAudit({
  eventId,
  municipalityId,
  action,
  actorId = null,
  actorRole = null,
  previousStatus = null,
  newStatus = null,
  reason = null,
  metadata = {}
}) {
  const id = uuidv4();

  await prisma.$executeRaw`
    INSERT INTO "EventAudit" (
      "id", "eventId", "municipalityId", "action", "actorId", "actorRole",
      "previousStatus", "newStatus", "reason", "metadata"
    ) VALUES (
      ${id}::uuid,
      ${eventId}::uuid,
      ${municipalityId},
      ${action},
      ${actorId}::uuid,
      ${actorRole},
      ${previousStatus},
      ${newStatus},
      ${reason},
      ${JSON.stringify(metadata)}::jsonb
    )
  `;

  return id;
}

async function listEventAudit({ eventId, municipalityId }) {
  return prisma.$queryRaw`
    SELECT
      "id", "eventId", "municipalityId", "action", "actorId", "actorRole",
      "previousStatus", "newStatus", "reason", "metadata", "occurredAt"
    FROM "EventAudit"
    WHERE "eventId" = ${eventId}::uuid
      AND "municipalityId" = ${municipalityId}
    ORDER BY "occurredAt" ASC, "id" ASC
  `;
}

module.exports = { appendEventAudit, listEventAudit };
