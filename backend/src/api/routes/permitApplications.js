const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const roles = ['ADMIN', 'MUNICIPAL_AGENT', 'PERMIT_REVIEWER'];
const statuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFORMATION_REQUIRED', 'APPROVED', 'REJECTED', 'ISSUED', 'SUSPENDED', 'EXPIRED', 'CLOSED'];

const createSchema = Joi.object({
  applicantName: Joi.string().trim().min(2).max(200).required(),
  applicantEmail: Joi.string().email().max(254).required(),
  permitType: Joi.string().trim().min(2).max(100).required(),
  address: Joi.string().trim().min(3).max(300).required(),
  description: Joi.string().trim().min(3).max(8000).required()
});
const decisionSchema = Joi.object({
  decision: Joi.string().valid('APPROVED', 'REJECTED', 'INFORMATION_REQUIRED').required(),
  reason: Joi.string().trim().min(3).max(4000).required(),
  conditions: Joi.array().items(Joi.string().trim().max(500)).max(50).default([]),
  expiresAt: Joi.date().iso().allow(null)
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données de permis invalides', details: error.details.map(item => item.message) });
    req.validatedBody = value;
    next();
  };
}

router.use(authenticate, authorize(...roles));

router.get('/', async (req, res) => {
  const schema = Joi.object({ page: Joi.number().integer().min(1).default(1), pageSize: Joi.number().integer().min(1).max(100).default(25), status: Joi.string().valid(...statuses), q: Joi.string().trim().min(2).max(100) });
  const { error, value } = schema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Filtres de permis invalides' });
  const where = { municipalityId: req.user.municipalityId, ...(value.status ? { status: value.status } : {}), ...(value.q ? { OR: [{ publicNumber: { contains: value.q, mode: 'insensitive' } }, { applicantName: { contains: value.q, mode: 'insensitive' } }, { address: { contains: value.q, mode: 'insensitive' } }] } : {}) };
  const [total, items] = await prisma.$transaction([
    prisma.permitApplication.count({ where }),
    prisma.permitApplication.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (value.page - 1) * value.pageSize, take: value.pageSize })
  ]);
  res.json({ items, pagination: { page: value.page, pageSize: value.pageSize, total, totalPages: Math.ceil(total / value.pageSize) } });
});

router.post('/', validate(createSchema), async (req, res) => {
  const sequence = await prisma.permitApplication.count({ where: { municipalityId: req.user.municipalityId } });
  const publicNumber = `PER-${req.user.municipalityId}-${String(sequence + 1).padStart(6, '0')}`;
  const application = await prisma.permitApplication.create({ data: { ...req.validatedBody, municipalityId: req.user.municipalityId, publicNumber, createdBy: req.user.sub, updatedBy: req.user.sub } });
  res.status(201).json(application);
});

router.get('/:id', async (req, res) => {
  if (Joi.string().uuid().validate(req.params.id).error) return res.status(400).json({ message: 'Identifiant invalide' });
  const item = await prisma.permitApplication.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, include: { documents: true, decisions: { orderBy: { createdAt: 'desc' } } } });
  if (!item) return res.status(404).json({ message: 'Demande introuvable' });
  res.json(item);
});

router.post('/:id/submit', async (req, res) => {
  const item = await prisma.permitApplication.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Demande introuvable' });
  if (item.status !== 'DRAFT' && item.status !== 'INFORMATION_REQUIRED') return res.status(409).json({ message: 'Transition de soumission interdite' });
  res.json(await prisma.permitApplication.update({ where: { id: item.id }, data: { status: 'SUBMITTED', submittedAt: new Date(), updatedBy: req.user.sub } }));
});

router.post('/:id/decision', authorize('ADMIN', 'PERMIT_REVIEWER'), validate(decisionSchema), async (req, res) => {
  const item = await prisma.permitApplication.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Demande introuvable' });
  if (!['SUBMITTED', 'UNDER_REVIEW'].includes(item.status)) return res.status(409).json({ message: 'Décision interdite dans cet état' });
  const result = await prisma.$transaction(async tx => {
    const decision = await tx.permitDecision.create({ data: { municipalityId: req.user.municipalityId, applicationId: item.id, decision: req.validatedBody.decision, reason: req.validatedBody.reason, conditions: req.validatedBody.conditions, decidedBy: req.user.sub } });
    const application = await tx.permitApplication.update({ where: { id: item.id }, data: { status: req.validatedBody.decision, decidedAt: new Date(), expiresAt: req.validatedBody.expiresAt ? new Date(req.validatedBody.expiresAt) : undefined, updatedBy: req.user.sub } });
    return { application, decision };
  });
  res.json(result);
});

router.post('/:id/issue', authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  const item = await prisma.permitApplication.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, select: { id: true, status: true } });
  if (!item) return res.status(404).json({ message: 'Demande introuvable' });
  if (item.status !== 'APPROVED') return res.status(409).json({ message: 'Seule une demande approuvée peut être délivrée' });
  res.json(await prisma.permitApplication.update({ where: { id: item.id }, data: { status: 'ISSUED', issuedAt: new Date(), updatedBy: req.user.sub } }));
});

module.exports = router;
