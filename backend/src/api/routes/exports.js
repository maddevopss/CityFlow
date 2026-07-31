const express = require('express');
const prisma = require('../../db/prisma');

const router = express.Router();

router.get('/geojson', async (req, res) => {
  const { municipalityId, status } = req.query;
  const where = { status: status || { in: ['PLANNED', 'ACTIVE'] } };
  if (municipalityId) where.municipalityId = parseInt(municipalityId);
  
  const events = await prisma.roadEvent.findMany({ where });
  
  const features = events.map(event => ({
    type: 'Feature',
    geometry: event.geometry,
    properties: {
      id: event.id,
      eventType: event.eventType,
      subtype: event.subtype,
      startTime: event.startTime,
      endTime: event.endTime,
      impacts: event.impacts,
      details: event.details
    }
  }));

  res.json({ type: 'FeatureCollection', features });
});

module.exports = router;
