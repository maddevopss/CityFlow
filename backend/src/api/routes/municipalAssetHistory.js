const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { assetReadLimiter, assetWriteLimiter } = require('../middleware/rateLimiters');
const { listAssetHistory, restoreAsset } = require('../../services/municipalAssetHistory');
const { ASSET_STATUSES } = require('../../domain/municipalAssets');

const router = express.Router({ mergeParams: true });
const uuid = Joi.string().guid({ version: ['uuidv4'] });
const idempotencyKey = Joi.string().trim().min(8).max(200);
const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  eventType: Joi.string().trim().max(80),
  actorId: uuid,
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref('from'))
});
const restoreSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(1000).required(),
  status: Joi.string().valid(...ASSET_STATUSES.filter((status) => !['DISPOSED', 'RETIRED'].includes(status))).default('INACTIVE')
});

function requireMunicipality(req, res) {
  if (!req.user.municipalityId) {
    res.status(403).json({ message: 'Municipalité requise', code: 'MUNICIPALITY_REQUIRED' });
    return false;
  }
  return true;
}

function handleKnownError(error, res, next) {
  if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, code: error.code });
  return next(error);
}

router.get('/:assetId/history', assetReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.assetId);
    const queryResult = listSchema.validate(req.query, { abortEarly: false, stripUnknown: true, convert: true });
    if (idResult.error || queryResult.error) return res.status(400).json({ message: 'Paramètres invalides' });
    if (!requireMunicipality(req, res)) return undefined;
    return res.json(await listAssetHistory(prisma, {
      municipalityId: req.user.municipalityId,
      assetId: idResult.value,
      ...queryResult.value
    }));
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

router.post('/:assetId/restore', assetWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.assetId);
    const bodyResult = restoreSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    const keyResult = idempotencyKey.required().validate(req.get('Idempotency-Key'));
    if (idResult.error || bodyResult.error || keyResult.error) return res.status(400).json({ message: 'Données invalides' });
    if (!requireMunicipality(req, res)) return undefined;
    const result = await restoreAsset(prisma, {
      municipalityId: req.user.municipalityId,
      assetId: idResult.value,
      actorId: req.user.sub,
      idempotencyKey: keyResult.value,
      ...bodyResult.value
    });
    return res.status(result.replayed ? 200 : 201).json(result);
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

module.exports = router;
