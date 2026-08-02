const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { assetReadLimiter, assetWriteLimiter } = require('../middleware/rateLimiters');
const { getBuilding, upsertBuilding } = require('../../services/municipalBuildings');

const router = express.Router({ mergeParams: true });
const uuid = Joi.string().guid({ version: ['uuidv4'] });
const schema = Joi.object({
  version: Joi.number().integer().min(1).allow(null).default(null),
  buildingUse: Joi.string().trim().min(2).max(160).required(),
  constructionYear: Joi.number().integer().min(1600).max(2200).allow(null),
  floorCount: Joi.number().integer().min(1).max(500).allow(null),
  grossAreaM2: Joi.number().positive().precision(2).allow(null),
  occupancyCapacity: Joi.number().integer().min(0).allow(null),
  heritageStatus: Joi.string().valid('NONE','LISTED','PROTECTED','PENDING').default('NONE'),
  accessibilityStatus: Joi.string().valid('UNKNOWN','COMPLIANT','PARTIAL','NON_COMPLIANT').default('UNKNOWN'),
  fireSafetyStatus: Joi.string().valid('UNKNOWN','COMPLIANT','ACTION_REQUIRED','NON_COMPLIANT').default('UNKNOWN'),
  energyRating: Joi.string().trim().max(40).allow('', null),
  lastRenovationYear: Joi.number().integer().min(1600).max(2200).allow(null),
  metadata: Joi.object().default({})
});

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

router.get('/:assetId/building', assetReadLimiter, authenticate, authorize('ADMIN','MANAGER','MUNICIPAL_AGENT','INSPECTOR','VIEWER'), async (req,res,next) => {
  try {
    const id = uuid.required().validate(req.params.assetId);
    if (id.error) return res.status(400).json({ message: 'Identifiant invalide' });
    const municipalityId = municipality(req,res); if (!municipalityId) return undefined;
    const item = await getBuilding(prisma,{ municipalityId, assetId:id.value });
    return item ? res.json({ item }) : res.status(404).json({ message:'Fiche bâtiment introuvable', code:'BUILDING_NOT_FOUND' });
  } catch (error) { return known(error,res,next); }
});

router.put('/:assetId/building', assetWriteLimiter, authenticate, authorize('ADMIN','MANAGER','MUNICIPAL_AGENT'), async (req,res,next) => {
  try {
    const id = uuid.required().validate(req.params.assetId);
    const body = schema.validate(req.body,{ abortEarly:false, stripUnknown:true });
    if (id.error || body.error) return res.status(400).json({ message:'Données invalides' });
    const municipalityId = municipality(req,res); if (!municipalityId) return undefined;
    const item = await upsertBuilding(prisma,{ ...body.value, municipalityId, assetId:id.value, actorId:req.user.sub });
    return res.json({ item });
  } catch (error) { return known(error,res,next); }
});

module.exports = router;
