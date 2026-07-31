const prisma = require('../db/prisma');

async function getAlertSummary({ municipalityId, db = prisma }) {
  const rows = await db.$queryRaw`
    SELECT
      "status",
      "severity",
      COUNT(*)::integer AS "count",
      MIN("createdAt") AS "oldestCreatedAt"
    FROM "OperationalAlert"
    WHERE "municipalityId" = ${municipalityId}
    GROUP BY "status", "severity"
  `;

  return rows;
}

async function listOperationalAlerts({ municipalityId, status = 'OPEN', limit = 100, db = prisma }) {
  return db.$queryRaw`
    SELECT
      alert."id",
      alert."outboxEventId",
      alert."type",
      alert."severity",
      alert."status",
      alert."message",
      alert."details",
      alert."createdAt",
      alert."acknowledgedAt",
      alert."acknowledgedBy",
      outbox."aggregateId",
      outbox."eventType",
      outbox."attempts",
      outbox."lastError"
    FROM "OperationalAlert" AS alert
    INNER JOIN "OutboxEvent" AS outbox ON outbox."id" = alert."outboxEventId"
    WHERE alert."municipalityId" = ${municipalityId}
      AND alert."status" = ${status}
    ORDER BY alert."createdAt" DESC
    LIMIT ${limit}
  `;
}

async function acknowledgeOperationalAlert({ id, municipalityId, actorId, db = prisma }) {
  const rows = await db.$queryRaw`
    UPDATE "OperationalAlert"
    SET
      "status" = 'ACKNOWLEDGED',
      "acknowledgedAt" = NOW(),
      "acknowledgedBy" = ${actorId}::uuid
    WHERE "id" = ${id}::uuid
      AND "municipalityId" = ${municipalityId}
      AND "status" = 'OPEN'
    RETURNING "id", "status", "acknowledgedAt"
  `;

  return rows[0] || null;
}

module.exports = {
  getAlertSummary,
  listOperationalAlerts,
  acknowledgeOperationalAlert
};
