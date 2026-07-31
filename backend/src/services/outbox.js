const { v4: uuidv4 } = require('uuid');
const prisma = require('../db/prisma');

async function appendOutboxEvent({
  aggregateId,
  municipalityId,
  eventType,
  payload,
  dedupeKey,
  db = prisma
}) {
  const id = uuidv4();

  await db.$executeRaw`
    INSERT INTO "OutboxEvent" (
      "id", "aggregateId", "municipalityId", "eventType", "payload", "dedupeKey"
    ) VALUES (
      ${id}::uuid,
      ${aggregateId}::uuid,
      ${municipalityId},
      ${eventType},
      ${JSON.stringify(payload)}::jsonb,
      ${dedupeKey}
    )
    ON CONFLICT ("dedupeKey") DO NOTHING
  `;

  return id;
}

async function claimOutboxBatch({ limit = 25, db = prisma } = {}) {
  return db.$queryRaw`
    WITH candidates AS (
      SELECT "id"
      FROM "OutboxEvent"
      WHERE (
        "status" = 'PENDING'
        OR ("status" = 'PROCESSING' AND "lockedAt" < NOW() - INTERVAL '5 minutes')
      )
        AND "availableAt" <= NOW()
      ORDER BY "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    UPDATE "OutboxEvent" AS outbox
    SET
      "status" = 'PROCESSING',
      "lockedAt" = NOW(),
      "attempts" = outbox."attempts" + 1
    FROM candidates
    WHERE outbox."id" = candidates."id"
    RETURNING outbox.*
  `;
}

async function markOutboxProcessed(id, db = prisma) {
  await db.$executeRaw`
    UPDATE "OutboxEvent"
    SET
      "status" = 'PROCESSED',
      "processedAt" = NOW(),
      "lockedAt" = NULL,
      "lastError" = NULL
    WHERE "id" = ${id}::uuid
  `;
}

async function markOutboxFailed(id, error, db = prisma) {
  const message = String(error && error.message ? error.message : error).slice(0, 4000);

  await db.$executeRaw`
    UPDATE "OutboxEvent"
    SET
      "status" = 'PENDING',
      "availableAt" = NOW() + LEAST(
        INTERVAL '15 minutes',
        INTERVAL '5 seconds' * POWER(2, LEAST("attempts", 8))
      ),
      "lockedAt" = NULL,
      "lastError" = ${message}
    WHERE "id" = ${id}::uuid
  `;
}

module.exports = {
  appendOutboxEvent,
  claimOutboxBatch,
  markOutboxProcessed,
  markOutboxFailed
};
