const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getOutboxSummary,
  listDeadOutboxEvents,
  retryDeadOutboxEvent
} = require('../../services/outbox');
const {
  getAlertSummary,
  listOperationalAlerts,
  acknowledgeOperationalAlert
} = require('../../services/operationalAlerts');

const router = express.Router();

const idSchema = Joi.string().uuid().required();
const alertStatusSchema = Joi.string().valid('OPEN', 'ACKNOWLEDGED').default('OPEN');

router.use(authenticate, authorize('ADMIN'));

router.get('/diffusion', async (req, res) => {
  const municipalityId = req.user.municipalityId;
  const [summary, deadLetters] = await Promise.all([
    getOutboxSummary({ municipalityId }),
    listDeadOutboxEvents({ municipalityId })
  ]);

  res.json({ summary, deadLetters });
});

router.post('/diffusion/:id/retry', async (req, res) => {
  const { error, value: id } = idSchema.validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant de diffusion invalide' });

  const retried = await retryDeadOutboxEvent({
    id,
    municipalityId: req.user.municipalityId,
    actorId: req.user.sub
  });

  if (!retried) {
    return res.status(404).json({ message: 'Diffusion en échec introuvable' });
  }

  res.status(202).json({ id: retried.id, status: 'PENDING' });
});

router.get('/alerts', async (req, res) => {
  const { error, value: status } = alertStatusSchema.validate(req.query.status);
  if (error) return res.status(400).json({ message: 'Statut d’alerte invalide' });

  const municipalityId = req.user.municipalityId;
  const [summary, alerts] = await Promise.all([
    getAlertSummary({ municipalityId }),
    listOperationalAlerts({ municipalityId, status })
  ]);

  res.json({ summary, alerts });
});

router.post('/alerts/:id/acknowledge', async (req, res) => {
  const { error, value: id } = idSchema.validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant d’alerte invalide' });

  const alert = await acknowledgeOperationalAlert({
    id,
    municipalityId: req.user.municipalityId,
    actorId: req.user.sub
  });

  if (!alert) {
    return res.status(404).json({ message: 'Alerte ouverte introuvable' });
  }

  res.json(alert);
});

module.exports = router;
