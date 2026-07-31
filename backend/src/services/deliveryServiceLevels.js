const prisma = require('../db/prisma');

const DELIVERY_SLA = Object.freeze({
  warningMinutes: 5,
  criticalMinutes: 15,
  processingStuckMinutes: 10
});

async function getDeliveryServiceLevels({ municipalityId, db = prisma }) {
  const rows = await db.$queryRaw`
    SELECT
      COUNT(*) FILTER (WHERE "status" = 'PROCESSED')::integer AS "processedCount",
      COUNT(*) FILTER (WHERE "status" = 'DEAD')::integer AS "deadCount",
      COUNT(*) FILTER (
        WHERE "status" = 'PENDING'
          AND "createdAt" <= NOW() - (${DELIVERY_SLA.warningMinutes} * INTERVAL '1 minute')
      )::integer AS "warningCount",
      COUNT(*) FILTER (
        WHERE "status" = 'PENDING'
          AND "createdAt" <= NOW() - (${DELIVERY_SLA.criticalMinutes} * INTERVAL '1 minute')
      )::integer AS "criticalCount",
      COUNT(*) FILTER (
        WHERE "status" = 'PROCESSING'
          AND "lockedAt" <= NOW() - (${DELIVERY_SLA.processingStuckMinutes} * INTERVAL '1 minute')
      )::integer AS "stuckCount",
      EXTRACT(EPOCH FROM (
        percentile_cont(0.95) WITHIN GROUP (
          ORDER BY ("processedAt" - "createdAt")
        ) FILTER (WHERE "status" = 'PROCESSED' AND "processedAt" IS NOT NULL)
      ))::double precision AS "p95DeliverySeconds",
      EXTRACT(EPOCH FROM (
        AVG("processedAt" - "createdAt")
        FILTER (WHERE "status" = 'PROCESSED' AND "processedAt" IS NOT NULL)
      ))::double precision AS "averageDeliverySeconds"
    FROM "OutboxEvent"
    WHERE "municipalityId" = ${municipalityId}
      AND "createdAt" >= NOW() - INTERVAL '24 hours'
  `;

  const metrics = rows[0] || {};
  const health = metrics.deadCount > 0 || metrics.criticalCount > 0 || metrics.stuckCount > 0
    ? 'CRITICAL'
    : metrics.warningCount > 0
      ? 'WARNING'
      : 'HEALTHY';

  return {
    windowHours: 24,
    thresholds: DELIVERY_SLA,
    health,
    metrics
  };
}

async function createDeliverySlaAlerts({ municipalityId = null, db = prisma } = {}) {
  return db.$executeRaw`
    WITH breaches AS (
      SELECT
        outbox."id" AS "outboxEventId",
        outbox."municipalityId",
        CASE
          WHEN outbox."status" = 'PROCESSING' THEN 'DIFFUSION_PROCESSING_STUCK'
          WHEN outbox."createdAt" <= NOW() - (${DELIVERY_SLA.criticalMinutes} * INTERVAL '1 minute')
            THEN 'DIFFUSION_DELAY_CRITICAL'
          ELSE 'DIFFUSION_DELAY_WARNING'
        END AS "type",
        CASE
          WHEN outbox."status" = 'PROCESSING'
            OR outbox."createdAt" <= NOW() - (${DELIVERY_SLA.criticalMinutes} * INTERVAL '1 minute')
            THEN 'CRITICAL'
          ELSE 'WARNING'
        END AS "severity",
        outbox."status" AS "outboxStatus",
        outbox."createdAt",
        outbox."lockedAt",
        outbox."attempts"
      FROM "OutboxEvent" outbox
      WHERE outbox."status" IN ('PENDING', 'PROCESSING')
        AND (${municipalityId}::integer IS NULL OR outbox."municipalityId" = ${municipalityId})
        AND (
          (outbox."status" = 'PENDING'
            AND outbox."createdAt" <= NOW() - (${DELIVERY_SLA.warningMinutes} * INTERVAL '1 minute'))
          OR
          (outbox."status" = 'PROCESSING'
            AND outbox."lockedAt" <= NOW() - (${DELIVERY_SLA.processingStuckMinutes} * INTERVAL '1 minute'))
        )
    )
    INSERT INTO "OperationalAlert" (
      "id", "municipalityId", "outboxEventId", "type", "severity", "message", "details"
    )
    SELECT
      md5(breach."outboxEventId"::text || ':' || breach."type")::uuid,
      breach."municipalityId",
      breach."outboxEventId",
      breach."type",
      breach."severity",
      CASE breach."type"
        WHEN 'DIFFUSION_PROCESSING_STUCK' THEN 'Une diffusion semble bloquée en traitement.'
        WHEN 'DIFFUSION_DELAY_CRITICAL' THEN 'Une diffusion dépasse le délai critique de publication.'
        ELSE 'Une diffusion approche du délai critique de publication.'
      END,
      jsonb_build_object(
        'outboxStatus', breach."outboxStatus",
        'createdAt', breach."createdAt",
        'lockedAt', breach."lockedAt",
        'attempts', breach."attempts",
        'thresholds', jsonb_build_object(
          'warningMinutes', ${DELIVERY_SLA.warningMinutes},
          'criticalMinutes', ${DELIVERY_SLA.criticalMinutes},
          'processingStuckMinutes', ${DELIVERY_SLA.processingStuckMinutes}
        )
      )
    FROM breaches breach
    ON CONFLICT ("outboxEventId", "type") DO NOTHING
  `;
}

module.exports = {
  DELIVERY_SLA,
  getDeliveryServiceLevels,
  createDeliverySlaAlerts
};
