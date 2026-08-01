const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { permitReadLimiter, permitWriteLimiter } = require('../middleware/rateLimiters');
const { listTeams, listVehicles, assignWorkOrder } = require('../../services/publicWorksAssignments');

const router = express.Router();
const uuid = Joi.string().guid({ version: ['uuidv4'] });
const assignmentSchema = Joi.object({
  teamId: uuid.allow(null),
  vehicleId: uuid.allow(null)
}).or('teamId', 'vehicleId');

router.get('/teams', permitReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res) => {
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  return res.json({ items: await listTeams(prisma, req.user.municipalityId) });
});

router.get('/vehicles', permitReadLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'INSPECTOR', 'VIEWER'), async (req, res) => {
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  return res.json({ items: await listVehicles(prisma, req.user.municipalityId) });
});

router.post('/work-orders/:workOrderId/assign', permitWriteLimiter, authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), async (req, res, next) => {
  try {
    const idResult = uuid.required().validate(req.params.workOrderId);
    const bodyResult = assignmentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (idResult.error || bodyResult.error) return res.status(400).json({ message: 'Données invalides' });
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    const item = await assignWorkOrder(prisma, {
      municipalityId: req.user.municipalityId,
      workOrderId: idResult.value,
      teamId: bodyResult.value.teamId || null,
      vehicleId: bodyResult.value.vehicleId || null,
      actorId: req.user.sub
    });
    return res.json({ item });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    return next(error);
  }
});

module.exports = router;