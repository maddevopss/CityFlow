const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { assetReadLimiter, assetWriteLimiter } = require('../middleware/rateLimiters');
const {
  ASSET_TYPES,
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  ASSET_OWNERSHIP_TYPES,
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  archiveAsset
} = require('../../services/municipalAssets');

const router = express.Router();
const uuid = Joi.string().guid({ version: ['uuidv4'] });
const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});
const idempotencyKey = Joi.string().trim().min(8).max(200);

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  q: Joi.string().trim().max(200).allow(''),
  assetType: Joi.string().valid(...ASSET_TYPES),
  status: Joi.string().valid(...ASSET_STATUSES),
  condition: Joi.string().valid(...ASSET_CONDITIONS),
  ownershipType: Joi.string().valid(...ASSET_OWNERSHIP_TYPES),
  includeArchived: Joi.boolean().truthy('true').falsy('false').default(false),
  sortBy: Joi.string().valid('assetNumber', 'name', 'type', 'status', 'updatedAt', 'acquisitionDate').default('updatedAt'),
  sortDirection: Joi.string().valid('asc', 'desc').default('desc')
});

const createSchema = Joi.object({
  assetNumber: Joi.string().trim().min(2).max(80).required(),
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(5000).allow('', null),
  assetType: Joi.string().valid(...ASSET_TYPES).required(),
  condition: Joi.string().valid(...ASSET_CONDITIONS).default('UNKNOWN'),
  ownershipType: Joi.string().valid(...ASSET_OWNERSHIP_TYPES).default('OWNED'),
  department: Joi.string().trim().max(160).allow('', null),
  address: Joi.string().trim().max(500).allow('', null),
  location: locationSchema.allow(null),
  acquisitionDate: Joi.date().iso().allow(null),
  commissionedAt: Joi.date().iso().allow(null),
  acquisitionCost: Joi.number().precision(2).min(0).allow(null),
  usefulLifeYears: Joi.number().integer().min(1).max(500).allow(null),
  residualValue: Joi.number().precision(2).min(0).allow(null),
  metadata: Joi.object().default({})
});

const updateSchema = Joi.object({
  version: Joi.number().integer().min(1).required(),
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(5000).allow('', null),
  status: Joi.string().valid(...ASSET_STATUSES),
  condition: Joi.string().valid(...ASSET_CONDITIONS),
  ownershipType: Joi.string().valid(...ASSET_OWNERSHIP_TYPES),
  department: Joi.string().trim().max(160).allow('', null),
  address: Joi.string().trim().max(500).allow('', null),
  location: locationSchema.allow(null),
  commissionedAt: Joi.date().iso().allow(null),
  metadata: Joi.object()
}).min(2);

const archiveSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(1000).required()
});

function requireMunicipality(req, res) {
  if (!req.user.municipalityId) {
    res.status(403).json({ message: 'Municipalité requise', code: 'MUNICIPALITY_REQUIRED' });
    return false;
  }
  return true;
}

function handleKnownError(error, res, next) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }
  return next(error);
}

router.get('/', assetReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res, next) => {
  try {
    const result = listSchema.validate(req.query, { abortEarly: false, stripUnknown: true, convert: true });
    if (result.error) return res.status(400).json({ message: 'Paramètres invalides', details: result.error.details });
    if (!requireMunicipality(req, res)) return undefined;
    return res.json(await listAssets(prisma, { municipalityId: req.user.municipalityId, ...result.value }));
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

router.get('/:id', assetReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.id);
    if (idResult.error) return res.status(400).json({ message: 'Identifiant invalide' });
    if (!requireMunicipality(req, res)) return undefined;
    const item = await getAsset(prisma, { municipalityId: req.user.municipalityId, id: idResult.value });
    return item ? res.json({ item }) : res.status(404).json({ message: 'Actif municipal introuvable', code: 'ASSET_NOT_FOUND' });
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

router.post('/', assetWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), async (req, res, next) => {
  try {
    const bodyResult = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    const keyResult = idempotencyKey.required().validate(req.get('Idempotency-Key'));
    if (bodyResult.error || keyResult.error) return res.status(400).json({ message: 'Données ou clé d’idempotence invalides' });
    if (!requireMunicipality(req, res)) return undefined;
    const result = await createAsset(prisma, {
      ...bodyResult.value,
      municipalityId: req.user.municipalityId,
      actorId: req.user.sub,
      idempotencyKey: keyResult.value
    });
    return res.status(result.replayed ? 200 : 201).json(result);
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

router.patch('/:id', assetWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.id);
    const bodyResult = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    const keyResult = idempotencyKey.allow(null).validate(req.get('Idempotency-Key') || null);
    if (idResult.error || bodyResult.error || keyResult.error) return res.status(400).json({ message: 'Données invalides' });
    if (!requireMunicipality(req, res)) return undefined;
    const item = await updateAsset(prisma, {
      ...bodyResult.value,
      id: idResult.value,
      municipalityId: req.user.municipalityId,
      actorId: req.user.sub,
      idempotencyKey: keyResult.value
    });
    return res.json({ item });
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

router.delete('/:id', assetWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.id);
    const bodyResult = archiveSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    const keyResult = idempotencyKey.required().validate(req.get('Idempotency-Key'));
    if (idResult.error || bodyResult.error || keyResult.error) return res.status(400).json({ message: 'Données invalides' });
    if (!requireMunicipality(req, res)) return undefined;
    const result = await archiveAsset(prisma, {
      id: idResult.value,
      reason: bodyResult.value.reason,
      municipalityId: req.user.municipalityId,
      actorId: req.user.sub,
      idempotencyKey: keyResult.value
    });
    return res.json(result);
  } catch (error) {
    return handleKnownError(error, res, next);
  }
});

module.exports = router;
