const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const config = require('../../config');

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

router.post('/hook', verifyPermitWebhook, async (req, res) => {
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

  const event = await prisma.roadEvent.create({
    data: {
      municipalityId: value.municipalityId,
      eventType: 'CONSTRUCTION',
      subtype: 'travaux',
      geometry: value.geometry,
      startTime: new Date(value.start_date),
      endTime: value.end_date ? new Date(value.end_date) : null,
      impacts: value.impacts,
      details: { contractor: value.contractor, permit_id: value.permit_id },
      sourceType: 'PERMIT',
      sourceRef: value.permit_id,
      status: 'DRAFT'
    }
  });

  res.status(201).json({ eventId: event.id, status: 'draft' });
});

module.exports = router;
