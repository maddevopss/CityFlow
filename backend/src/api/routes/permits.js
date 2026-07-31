const express = require('express');
const crypto = require('crypto');
const prisma = require('../../db/prisma');

const router = express.Router();

router.post('/hook', async (req, res) => {
  const { permit_id, contractor, start_date, end_date, geometry, impacts, municipalityId } = req.body;
  
  if (!permit_id || !start_date) {
    return res.status(400).json({ message: 'Champs obligatoires manquants' });
  }

  const event = await prisma.roadEvent.create({
    data: {
      municipalityId: parseInt(municipalityId),
      eventType: 'CONSTRUCTION',
      subtype: 'travaux',
      geometry: geometry || { type: 'Point', coordinates: [0, 0] },
      startTime: new Date(start_date),
      endTime: end_date ? new Date(end_date) : null,
      impacts: impacts || [],
      details: { contractor, permit_id },
      sourceType: 'PERMIT',
      sourceRef: permit_id,
      status: 'DRAFT'
    }
  });

  res.status(201).json({ eventId: event.id, status: 'draft' });
});

module.exports = router;
