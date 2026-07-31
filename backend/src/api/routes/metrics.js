const crypto = require('crypto');
const express = require('express');
const {
  getGlobalDiffusionMetrics,
  renderPrometheusMetrics
} = require('../../services/prometheusMetrics');

const router = express.Router();

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length
    && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function extractMetricsToken(req) {
  const authorization = req.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7);
  return req.get('x-metrics-token') || '';
}

router.get('/', async (req, res) => {
  const expectedToken = process.env.METRICS_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ message: 'Exporteur de métriques non configuré' });
  }

  if (!secureEqual(extractMetricsToken(req), expectedToken)) {
    return res.status(401).json({ message: 'Jeton de métriques invalide' });
  }

  const snapshot = await getGlobalDiffusionMetrics();
  res.type('text/plain; version=0.0.4; charset=utf-8');
  return res.send(renderPrometheusMetrics(snapshot));
});

module.exports = router;
module.exports.secureEqual = secureEqual;
module.exports.extractMetricsToken = extractMetricsToken;
