const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const roles = ['ADMIN', 'MUNICIPAL_AGENT', 'ASSET_MANAGER', 'PUBLIC_WORKS_MANAGER'];
const statuses = ['PLANNED', 'ACTIVE', 'OUT_OF_SERVICE', 'DISPOSED'];
const categories = ['PARK', 'BUILDING', 'VEHICLE', 'EQUIPMENT'];
const criticalities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const createSchema = Joi.object({
  publicCode: Joi.string().trim().min(2).max(50).required(),
  name: Joi.string().trim().min(2).max(200).required(),
  category: Joi.string().valid(...categories).required(),
  status: Joi.string().valid(...statuses).default('PLANNED'),
  criticality: Joi.string().valid(...criticalities).default('MEDIUM'),
  description: Joi.string().trim().max(4000).allow('', null),
  address: Joi.string().trim().max(300).allow('', null),
  geometry: Joi.object().allow(null),
  parentId: Joi.string().uuid().allow(null),
  acquisitionDate: Joi.date().iso().allow(null),
  replacementValue: Joi.number().min(0).max(999999999999).allow(null),
  warrantyExpiresAt: Joi.date().iso().allow(null)
});

const assessmentSchema = Joi.object({
  condition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL').required(),
  score: Joi.number().integer().min(0).max(100).required(),
  notes: Joi.string().trim().max(4000).allow('', null),
  assessedAt: Joi.date().iso().default(() => new Date())
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données d’actif invalides', details: error.details.map(item => item.message) });
    req.validatedBody = value;
    next();
  };
}

router.use(authenticate, authorize(...roles));

router.get('/', async (req, res) => {
  const schema = Joi.object({ page: Joi.number().integer().min(1).default(1), pageSize: Joi.number().integer().min(1).max(100).default(25), category: Joi.string().valid(...categories), status: Joi.string().valid(...statuses), criticality: Joi.string().valid(...criticalities), q: Joi.string().trim().min(2).max(100) });
  const { error, value } = schema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Filtres d’actifs invalides' });
  const where = { municipalityId: req.user.municipalityId, ...(value.category ? { category: value.category } : {}), ...(value.status ? { status: value.status } : {}), ...(value.criticality ? { criticality: value.criticality } : {}), ...(value.q ? { OR: [{ publicCode: { contains: value.q, mode: 'insensitive' } }, { name: { contains: value.q, mode: 'insensitive' } }, { address: { contains: value.q, mode: 'insensitive' } }] } : {}) };
  const [total, items] = await prisma.$transaction([
    prisma.asset.count({ where }),
    prisma.asset.findMany({ where, include: { assessments: { orderBy: { assessedAt: 'desc' }, take: 1 } }, orderBy: [{ criticality: 'desc' }, { name: 'asc' }], skip: (value.page - 1) * value.pageSize, take: value.pageSize })
  ]);
  res.json({ items, pagination: { page: value.page, pageSize: value.pageSize, total, totalPages: Math.ceil(total / value.pageSize) } });
});

router.post('/', validate(createSchema), async (req, res) => {
  if (req.validatedBody.parentId) {
    const parent = await prisma.asset.findFirst({ where: { id: req.validatedBody.parentId, municipalityId: req.user.municipalityId }, select: { id: true } });
    if (!parent) return res.status(400).json({ message: 'Actif parent invalide pour cette municipalité' });
  }
  const asset = await prisma.asset.create({ data: { ...req.validatedBody, municipalityId: req.user.municipalityId, acquisitionDate: req.validatedBody.acquisitionDate ? new Date(req.validatedBody.acquisitionDate) : null, warrantyExpiresAt: req.validatedBody.warrantyExpiresAt ? new Date(req.validatedBody.warrantyExpiresAt) : null, createdBy: req.user.sub, updatedBy: req.user.sub } });
  res.status(201).json(asset);
});

router.get('/:id', async (req, res) => {
  if (Joi.string().uuid().validate(req.params.id).error) return res.status(400).json({ message: 'Identifiant invalide' });
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, include: { parent: true, children: true, assessments: { orderBy: { assessedAt: 'desc' } } } });
  if (!asset) return res.status(404).json({ message: 'Actif introuvable' });
  res.json(asset);
});

router.post('/:id/assessments', validate(assessmentSchema), async (req, res) => {
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true } });
  if (!asset) return res.status(404).json({ message: 'Actif introuvable' });
  const assessment = await prisma.assetConditionAssessment.create({ data: { municipalityId: req.user.municipalityId, assetId: asset.id, condition: req.validatedBody.condition, score: req.validatedBody.score, notes: req.validatedBody.notes || null, assessedAt: new Date(req.validatedBody.assessedAt), assessedBy: req.user.sub } });
  res.status(201).json(assessment);
});

router.post('/:id/status', validate(Joi.object({ status: Joi.string().valid(...statuses).required(), reason: Joi.string().trim().min(3).max(1000).required() })), async (req, res) => {
  const asset = await prisma.asset.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!asset) return res.status(404).json({ message: 'Actif introuvable' });
  if (asset.status === 'DISPOSED') return res.status(409).json({ message: 'Un actif disposé ne peut plus changer d’état' });
  res.json(await prisma.asset.update({ where: { id: asset.id }, data: { status: req.validatedBody.status, description: `${req.validatedBody.reason}`, updatedBy: req.user.sub } }));
});

module.exports = router;
