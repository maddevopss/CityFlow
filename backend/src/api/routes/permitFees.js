const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { permitReadLimiter, permitWriteLimiter } = require('../middleware/rateLimiters');
const { getPermitFee, assessPermitFee, markPermitFeePaid } = require('../../services/permitFees');
const { waivePermitFee } = require('../../services/permitFeeWaiver');

const router = express.Router();
const permitIdSchema = Joi.string().guid({ version: ['uuidv4'] }).required();
const assessmentSchema = Joi.object({ amountCents: Joi.number().integer().min(0).max(100000000).required(), currency: Joi.string().uppercase().length(3).default('CAD'), note: Joi.string().trim().max(1000).allow('', null) });
const paymentSchema = Joi.object({ paymentReference: Joi.string().trim().min(3).max(200).required(), paidAt: Joi.date().iso().allow(null) });
const waiverSchema = Joi.object({ reason: Joi.string().trim().min(10).max(1000).required() });

function validatePermitId(req, res) {
  const { error, value } = permitIdSchema.validate(req.params.permitId);
  if (error) { res.status(400).json({ message: 'Identifiant de permis invalide' }); return null; }
  return value;
}

function mapError(error, res, next) {
  if (error.code === 'PERMIT_NOT_FOUND' || error.code === 'PERMIT_FEE_NOT_FOUND') return res.status(404).json({ message: error.message, code: error.code });
  if (error.code === 'PERMIT_FEE_ALREADY_PAID' || error.code === 'PERMIT_FEE_ALREADY_WAIVED') return res.status(409).json({ message: error.message, code: error.code });
  return next(error);
}

router.get('/:permitId/fees', permitReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'VIEWER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const fee = await getPermitFee(prisma, { municipalityId: req.user.municipalityId, permitId });
    return res.json({ fee });
  } catch (error) { return mapError(error, res, next); }
});

router.put('/:permitId/fees', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const { error, value } = assessmentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Frais de permis invalides', details: error.details.map((detail) => detail.message) });
    const fee = await assessPermitFee(prisma, { municipalityId: req.user.municipalityId, permitId, actorId: req.user.sub, ...value });
    return res.json({ fee });
  } catch (error) { return mapError(error, res, next); }
});

router.post('/:permitId/fees/mark-paid', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const { error, value } = paymentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Paiement de permis invalide', details: error.details.map((detail) => detail.message) });
    const fee = await markPermitFeePaid(prisma, { municipalityId: req.user.municipalityId, permitId, actorId: req.user.sub, ...value });
    return res.json({ fee });
  } catch (error) { return mapError(error, res, next); }
});

router.post('/:permitId/fees/waive', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const { error, value } = waiverSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Dispense de frais invalide', details: error.details.map((detail) => detail.message) });
    const fee = await waivePermitFee(prisma, { municipalityId: req.user.municipalityId, permitId, actorId: req.user.sub, reason: value.reason });
    return res.json({ fee });
  } catch (error) { return mapError(error, res, next); }
});

module.exports = router;
