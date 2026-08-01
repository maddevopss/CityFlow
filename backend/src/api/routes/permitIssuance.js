const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { permitReadLimiter, permitWriteLimiter } = require('../middleware/rateLimiters');
const { getPermitIssuance, issuePermit } = require('../../services/permitIssuance');

const router = express.Router();
const permitIdSchema = Joi.string().guid({ version: ['uuidv4'] }).required();

function validatePermitId(req, res) {
  const { error, value } = permitIdSchema.validate(req.params.permitId);
  if (error) {
    res.status(400).json({ message: 'Identifiant de permis invalide' });
    return null;
  }
  return value;
}

function mapError(error, res, next) {
  if (error.code === 'PERMIT_NOT_FOUND') return res.status(404).json({ message: error.message, code: error.code });
  if (['PERMIT_NOT_APPROVED', 'PERMIT_DOCUMENTS_INCOMPLETE', 'PERMIT_FEE_UNSETTLED'].includes(error.code)) {
    return res.status(409).json({ message: error.message, code: error.code, compliance: error.compliance });
  }
  return next(error);
}

router.get('/:permitId/issuance', permitReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'VIEWER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res);
    if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const issuance = await getPermitIssuance(prisma, { municipalityId: req.user.municipalityId, permitId });
    return res.json({ issuance });
  } catch (error) {
    return mapError(error, res, next);
  }
});

router.post('/:permitId/issuance', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res);
    if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const issuance = await issuePermit(prisma, {
      municipalityId: req.user.municipalityId,
      permitId,
      actorId: req.user.sub,
      actorRole: req.user.role
    });
    return res.status(201).json({ issuance });
  } catch (error) {
    return mapError(error, res, next);
  }
});

module.exports = router;
