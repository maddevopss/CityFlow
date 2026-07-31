const { v4: uuidv4 } = require('uuid');
const prisma = require('../db/prisma');

const MAX_ATTEMPTS = 8;

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
        AND "attempts" < ${MAX_ATTEMPTS}
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
      "status" = CASE WHEN "attempts" >= ${MAX_ATTEMPTS} THEN 'DEAD' ELSE 'PENDING' END,
      "deadAt" = CASE WHEN "attempts" >= ${MAX_ATTEMPTS} THEN NOW() ELSE NULL END,
      "availableAt" = NOW() + LEAST(
        INTERVAL '15 minutes',
        INTERVAL '5 seconds' * POWER(2, LEAST("attempts", 8))
      ),
      "lockedAt" = NULL,
      "lastError" = ${message}
    WHERE "id" = ${id}::uuid
  `;
}

async function getOutboxSummary({ municipalityId, db = prisma }) {
  const rows = await db.$queryRaw`
    SELECT
      "status",
      COUNT(*)::integer AS "count",
      MIN("createdAt") AS "oldestCreatedAt"
    FROM "OutboxEvent"
    WHERE "municipalityId" = ${municipalityId}
    GROUP BY "status"
  `;

  return rows.reduce((summary, row) => {
    summary[row.status] = {
      count: row.count,
      oldestCreatedAt: row.oldestCreatedAt
    };
    return summary;
  }, {});
}

async function listDeadOutboxEvents({ municipalityId, limit = 100, db = prisma }) {
  return db.$queryRaw`
    SELECT
      "id", "aggregateId", "eventType", "payload", "attempts",
      "lastError", "createdAt", "deadAt"
    FROM "OutboxEvent"
    WHERE "municipalityId" = ${municipalityId}
      AND "status" = 'DEAD'
      AND "resolvedAt" IS NULL
    ORDER BY "deadAt" DESC
    LIMIT ${limit}
  `;
}

async function retryDeadOutboxEvent({ id, municipalityId, actorId, db = prisma }) {
  const rows = await db.$queryRaw`
    UPDATE "OutboxEvent"
    SET
      "status" = 'PENDING',
      "attempts" = 0,
      "availableAt" = NOW(),
      "deadAt" = NULL,
      "resolvedAt" = NOW(),
      "resolvedBy" = ${actorId}::uuid,
      "lastError" = NULL
    WHERE "id" = ${id}::uuid
      AND "municipalityId" = ${municipalityId}
      AND "status" = 'DEAD'
    RETURNING "id"
  `;

  return rows[0] || null;
}

module.exports = {
  MAX_ATTEMPTS,
  appendOutboxEvent,
  claimOutboxBatch,
  markOutboxProcessed,
  markOutboxFailed,
  getOutboxSummary,
  listDeadOutboxEvents,
  retryDeadOutboxEvent
};
