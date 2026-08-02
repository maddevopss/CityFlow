const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { assetReadLimiter, assetWriteLimiter } = require('../middleware/rateLimiters');
const { PARK_TYPES, MAINTENANCE_LEVELS, getPark, savePark } = require('../../services/municipalParks');

const router = express.Router({ mergeParams: true });
const uuid = Joi.string().guid({ version: ['uuidv4'] });
const schema = Joi.object({
  version: Joi.number().integer().min(1).allow(null),
  parkType: Joi.string().valid(...PARK_TYPES).required(),
  areaSquareMeters: Joi.number().precision(2).min(0).allow(null),
  openingHours: Joi.object().default({}),
  amenities: Joi.array().items(Joi.string().trim().min(1).max(120)).max(100).default([]),
  accessible: Joi.boolean().default(false),
  hasRestrooms: Joi.boolean().default(false),
  hasParking: Joi.boolean().default(false),
  hasLighting: Joi.boolean().default(false),
  maintenanceLevel: Joi.string().valid(...MAINTENANCE_LEVELS).default('STANDARD'),
  responsibleDepartment: Joi.string().trim().max(160).allow('', null)
});
const idempotencyKey = Joi.string().trim().min(8).max(200);

function municipality(req, res) {
  if (!req.user.municipalityId) {
    res.status(403).json({ message: 'Municipalité requise', code: 'MUNICIPALITY_REQUIRED' });
    return null;
  }
  return req.user.municipalityId;
}

function known(error, res, next) {
  if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, code: error.code });
  return next(error);
}

router.get('/:assetId/park', assetReadLimiter, authenticate, authorize('ADMIN','MANAGER','MUNICIPAL_AGENT','INSPECTOR','VIEWER'), async (req, res, next) => {
  try {
    const id = uuid.required().validate(req.params.assetId);
    if (id.error) return res.status(400).json({ message: 'Identifiant invalide' });
    const municipalityId = municipality(req, res);
    if (!municipalityId) return undefined;
    const item = await getPark(prisma, { municipalityId, assetId: id.value });
    return item ? res.json({ item }) : res.status(404).json({ message: 'Fiche parc introuvable', code: 'PARK_NOT_FOUND' });
  } catch (error) {
    return known(error, res, next);
  }
});

router.put('/:assetId/park', assetWriteLimiter, authenticate, authorize('ADMIN','MANAGER','MUNICIPAL_AGENT'), async (req, res, next) => {
  try {
    const id = uuid.required().validate(req.params.assetId);
    const body = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    const key = idempotencyKey.allow(null).validate(req.get('Idempotency-Key') || null);
    if (id.error || body.error || key.error) return res.status(400).json({ message: 'Données invalides' });
    const municipalityId = municipality(req, res);
    if (!municipalityId) return undefined;
    const item = await savePark(prisma, {
      ...body.value,
      assetId: id.value,
      municipalityId,
      actorId: req.user.sub,
      idempotencyKey: key.value
    });
    return res.json({ item });
  } catch (error) {
    return known(error, res, next);
  }
});

module.exports = router;