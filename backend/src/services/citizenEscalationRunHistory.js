'use strict';

async function recordCitizenEscalationRun(db, run) {
  const completedAt = run.completedAt || new Date();
  const startedAt = run.startedAt || completedAt;
  const durationMs = Math.max(0, Number(run.durationMs ?? (completedAt - startedAt)) || 0);
  const rows = await db.$queryRawUnsafe(
    `INSERT INTO "citizen_escalation_runs"
      ("municipality_id", "source", "status", "scanned", "candidates", "notifications_created", "duration_ms", "error_message", "started_at", "completed_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING "id"`,
    run.municipalityId,
    run.source || 'SCHEDULED',
    run.status,
    run.scanned || 0,
    run.candidates || 0,
    run.created || 0,
    durationMs,
    run.errorMessage || null,
    startedAt,
    completedAt
  );
  return rows[0];
}

async function listCitizenEscalationRuns(db, municipalityId, limit = 25) {
  return db.$queryRawUnsafe(
    `SELECT
       "id",
       "source",
       "status",
       "scanned",
       "candidates",
       "notifications_created" AS "notificationsCreated",
       "duration_ms" AS "durationMs",
       "error_message" AS "errorMessage",
       "started_at" AS "startedAt",
       "completed_at" AS "completedAt"
     FROM "citizen_escalation_runs"
     WHERE "municipality_id" = $1
     ORDER BY "completed_at" DESC
     LIMIT $2`,
    municipalityId,
    limit
  );
}

async function purgeCitizenEscalationRuns(db, retentionDays = 90, now = new Date()) {
  const days = Math.max(1, Math.min(3650, Number(retentionDays) || 90));
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const rows = await db.$queryRawUnsafe(
    `WITH deleted AS (
       DELETE FROM "citizen_escalation_runs"
       WHERE "completed_at" < $1
       RETURNING 1
     )
     SELECT COUNT(*)::int AS "deleted" FROM deleted`,
    cutoff
  );
  return { deleted: rows[0]?.deleted || 0, cutoff, retentionDays: days };
}

module.exports = {
  recordCitizenEscalationRun,
  listCitizenEscalationRuns,
  purgeCitizenEscalationRuns
};
