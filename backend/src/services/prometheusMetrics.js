const prisma = require('../db/prisma');

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function getGlobalDiffusionMetrics({ db = prisma } = {}) {
  const rows = await db.$queryRaw`
    SELECT
      COUNT(*) FILTER (WHERE "status" = 'PENDING')::integer AS "pendingCount",
      COUNT(*) FILTER (WHERE "status" = 'PROCESSING')::integer AS "processingCount",
      COUNT(*) FILTER (WHERE "status" = 'PROCESSED')::integer AS "processedCount",
      COUNT(*) FILTER (WHERE "status" = 'DEAD')::integer AS "deadCount",
      COUNT(*) FILTER (
        WHERE "status" = 'PENDING'
          AND "createdAt" <= NOW() - INTERVAL '5 minutes'
      )::integer AS "warningCount",
      COUNT(*) FILTER (
        WHERE "status" = 'PENDING'
          AND "createdAt" <= NOW() - INTERVAL '15 minutes'
      )::integer AS "criticalCount",
      COUNT(*) FILTER (
        WHERE "status" = 'PROCESSING'
          AND "lockedAt" <= NOW() - INTERVAL '10 minutes'
      )::integer AS "stuckCount",
      EXTRACT(EPOCH FROM AVG("processedAt" - "createdAt")
        FILTER (WHERE "status" = 'PROCESSED' AND "processedAt" IS NOT NULL)
      )::double precision AS "averageDeliverySeconds",
      EXTRACT(EPOCH FROM percentile_cont(0.95) WITHIN GROUP (
        ORDER BY ("processedAt" - "createdAt")
      ) FILTER (WHERE "status" = 'PROCESSED' AND "processedAt" IS NOT NULL)
      )::double precision AS "p95DeliverySeconds"
    FROM "OutboxEvent"
    WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
  `;

  const alertRows = await db.$queryRaw`
    SELECT
      COUNT(*) FILTER (WHERE "status" = 'OPEN' AND "severity" = 'WARNING')::integer AS "openWarningAlerts",
      COUNT(*) FILTER (WHERE "status" = 'OPEN' AND "severity" = 'CRITICAL')::integer AS "openCriticalAlerts"
    FROM "OperationalAlert"
  `;

  const metrics = { ...(rows[0] || {}), ...(alertRows[0] || {}) };
  const health = numberOrZero(metrics.deadCount) > 0
    || numberOrZero(metrics.criticalCount) > 0
    || numberOrZero(metrics.stuckCount) > 0
    || numberOrZero(metrics.openCriticalAlerts) > 0
    ? 'critical'
    : numberOrZero(metrics.warningCount) > 0 || numberOrZero(metrics.openWarningAlerts) > 0
      ? 'warning'
      : 'healthy';

  return { windowHours: 24, health, metrics };
}

function metric(name, help, type, value) {
  return [`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`, `${name} ${numberOrZero(value)}`];
}

function renderPrometheusMetrics(snapshot) {
  const { metrics = {}, health = 'healthy', windowHours = 24 } = snapshot || {};
  const lines = [
    ...metric('cityflow_diffusion_window_hours', 'Fenêtre de mesure des indicateurs de diffusion.', 'gauge', windowHours),
    ...metric('cityflow_diffusion_pending_total', 'Diffusions en attente sur la fenêtre de mesure.', 'gauge', metrics.pendingCount),
    ...metric('cityflow_diffusion_processing_total', 'Diffusions en traitement sur la fenêtre de mesure.', 'gauge', metrics.processingCount),
    ...metric('cityflow_diffusion_processed_total', 'Diffusions traitées sur la fenêtre de mesure.', 'gauge', metrics.processedCount),
    ...metric('cityflow_diffusion_dead_total', 'Diffusions définitivement échouées sur la fenêtre de mesure.', 'gauge', metrics.deadCount),
    ...metric('cityflow_diffusion_delay_warning_total', 'Diffusions dépassant le seuil d’avertissement.', 'gauge', metrics.warningCount),
    ...metric('cityflow_diffusion_delay_critical_total', 'Diffusions dépassant le seuil critique.', 'gauge', metrics.criticalCount),
    ...metric('cityflow_diffusion_processing_stuck_total', 'Diffusions bloquées en traitement.', 'gauge', metrics.stuckCount),
    ...metric('cityflow_diffusion_delivery_seconds_average', 'Délai moyen de livraison en secondes.', 'gauge', metrics.averageDeliverySeconds),
    ...metric('cityflow_diffusion_delivery_seconds_p95', '95e percentile du délai de livraison en secondes.', 'gauge', metrics.p95DeliverySeconds),
    ...metric('cityflow_operational_alerts_open_warning_total', 'Alertes opérationnelles ouvertes de niveau avertissement.', 'gauge', metrics.openWarningAlerts),
    ...metric('cityflow_operational_alerts_open_critical_total', 'Alertes opérationnelles ouvertes de niveau critique.', 'gauge', metrics.openCriticalAlerts),
    '# HELP cityflow_diffusion_health État global de la diffusion, une seule valeur vaut 1.',
    '# TYPE cityflow_diffusion_health gauge',
    `cityflow_diffusion_health{state="healthy"} ${health === 'healthy' ? 1 : 0}`,
    `cityflow_diffusion_health{state="warning"} ${health === 'warning' ? 1 : 0}`,
    `cityflow_diffusion_health{state="critical"} ${health === 'critical' ? 1 : 0}`
  ];

  return `${lines.join('\n')}\n`;
}

module.exports = {
  getGlobalDiffusionMetrics,
  renderPrometheusMetrics
};
