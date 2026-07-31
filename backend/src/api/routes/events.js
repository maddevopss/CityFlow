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

router.post('/', authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT'), async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const event = await prisma.roadEvent.create({
    data: {
      ...value,
      municipalityId: req.user.municipalityId,
      createdBy: req.user.sub
    }
  });

  await queue.add('diffuseEvent', { eventId: event.id });
  
  const io = req.app.get('io');
  io.to(`municipality_${event.municipalityId}`).emit('eventChanged', event);

  res.status(201).json(event);
});

router.get('/', async (req, res) => {
  const { municipalityId, eventType, status } = req.query;
  const where = {};
  if (municipalityId) where.municipalityId = parseInt(municipalityId);
  if (eventType) where.eventType = eventType;
  if (status) where.status = status;
  
  const events = await prisma.roadEvent.findMany({
    where,
    orderBy: { startTime: 'asc' }
  });
  
  res.json(events);
});

module.exports = router;
