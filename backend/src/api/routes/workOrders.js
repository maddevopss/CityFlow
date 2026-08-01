const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { permitReadLimiter, permitWriteLimiter } = require('../middleware/rateLimiters');
const { listWorkOrders, getWorkOrder, createWorkOrder, transitionWorkOrder, STATUSES, PRIORITIES } = require('../../services/workOrders');

const router = express.Router();
const uuid = Joi.string().guid({ version: ['uuidv4'] });
const createSchema = Joi.object({
  number: Joi.string().trim().max(80),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(3).max(5000).required(),
  category: Joi.string().trim().max(80).default('OTHER'),
  priority: Joi.string().valid(...PRIORITIES).default('NORMAL'),
  location: Joi.object().allow(null),
  citizenRequestId: uuid.allow(null),
  roadEventId: uuid.allow(null),
  permitId: uuid.allow(null),
  plannedStartAt: Joi.date().iso().allow(null),
  plannedEndAt: Joi.date().iso().min(Joi.ref('plannedStartAt')).allow(null)
});
const transitionSchema = Joi.object({
  status: Joi.string().valid(...STATUSES).required(),
  resolution: Joi.string().trim().max(5000).allow('', null)
});

router.get('/', permitReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res) => {
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  const items = await listWorkOrders(prisma, { municipalityId: req.user.municipalityId, ...req.query });
  return res.json({ items });
});

router.get('/:id', permitReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res) => {
  const { error, value } = uuid.required().validate(req.params.id);
  if (error) return res.status(400).json({ message: 'Identifiant invalide' });
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  const item = await getWorkOrder(prisma, { municipalityId: req.user.municipalityId, id: value });
  return item ? res.json({ item }) : res.status(404).json({ message: 'Ordre de travail introuvable' });
});

router.post('/', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Données invalides', details: error.details });
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  const item = await createWorkOrder(prisma, { ...value, municipalityId: req.user.municipalityId, actorId: req.user.sub });
  return res.status(201).json({ item });
});

router.post('/:id/transition', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.id);
    const bodyResult = transitionSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (idResult.error || bodyResult.error) return res.status(400).json({ message: 'Données invalides' });
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const item = await transitionWorkOrder(prisma, { municipalityId: req.user.municipalityId, id: idResult.value, actorId: req.user.sub, toStatus: bodyResult.value.status, resolution: bodyResult.value.resolution });
    return res.json({ item });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    return next(error);
  }
});

module.exports = router;