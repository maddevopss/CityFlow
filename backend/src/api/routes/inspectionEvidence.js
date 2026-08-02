const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const {
  operationsReadLimiter,
  operationsWriteLimiter
} = require('../middleware/rateLimiters');

const router = express.Router({ mergeParams: true });
const allowedRoles = ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'];

const evidenceSchema = Joi.object({
  evidenceType: Joi.string().valid('PHOTO', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER').required(),
  fileName: Joi.string().trim().min(1).max(255).required(),
  mimeType: Joi.string().trim().min(3).max(150).required(),
  sizeBytes: Joi.number().integer().min(1).max(50 * 1024 * 1024).required(),
  storageKey: Joi.string().trim().min(3).max(500).required(),
  sha256: Joi.string().lowercase().pattern(/^[a-f0-9]{64}$/).required(),
  description: Joi.string().trim().max(2000).allow('', null),
  capturedAt: Joi.date().iso().required()
});

function inspectionScope(req) {
  return {
    id: req.params.inspectionId,
    municipalityId: req.user.municipalityId,
    ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
  };
}

function evidenceRateLimiter(req, res, next) {
  const limiter = req.method === 'GET' ? operationsReadLimiter : operationsWriteLimiter;
  return limiter(req, res, next);
}

router.use(evidenceRateLimiter, authenticate, authorize(...allowedRoles));

router.get('/', async (req, res) => {
  const { error } = Joi.string().uuid().validate(req.params.inspectionId);
  if (error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const inspection = await prisma.inspection.findFirst({
    where: inspectionScope(req),
    select: { id: true }
  });
  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });

  const evidence = await prisma.inspectionEvidence.findMany({
    where: {
      municipalityId: req.user.municipalityId,
      inspectionId: inspection.id
    },
    orderBy: [{ capturedAt: 'asc' }, { createdAt: 'asc' }]
  });
  return res.json(evidence);
});

router.post('/', async (req, res) => {
  const idValidation = Joi.string().uuid().validate(req.params.inspectionId);
  if (idValidation.error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const { error, value } = evidenceSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    return res.status(400).json({
      message: 'Données de preuve invalides',
      details: error.details.map(detail => detail.message)
    });
  }

  const inspection = await prisma.inspection.findFirst({
    where: inspectionScope(req),
    select: { id: true }
  });
  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });

  const duplicate = await prisma.inspectionEvidence.findFirst({
    where: {
      municipalityId: req.user.municipalityId,
      inspectionId: inspection.id,
      sha256: value.sha256
    },
    select: { id: true }
  });
  if (duplicate) {
    return res.status(409).json({ message: 'Cette preuve est déjà liée à l’inspection' });
  }

  const evidence = await prisma.inspectionEvidence.create({
    data: {
      municipalityId: req.user.municipalityId,
      inspectionId: inspection.id,
      evidenceType: value.evidenceType,
      fileName: value.fileName,
      mimeType: value.mimeType,
      sizeBytes: value.sizeBytes,
      storageKey: value.storageKey,
      sha256: value.sha256,
      description: value.description || null,
      capturedAt: new Date(value.capturedAt),
      uploadedBy: req.user.sub
    }
  });

  return res.status(201).json(evidence);
});

module.exports = router;
