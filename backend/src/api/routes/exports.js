const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { publicReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const querySchema = Joi.object({
  municipalityId: Joi.number().integer().positive().required(),
  eventType: Joi.string()
    .valid('CONSTRUCTION', 'REGULATION', 'EVENT', 'INCIDENT', 'RESTRICTION')
    .optional()
});

router.get('/geojson', publicReadLimiter, async (req, res) => {
  const { error, value } = querySchema.validate(req.query, {
    abortEarly: false,
    convert: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const where = {
    municipalityId: value.municipalityId,
    status: { in: ['PLANNED', 'ACTIVE'] }
  };

  if (value.eventType) {
    where.eventType = value.eventType;
  }

  const events = await prisma.roadEvent.findMany({
    where,
    select: {
      id: true,
      eventType: true,
      subtype: true,
      geometry: true,
      startTime: true,
      endTime: true,
      impacts: true,
      status: true,
      updatedAt: true
    },
    orderBy: { startTime: 'asc' }
  });

  const features = events.map((event) => ({
    type: 'Feature',
    id: event.id,
    geometry: event.geometry,
    properties: {
      eventType: event.eventType,
      subtype: event.subtype,
      startTime: event.startTime,
      endTime: event.endTime,
      impacts: event.impacts,
      status: event.status,
      updatedAt: event.updatedAt
    }
  }));

  res.set({
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    'Content-Type': 'application/geo+json; charset=utf-8'
  });

  return res.json({
    type: 'FeatureCollection',
    features
  });
});

module.exports = router;
