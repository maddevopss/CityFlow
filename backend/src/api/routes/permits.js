const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { permitWebhookLimiter } = require('../middleware/rateLimiters');
const { ingestPermit } = require('../../services/permitIngestion');

const router = express.Router();

const permitSchema = Joi.object({
  permit_id: Joi.string().trim().max(100).required(),
  contractor: Joi.string().trim().max(200).allow('', null),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).allow(null),
  municipalityId: Joi.number().integer().positive().required(),
  geometry: Joi.object({
    type: Joi.string().valid('Point', 'LineString', 'Polygon').required(),
    coordinates: Joi.array().required()
  }).required(),
  impacts: Joi.array().items(Joi.string().trim().max(100)).default([])
});

function safeEqual(expected, received) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received || '', 'utf8');

  return expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function verifyPermitWebhook(req, res, next) {
  const timestamp = req.get('x-cityflow-timestamp');
  const signature = req.get('x-cityflow-signature');
  const timestampSeconds = Number(timestamp);

  if (!timestamp || !signature || !Number.isFinite(timestampSeconds)) {
    return res.status(401).json({ message: 'Signature du webhook manquante' });
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (age > config.permitWebhookToleranceSeconds) {
    return res.status(401).json({ message: 'Signature du webhook expirée' });
  }

  const payload = `${timestamp}.${JSON.stringify(req.body)}`;
  const expected = crypto
    .createHmac('sha256', config.permitWebhookSecret)
    .update(payload)
    .digest('hex');

  if (!safeEqual(expected, signature)) {
    return res.status(401).json({ message: 'Signature du webhook invalide' });
  }

  next();
}

router.post('/hook', permitWebhookLimiter, verifyPermitWebhook, async (req, res, next) => {
  try {
    const { error, value } = permitSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Données de permis invalides',
        details: error.details.map(detail => detail.message)
      });
    }

    const municipality = await prisma.municipality.findUnique({
      where: { id: value.municipalityId },
      select: { id: true }
    });

    if (!municipality) {
      return res.status(404).json({ message: 'Municipalité inconnue' });
    }

    const result = await ingestPermit(prisma, value);
    const statusCode = result.operation === 'created' ? 201 : 200;

    return res.status(statusCode).json({
      eventId: result.event.id,
      status: 'draft',
      operation: result.operation
    });
  } catch (error) {
    if (error.code === 'PERMIT_ALREADY_PROCESSED') {
      return res.status(409).json({
        message: 'Ce permis a déjà quitté l’état brouillon',
        code: error.code,
        eventId: error.eventId
      });
    }

    return next(error);
  }
});

module.exports = router;
