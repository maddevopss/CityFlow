const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { queue } = require('../../workers/queue');

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

async function findMunicipalEvent(req, res) {
  const event = await prisma.roadEvent.findFirst({
    where: {
      id: req.params.id,
      municipalityId: req.user.municipalityId
    }
  });

  if (!event) {
    res.status(404).json({ message: 'Événement introuvable' });
    return null;
  }

  return event;
}

function emitEventChanged(req, event) {
  const io = req.app.get('io');
  if (io) {
    io.to(`municipality_${event.municipalityId}`).emit('eventChanged', event);
  }
}

async function transition(req, res, { from, to, data = {}, diffuse = false }) {
  const event = await findMunicipalEvent(req, res);
  if (!event) return;

  const allowedFrom = Array.isArray(from) ? from : [from];
  if (!allowedFrom.includes(event.status)) {
    return res.status(409).json({
      message: `Transition impossible de ${event.status} vers ${to}`,
      currentStatus: event.status,
      allowedFrom
    });
  }

  const updated = await prisma.roadEvent.update({
    where: { id: event.id },
    data: {
      status: to,
      statusReason: null,
      ...data
    }
  });

  if (diffuse) {
    await queue.add('diffuseEvent', { eventId: updated.id });
  }

  emitEventChanged(req, updated);
  return res.json(updated);
}

router.post('/', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const event = await prisma.roadEvent.create({
    data: {
      ...value,
      status: 'DRAFT',
      municipalityId: req.user.municipalityId,
      createdBy: req.user.sub
    }
  });

  emitEventChanged(req, event);
  res.status(201).json(event);
});

router.post('/:id/submit', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  return transition(req, res, {
    from: ['DRAFT', 'REJECTED'],
    to: 'SUBMITTED',
    data: {
      submittedBy: req.user.sub,
      submittedAt: new Date()
    }
  });
});

router.post('/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => {
  return transition(req, res, {
    from: 'SUBMITTED',
    to: 'APPROVED',
    data: {
      approvedBy: req.user.sub,
      approvedAt: new Date()
    }
  });
});

router.post('/:id/reject', authenticate, authorize('ADMIN'), async (req, res) => {
  const { error, value } = reasonSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const event = await findMunicipalEvent(req, res);
  if (!event) return;

  if (event.status !== 'SUBMITTED') {
    return res.status(409).json({
      message: `Transition impossible de ${event.status} vers REJECTED`,
      currentStatus: event.status,
      allowedFrom: ['SUBMITTED']
    });
  }

  const updated = await prisma.roadEvent.update({
    where: { id: event.id },
    data: {
      status: 'REJECTED',
      statusReason: value.reason
    }
  });

  emitEventChanged(req, updated);
  return res.json(updated);
});

router.post('/:id/publish', authenticate, authorize('ADMIN'), async (req, res) => {
  return transition(req, res, {
    from: 'APPROVED',
    to: 'PLANNED',
    data: {
      publishedBy: req.user.sub,
      publishedAt: new Date()
    },
    diffuse: true
  });
});

router.post('/:id/activate', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  return transition(req, res, {
    from: 'PLANNED',
    to: 'ACTIVE',
    diffuse: true
  });
});

router.post('/:id/close', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  return transition(req, res, {
    from: ['PLANNED', 'ACTIVE'],
    to: 'CLOSED',
    data: {
      closedBy: req.user.sub,
      closedAt: new Date()
    },
    diffuse: true
  });
});

router.get('/', authenticate, async (req, res) => {
  const { eventType, status } = req.query;
  const where = {
    municipalityId: req.user.municipalityId
  };

  if (eventType) where.eventType = eventType;
  if (status) where.status = status;

  const events = await prisma.roadEvent.findMany({
    where,
    orderBy: { startTime: 'asc' }
  });

  res.json(events);
});

module.exports = router;
