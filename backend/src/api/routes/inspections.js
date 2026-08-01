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

const assignmentSchema = Joi.object({ inspectorId: Joi.string().uuid().required() });

const listInspectionSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25),
  status: Joi.string().valid('SCHEDULED', 'COMPLETED', 'CANCELLED'),
  inspectionType: Joi.string().valid('PRE_WORK', 'IN_PROGRESS', 'FINAL', 'COMPLAINT'),
  assignedTo: Joi.string().uuid(),
  scheduledFrom: Joi.date().iso(),
  scheduledTo: Joi.date().iso().min(Joi.ref('scheduledFrom')),
  q: Joi.string().trim().min(2).max(100)
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
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

router.get('/inspectors', async (req, res) => {
  const inspectors = await prisma.user.findMany({
    where: { municipalityId: req.user.municipalityId, role: 'INSPECTOR', isActive: true },
    select: { id: true, fullName: true, email: true },
    orderBy: [{ fullName: 'asc' }, { email: 'asc' }]
  });
  res.json(inspectors);
});

router.get('/', async (req, res) => {
  const { error, value } = listInspectionSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      message: 'Filtres d’inspection invalides',
      details: error.details.map(detail => detail.message)
    });
  }

  const { page, pageSize, status, inspectionType, assignedTo, scheduledFrom, scheduledTo, q } = value;
  const where = {
    municipalityId: req.user.municipalityId,
    ...(status ? { status } : {}),
    ...(inspectionType ? { inspectionType } : {}),
    ...(assignedTo ? { assignedTo } : {}),
    ...(scheduledFrom || scheduledTo
      ? {
          scheduledAt: {
            ...(scheduledFrom ? { gte: new Date(scheduledFrom) } : {}),
            ...(scheduledTo ? { lte: new Date(scheduledTo) } : {})
          }
        }
      : {}),
    ...(q
      ? {
          OR: [
            { address: { contains: q, mode: 'insensitive' } },
            { notes: { contains: q, mode: 'insensitive' } },
            { findings: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {}),
    ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
  };

  const [total, inspections] = await prisma.$transaction([
    prisma.inspection.count({ where }),
    prisma.inspection.findMany({
      where,
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  res.json({
    items: inspections,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1
    }
  });
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
      municipalityId: req.user.municipalityId,
      ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
    }
  });

  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });
  res.json(inspection);
});

router.post('/:id/assign', authorize('ADMIN', 'MUNICIPAL_AGENT'), validate(assignmentSchema), async (req, res) => {
  const { error } = Joi.string().uuid().validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const [inspection, inspector] = await Promise.all([
    prisma.inspection.findFirst({
      where: { id: req.params.id, municipalityId: req.user.municipalityId },
      select: { id: true, status: true }
    }),
    prisma.user.findFirst({
      where: {
        id: req.validatedBody.inspectorId,
        municipalityId: req.user.municipalityId,
        role: 'INSPECTOR',
        isActive: true
      },
      select: { id: true }
    })
  ]);

  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });
  if (!inspector) return res.status(400).json({ message: 'Inspecteur invalide pour cette municipalité' });
  if (inspection.status !== 'SCHEDULED') {
    return res.status(409).json({ message: 'Seule une inspection planifiée peut être affectée' });
  }

  const updated = await prisma.inspection.update({
    where: { id: inspection.id },
    data: { assignedTo: inspector.id, assignedAt: new Date(), assignedBy: req.user.sub },
    include: { inspector: { select: { id: true, fullName: true, email: true } } }
  });
  res.json(updated);
});

router.post('/:id/complete', validate(completeInspectionSchema), async (req, res) => {
  const { error } = Joi.string().uuid().validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const existing = await prisma.inspection.findFirst({
    where: {
      id: req.params.id,
      municipalityId: req.user.municipalityId,
      ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
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
