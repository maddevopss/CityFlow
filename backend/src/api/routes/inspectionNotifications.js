const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const schema = Joi.object({
  inspectionId: Joi.string().uuid().required(),
  channel: Joi.string().valid('EMAIL', 'SMS', 'PUSH').required(),
  recipient: Joi.string().trim().min(3).max(320).required(),
  template: Joi.string().valid('ASSIGNMENT', 'REMINDER', 'COMPLETION').required(),
  dryRun: Joi.boolean().default(true)
});

router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'));

router.post('/dispatch', async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Notification invalide', details: error.details.map(d => d.message) });

  const inspection = await prisma.inspection.findFirst({
    where: { id: value.inspectionId, municipalityId: req.user.municipalityId },
    select: { id: true, address: true, scheduledAt: true, status: true }
  });
  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });

  const dispatchId = crypto.randomUUID();
  const message = {
    dispatchId,
    channel: value.channel,
    recipient: value.recipient,
    template: value.template,
    inspection,
    requestedBy: req.user.sub,
    requestedAt: new Date().toISOString()
  };

  res.status(value.dryRun ? 200 : 202).json({ status: value.dryRun ? 'PREVIEWED' : 'QUEUED', message });
});

module.exports = router;
