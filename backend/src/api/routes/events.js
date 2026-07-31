const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { queue } = require('../../workers/queue');
const { appendEventAudit, listEventAudit } = require('../../services/eventAudit');

const router = express.Router();

const createSchema = Joi.object({
  eventType: Joi.string().valid('CONSTRUCTION', 'REGULATION', 'EVENT', 'INCIDENT', 'RESTRICTION').required(),
  subtype: Joi.string().required(),
  geometry: Joi.object().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().optional(),
  impacts: Joi.array().items(Joi.string()).default([]),
  details: Joi.object().default({}),
  sourceType: Joi.string().default('PERMIT'),
  sourceRef: Joi.string().optional(),
  recurrenceRule: Joi.string().optional()
});

const reasonSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(1000).required()
});

async function findMunicipalEvent(req, res, db = prisma) {
  const event = await db.roadEvent.findFirst({
    where: { id: req.params.id, municipalityId: req.user.municipalityId }
  });

  if (!event) {
    res.status(404).json({ message: 'Événement introuvable' });
    return null;
  }

  return event;
}

function emitEventChanged(req, event) {
  const io = req.app.get('io');
  if (io) io.to(`municipality_${event.municipalityId}`).emit('eventChanged', event);
}

async function audit(req, event, action, previousStatus, reason = null, db = prisma) {
  await appendEventAudit({
    eventId: event.id,
    municipalityId: event.municipalityId,
    action,
    actorId: req.user.sub,
    actorRole: req.user.role,
    previousStatus,
    newStatus: event.status,
    reason,
    db
  });
}

async function transition(req, res, { from, to, action, data = {}, diffuse = false, reason = null }) {
  let updated;

  const result = await prisma.$transaction(async (tx) => {
    const event = await findMunicipalEvent(req, res, tx);
    if (!event) return null;

    const allowedFrom = Array.isArray(from) ? from : [from];
    if (!allowedFrom.includes(event.status)) {
      return {
        conflict: {
          message: `Transition impossible de ${event.status} vers ${to}`,
          currentStatus: event.status,
          allowedFrom
        }
      };
    }

    const next = await tx.roadEvent.update({
      where: { id: event.id },
      data: { status: to, statusReason: reason, ...data }
    });

    await audit(req, next, action, event.status, reason, tx);
    return { updated: next };
  });

  if (!result) return;
  if (result.conflict) return res.status(409).json(result.conflict);

  updated = result.updated;

  if (diffuse) await queue.add('diffuseEvent', { eventId: updated.id });

  emitEventChanged(req, updated);
  return res.json(updated);
}

router.post('/', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const event = await prisma.$transaction(async (tx) => {
    const created = await tx.roadEvent.create({
      data: {
        ...value,
        status: 'DRAFT',
        municipalityId: req.user.municipalityId,
        createdBy: req.user.sub
      }
    });

    await audit(req, created, 'CREATED', null, null, tx);
    return created;
  });

  emitEventChanged(req, event);
  res.status(201).json(event);
});

router.post('/:id/submit', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => transition(req, res, {
  from: ['DRAFT', 'REJECTED'],
  to: 'SUBMITTED',
  action: 'SUBMITTED',
  data: { submittedBy: req.user.sub, submittedAt: new Date() }
}));

router.post('/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => transition(req, res, {
  from: 'SUBMITTED',
  to: 'APPROVED',
  action: 'APPROVED',
  data: { approvedBy: req.user.sub, approvedAt: new Date() }
}));

router.post('/:id/reject', authenticate, authorize('ADMIN'), async (req, res) => {
  const { error, value } = reasonSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  return transition(req, res, {
    from: 'SUBMITTED',
    to: 'REJECTED',
    action: 'REJECTED',
    reason: value.reason
  });
});

router.post('/:id/publish', authenticate, authorize('ADMIN'), async (req, res) => transition(req, res, {
  from: 'APPROVED',
  to: 'PLANNED',
  action: 'PUBLISHED',
  data: { publishedBy: req.user.sub, publishedAt: new Date() },
  diffuse: true
}));

router.post('/:id/activate', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => transition(req, res, {
  from: 'PLANNED',
  to: 'ACTIVE',
  action: 'ACTIVATED',
  diffuse: true
}));

router.post('/:id/close', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => transition(req, res, {
  from: ['PLANNED', 'ACTIVE'],
  to: 'CLOSED',
  action: 'CLOSED',
  data: { closedBy: req.user.sub, closedAt: new Date() },
  diffuse: true
}));

router.get('/:id/audit', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  const event = await findMunicipalEvent(req, res);
  if (!event) return;

  const entries = await listEventAudit({
    eventId: event.id,
    municipalityId: req.user.municipalityId
  });

  res.json(entries);
});

router.get('/', authenticate, async (req, res) => {
  const { eventType, status } = req.query;
  const where = { municipalityId: req.user.municipalityId };

  if (eventType) where.eventType = eventType;
  if (status) where.status = status;

  const events = await prisma.roadEvent.findMany({
    where,
    orderBy: { startTime: 'asc' }
  });

  res.json(events);
});

module.exports = router;
