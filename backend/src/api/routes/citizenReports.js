const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const statuses = ['RECEIVED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'REJECTED'];
const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const categories = ['ROAD', 'LIGHTING', 'PARK', 'WASTE', 'WATER', 'BUILDING', 'OTHER'];

const publicCreateSchema = Joi.object({
  municipalityId: Joi.number().integer().positive().required(),
  category: Joi.string().valid(...categories).required(),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(5).max(8000).required(),
  address: Joi.string().trim().max(300).allow('', null),
  geometry: Joi.object().allow(null),
  reporterName: Joi.string().trim().max(200).allow('', null),
  reporterEmail: Joi.string().email().max(254).allow('', null),
  reporterPhone: Joi.string().trim().max(40).allow('', null),
  consentToContact: Joi.boolean().default(false)
});

const transitionSchema = Joi.object({
  status: Joi.string().valid(...statuses).required(),
  priority: Joi.string().valid(...priorities),
  assignedTeamId: Joi.string().uuid().allow(null),
  workOrderId: Joi.string().uuid().allow(null),
  reason: Joi.string().trim().min(3).max(2000).required()
});

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données de signalement invalides', details: error.details.map(item => item.message) });
    req.validatedBody = value;
    next();
  };
}

router.post('/public', validate(publicCreateSchema), async (req, res) => {
  const municipality = await prisma.municipality.findUnique({ where: { id: req.validatedBody.municipalityId }, select: { id: true } });
  if (!municipality) return res.status(404).json({ message: 'Municipalité inconnue' });
  const sequence = await prisma.citizenReport.count({ where: { municipalityId: municipality.id } });
  const publicNumber = `REQ-${municipality.id}-${String(sequence + 1).padStart(7, '0')}`;
  const trackingToken = crypto.randomBytes(24).toString('hex');
  const report = await prisma.citizenReport.create({ data: { ...req.validatedBody, municipalityId: municipality.id, publicNumber, trackingTokenHash: hashToken(trackingToken), reporterName: req.validatedBody.reporterName || null, reporterEmail: req.validatedBody.reporterEmail || null, reporterPhone: req.validatedBody.reporterPhone || null } });
  res.status(201).json({ publicNumber: report.publicNumber, trackingToken, status: report.status, createdAt: report.createdAt });
});

router.get('/public/:publicNumber', async (req, res) => {
  const token = req.get('x-cityflow-tracking-token');
  if (!token) return res.status(401).json({ message: 'Jeton de suivi requis' });
  const report = await prisma.citizenReport.findFirst({ where: { publicNumber: req.params.publicNumber, trackingTokenHash: hashToken(token) }, select: { publicNumber: true, category: true, title: true, status: true, priority: true, acknowledgedAt: true, resolvedAt: true, closedAt: true, createdAt: true, updatedAt: true, messages: { where: { visibility: 'PUBLIC' }, select: { message: true, authorType: true, createdAt: true }, orderBy: { createdAt: 'asc' } } } });
  if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
  res.json(report);
});

router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT', 'PUBLIC_WORKS_MANAGER', 'CITIZEN_SERVICE_AGENT'));

router.get('/', async (req, res) => {
  const schema = Joi.object({ page: Joi.number().integer().min(1).default(1), pageSize: Joi.number().integer().min(1).max(100).default(25), status: Joi.string().valid(...statuses), category: Joi.string().valid(...categories), priority: Joi.string().valid(...priorities), q: Joi.string().trim().min(2).max(100) });
  const { error, value } = schema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Filtres de signalements invalides' });
  const where = { municipalityId: req.user.municipalityId, ...(value.status ? { status: value.status } : {}), ...(value.category ? { category: value.category } : {}), ...(value.priority ? { priority: value.priority } : {}), ...(value.q ? { OR: [{ publicNumber: { contains: value.q, mode: 'insensitive' } }, { title: { contains: value.q, mode: 'insensitive' } }, { address: { contains: value.q, mode: 'insensitive' } }] } : {}) };
  const [total, items] = await prisma.$transaction([
    prisma.citizenReport.count({ where }),
    prisma.citizenReport.findMany({ where, select: { id: true, publicNumber: true, category: true, title: true, address: true, status: true, priority: true, assignedTeamId: true, workOrderId: true, createdAt: true, updatedAt: true }, orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }], skip: (value.page - 1) * value.pageSize, take: value.pageSize })
  ]);
  res.json({ items, pagination: { page: value.page, pageSize: value.pageSize, total, totalPages: Math.ceil(total / value.pageSize) } });
});

router.get('/:id', async (req, res) => {
  const report = await prisma.citizenReport.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
  if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
  res.json(report);
});

router.post('/:id/transition', validate(transitionSchema), async (req, res) => {
  const report = await prisma.citizenReport.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
  if (report.status === 'CLOSED' && req.validatedBody.status !== 'REOPENED') return res.status(409).json({ message: 'Un signalement fermé doit être rouvert avant modification' });
  const now = new Date();
  const updated = await prisma.$transaction(async tx => {
    const item = await tx.citizenReport.update({ where: { id: report.id }, data: { status: req.validatedBody.status, priority: req.validatedBody.priority, assignedTeamId: req.validatedBody.assignedTeamId, workOrderId: req.validatedBody.workOrderId, acknowledgedAt: req.validatedBody.status === 'TRIAGED' ? now : undefined, resolvedAt: req.validatedBody.status === 'RESOLVED' ? now : undefined, closedAt: req.validatedBody.status === 'CLOSED' ? now : undefined } });
    await tx.citizenReportMessage.create({ data: { municipalityId: req.user.municipalityId, reportId: report.id, visibility: 'PUBLIC', message: req.validatedBody.reason, authorType: 'MUNICIPAL', authorId: req.user.sub } });
    return item;
  });
  res.json(updated);
});

router.post('/:id/messages', validate(Joi.object({ visibility: Joi.string().valid('PUBLIC', 'INTERNAL').default('PUBLIC'), message: Joi.string().trim().min(2).max(4000).required() })), async (req, res) => {
  const report = await prisma.citizenReport.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true } });
  if (!report) return res.status(404).json({ message: 'Signalement introuvable' });
  const message = await prisma.citizenReportMessage.create({ data: { municipalityId: req.user.municipalityId, reportId: report.id, visibility: req.validatedBody.visibility, message: req.validatedBody.message, authorType: 'MUNICIPAL', authorId: req.user.sub } });
  res.status(201).json(message);
});

module.exports = router;
