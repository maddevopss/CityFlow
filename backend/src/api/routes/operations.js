const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getOutboxSummary,
  listDeadOutboxEvents,
  retryDeadOutboxEvent
} = require('../../services/outbox');

const router = express.Router();

const idSchema = Joi.string().uuid().required();

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

module.exports = router;
