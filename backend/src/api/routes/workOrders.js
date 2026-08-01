const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const roles = ['ADMIN', 'MUNICIPAL_AGENT', 'PUBLIC_WORKS_MANAGER', 'FIELD_WORKER'];
const statuses = ['DRAFT', 'PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'];
const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY'];

const createSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(3).max(8000).required(),
  workType: Joi.string().valid('CORRECTIVE', 'PREVENTIVE', 'EMERGENCY', 'INSPECTION').required(),
  priority: Joi.string().valid(...priorities).default('NORMAL'),
  assetId: Joi.string().uuid().allow(null),
  citizenReportId: Joi.string().uuid().allow(null),
  scheduledStart: Joi.date().iso().allow(null),
  scheduledEnd: Joi.date().iso().min(Joi.ref('scheduledStart')).allow(null),
  estimatedCost: Joi.number().min(0).max(999999999999).allow(null)
});

const logSchema = Joi.object({
  logType: Joi.string().valid('NOTE', 'TIME', 'MATERIAL', 'EQUIPMENT', 'EVIDENCE').required(),
  description: Joi.string().trim().min(2).max(4000).required(),
  hours: Joi.number().min(0).max(24).allow(null),
  materialCost: Joi.number().min(0).max(999999999999).allow(null),
  equipmentCost: Joi.number().min(0).max(999999999999).allow(null),
  performedAt: Joi.date().iso().default(() => new Date())
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données de travaux invalides', details: error.details.map(item => item.message) });
    req.validatedBody = value;
    next();
  };
}

router.use(authenticate, authorize(...roles));

router.get('/', async (req, res) => {
  const schema = Joi.object({ page: Joi.number().integer().min(1).default(1), pageSize: Joi.number().integer().min(1).max(100).default(25), status: Joi.string().valid(...statuses), priority: Joi.string().valid(...priorities), assignedTeamId: Joi.string().uuid(), q: Joi.string().trim().min(2).max(100) });
  const { error, value } = schema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Filtres de travaux invalides' });
  const where = { municipalityId: req.user.municipalityId, ...(value.status ? { status: value.status } : {}), ...(value.priority ? { priority: value.priority } : {}), ...(value.assignedTeamId ? { assignedTeamId: value.assignedTeamId } : {}), ...(value.q ? { OR: [{ publicNumber: { contains: value.q, mode: 'insensitive' } }, { title: { contains: value.q, mode: 'insensitive' } }, { description: { contains: value.q, mode: 'insensitive' } }] } : {}) };
  const [total, items] = await prisma.$transaction([
    prisma.workOrder.count({ where }),
    prisma.workOrder.findMany({ where, include: { logs: { orderBy: { performedAt: 'desc' }, take: 3 } }, orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }], skip: (value.page - 1) * value.pageSize, take: value.pageSize })
  ]);
  res.json({ items, pagination: { page: value.page, pageSize: value.pageSize, total, totalPages: Math.ceil(total / value.pageSize) } });
});

router.post('/', authorize('ADMIN', 'MUNICIPAL_AGENT', 'PUBLIC_WORKS_MANAGER'), validate(createSchema), async (req, res) => {
  const sequence = await prisma.workOrder.count({ where: { municipalityId: req.user.municipalityId } });
  const publicNumber = `WO-${req.user.municipalityId}-${String(sequence + 1).padStart(6, '0')}`;
  const item = await prisma.workOrder.create({ data: { ...req.validatedBody, municipalityId: req.user.municipalityId, publicNumber, scheduledStart: req.validatedBody.scheduledStart ? new Date(req.validatedBody.scheduledStart) : null, scheduledEnd: req.validatedBody.scheduledEnd ? new Date(req.validatedBody.scheduledEnd) : null, createdBy: req.user.sub, updatedBy: req.user.sub } });
  res.status(201).json(item);
});

router.get('/:id', async (req, res) => {
  const item = await prisma.workOrder.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, include: { logs: { orderBy: { performedAt: 'desc' } } } });
  if (!item) return res.status(404).json({ message: 'Ordre de travail introuvable' });
  res.json(item);
});

router.post('/:id/assign', authorize('ADMIN', 'PUBLIC_WORKS_MANAGER'), validate(Joi.object({ assignedTeamId: Joi.string().uuid().required(), scheduledStart: Joi.date().iso().required(), scheduledEnd: Joi.date().iso().min(Joi.ref('scheduledStart')).required() })), async (req, res) => {
  const item = await prisma.workOrder.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Ordre de travail introuvable' });
  if (!['DRAFT', 'PLANNED', 'ASSIGNED'].includes(item.status)) return res.status(409).json({ message: 'Affectation interdite dans cet état' });
  res.json(await prisma.workOrder.update({ where: { id: item.id }, data: { status: 'ASSIGNED', assignedTeamId: req.validatedBody.assignedTeamId, scheduledStart: new Date(req.validatedBody.scheduledStart), scheduledEnd: new Date(req.validatedBody.scheduledEnd), updatedBy: req.user.sub } }));
});

router.post('/:id/start', async (req, res) => {
  const item = await prisma.workOrder.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Ordre de travail introuvable' });
  if (item.status !== 'ASSIGNED') return res.status(409).json({ message: 'Seul un ordre affecté peut démarrer' });
  res.json(await prisma.workOrder.update({ where: { id: item.id }, data: { status: 'IN_PROGRESS', startedAt: new Date(), updatedBy: req.user.sub } }));
});

router.post('/:id/logs', validate(logSchema), async (req, res) => {
  const item = await prisma.workOrder.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Ordre de travail introuvable' });
  if (!['IN_PROGRESS', 'BLOCKED', 'COMPLETED'].includes(item.status)) return res.status(409).json({ message: 'Journal interdit dans cet état' });
  const log = await prisma.workLog.create({ data: { municipalityId: req.user.municipalityId, workOrderId: item.id, ...req.validatedBody, performedAt: new Date(req.validatedBody.performedAt), performedBy: req.user.sub } });
  res.status(201).json(log);
});

router.post('/:id/complete', validate(Joi.object({ actualCost: Joi.number().min(0).max(999999999999).required(), summary: Joi.string().trim().min(3).max(4000).required() })), async (req, res) => {
  const item = await prisma.workOrder.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Ordre de travail introuvable' });
  if (!['IN_PROGRESS', 'BLOCKED'].includes(item.status)) return res.status(409).json({ message: 'Clôture terrain interdite dans cet état' });
  res.json(await prisma.workOrder.update({ where: { id: item.id }, data: { status: 'COMPLETED', completedAt: new Date(), actualCost: req.validatedBody.actualCost, description: req.validatedBody.summary, updatedBy: req.user.sub } }));
});

module.exports = router;
