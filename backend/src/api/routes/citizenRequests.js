'use strict';

const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const {
  normalizeCitizenRequest,
  assertCitizenOwnership,
  transitionCitizenRequest,
  citizenTimeline
} = require('../../services/citizenPortal');

const router = express.Router();
const municipalRoles = ['ADMIN', 'AGENT', 'MANAGER'];
const idParamsSchema = Joi.object({ id: Joi.string().uuid().required() });
const createSchema = Joi.object({
  title: Joi.string().trim().min(5).max(140).required(),
  description: Joi.string().trim().min(10).max(5000).required(),
  category: Joi.string().trim().max(80).default('OTHER'),
  location: Joi.object().unknown(true).allow(null),
  attachments: Joi.array().items(Joi.object({
    fileName: Joi.string().max(255).required(),
    mimeType: Joi.string().max(120).required(),
    sizeBytes: Joi.number().integer().min(0).max(26214400).required(),
    storageKey: Joi.string().max(500).required()
  })).max(10).default([])
});
const assignSchema = Joi.object({ team: Joi.string().trim().min(2).max(120).required() });
const statusSchema = Joi.object({
  status: Joi.string().valid('ACKNOWLEDGED', 'IN_REVIEW', 'PLANNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED').required(),
  resolution: Joi.string().trim().max(4000).allow('', null)
});

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données invalides', details: error.details.map(item => item.message) });
    req[source] = value;
    next();
  };
}

const citizenRequestsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user && req.user.sub ? req.user.sub : req.ip),
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

router.use(authenticate);
router.use(citizenRequestsRateLimiter);

router.post('/', validate(createSchema), async (req, res) => {
  const normalized = normalizeCitizenRequest(req.body, { id: req.user.sub, municipalityId: req.user.municipalityId });
  const created = await prisma.$transaction(async tx => {
    const request = await tx.citizenRequest.create({ data: normalized });
    await tx.citizenRequestEvent.create({ data: { municipalityId: request.municipalityId, requestId: request.id, type: 'REQUEST_CREATED', status: request.status, actorId: req.user.sub, metadata: { category: request.category } } });
    return request;
  });
  res.status(201).json(created);
});

router.get('/:id', validate(idParamsSchema, 'params'), async (req, res) => {
  const request = await prisma.citizenRequest.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId }, include: { events: true, messages: true } });
  if (req.user.role === 'CITIZEN') assertCitizenOwnership(request, { id: req.user.sub, municipalityId: req.user.municipalityId });
  if (!request) return res.status(404).json({ message: 'Demande introuvable' });
  res.json(citizenTimeline(request, request.messages));
});

router.post('/:id/assign', authorize(...municipalRoles), validate(idParamsSchema, 'params'), validate(assignSchema), async (req, res) => {
  const existing = await prisma.citizenRequest.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId } });
  if (!existing) return res.status(404).json({ message: 'Demande introuvable' });
  const source = existing.status === 'SUBMITTED' ? { ...existing, status: 'ACKNOWLEDGED' } : existing;
  const next = transitionCitizenRequest(source, 'IN_REVIEW', req.user);
  const updated = await prisma.$transaction(async tx => {
    const request = await tx.citizenRequest.update({ where: { id: existing.id }, data: { status: next.status, assignedTeam: req.body.team, assignedAt: new Date(), assignedBy: req.user.sub } });
    await tx.citizenRequestEvent.create({ data: { municipalityId: request.municipalityId, requestId: request.id, type: 'REQUEST_ASSIGNED', status: request.status, actorId: req.user.sub, metadata: { team: req.body.team } } });
    return request;
  });
  res.json(updated);
});

router.post('/:id/status', authorize(...municipalRoles), validate(idParamsSchema, 'params'), validate(statusSchema), async (req, res) => {
  const existing = await prisma.citizenRequest.findFirst({ where: { id: req.params.id, municipalityId: req.user.municipalityId } });
  if (!existing) return res.status(404).json({ message: 'Demande introuvable' });
  const next = transitionCitizenRequest(existing, req.body.status, req.user);
  const updated = await prisma.$transaction(async tx => {
    const request = await tx.citizenRequest.update({ where: { id: existing.id }, data: { status: next.status, resolution: req.body.resolution || existing.resolution, resolvedAt: next.status === 'RESOLVED' ? new Date() : existing.resolvedAt } });
    await tx.citizenRequestEvent.create({ data: { municipalityId: request.municipalityId, requestId: request.id, type: 'STATUS_CHANGED', status: request.status, actorId: req.user.sub, metadata: {} } });
    await tx.notification.create({ data: { municipalityId: request.municipalityId, recipientId: request.citizenId, eventType: 'REQUEST_UPDATED', resourceType: 'CITIZEN_REQUEST', resourceId: request.id, title: 'Mise à jour de votre demande', body: `Statut: ${request.status}`, channels: ['IN_APP'] } });
    return request;
  });
  res.json(updated);
});

module.exports = router;
