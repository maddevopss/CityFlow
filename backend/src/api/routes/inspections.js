const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const allowedRoles = ['ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'];

const createInspectionSchema = Joi.object({
  permitId: Joi.string().uuid().allow(null),
  scheduledAt: Joi.date().iso().required(),
  address: Joi.string().trim().min(3).max(300).required(),
  inspectionType: Joi.string().valid('PRE_WORK', 'IN_PROGRESS', 'FINAL', 'COMPLAINT').required(),
  notes: Joi.string().trim().max(4000).allow('', null)
});

const completeInspectionSchema = Joi.object({
  outcome: Joi.string().valid('COMPLIANT', 'NON_COMPLIANT', 'FOLLOW_UP_REQUIRED').required(),
  findings: Joi.string().trim().min(3).max(8000).required(),
  completedAt: Joi.date().iso().default(() => new Date())
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Données d’inspection invalides',
        details: error.details.map(detail => detail.message)
      });
    }

    req.validatedBody = value;
    next();
  };
}

router.use(authenticate, authorize(...allowedRoles));

router.get('/', async (req, res) => {
  const status = req.query.status;
  const allowedStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut d’inspection invalide' });
  }

  const inspections = await prisma.inspection.findMany({
    where: {
      municipalityId: req.user.municipalityId,
      ...(status ? { status } : {})
    },
    orderBy: { scheduledAt: 'asc' }
  });

  res.json(inspections);
});

router.post('/', validate(createInspectionSchema), async (req, res) => {
  const inspection = await prisma.inspection.create({
    data: {
      municipalityId: req.user.municipalityId,
      permitId: req.validatedBody.permitId || null,
      scheduledAt: new Date(req.validatedBody.scheduledAt),
      address: req.validatedBody.address,
      inspectionType: req.validatedBody.inspectionType,
      notes: req.validatedBody.notes || null,
      status: 'SCHEDULED',
      createdBy: req.user.sub
    }
  });

  res.status(201).json(inspection);
});

router.get('/:id', async (req, res) => {
  const { error } = Joi.string().uuid().validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const inspection = await prisma.inspection.findFirst({
    where: {
      id: req.params.id,
      municipalityId: req.user.municipalityId
    }
  });

  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });
  res.json(inspection);
});

router.post('/:id/complete', validate(completeInspectionSchema), async (req, res) => {
  const { error } = Joi.string().uuid().validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const existing = await prisma.inspection.findFirst({
    where: {
      id: req.params.id,
      municipalityId: req.user.municipalityId
    },
    select: { id: true, status: true }
  });

  if (!existing) return res.status(404).json({ message: 'Inspection introuvable' });
  if (existing.status !== 'SCHEDULED') {
    return res.status(409).json({ message: 'Seule une inspection planifiée peut être terminée' });
  }

  const inspection = await prisma.inspection.update({
    where: { id: existing.id },
    data: {
      status: 'COMPLETED',
      outcome: req.validatedBody.outcome,
      findings: req.validatedBody.findings,
      completedAt: new Date(req.validatedBody.completedAt),
      completedBy: req.user.sub
    }
  });

  res.json(inspection);
});

module.exports = router;
