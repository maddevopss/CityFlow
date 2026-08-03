const { randomUUID } = require('crypto');
const logger = require('../../logger');

const counters = new Map();

function metricKey(method, route, statusCode) {
  return `${method}|${route}|${statusCode}`;
}

function recordRequest({ method, route, statusCode, durationMs }) {
  const key = metricKey(method, route, statusCode);
  const current = counters.get(key) || { count: 0, totalDurationMs: 0, maxDurationMs: 0 };
  current.count += 1;
  current.totalDurationMs += durationMs;
  current.maxDurationMs = Math.max(current.maxDurationMs, durationMs);
  counters.set(key, current);
}

function snapshotMetrics() {
  return Array.from(counters.entries()).map(([key, value]) => {
    const [method, route, statusCode] = key.split('|');
    return {
      method,
      route,
      statusCode: Number(statusCode),
      count: value.count,
      averageDurationMs: Number((value.totalDurationMs / value.count).toFixed(2)),
      maxDurationMs: Number(value.maxDurationMs.toFixed(2))
    };
  });
}

function resetMetrics() {
  counters.clear();
}

function observabilityMiddleware(req, res, next) {
  const requestId = req.get?.('x-request-id') || randomUUID();
  const startedAt = process.hrtime.bigint();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const route = req.route?.path || req.baseUrl || req.path || 'unknown';
    recordRequest({ method: req.method, route, statusCode: res.statusCode, durationMs });
    logger.info('http.request', {
      requestId,
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    });
  });

  next();
}

module.exports = { observabilityMiddleware, recordRequest, snapshotMetrics, resetMetrics };
