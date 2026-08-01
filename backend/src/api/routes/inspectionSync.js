const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const operationSchema = Joi.object({
  idempotencyKey: Joi.string().trim().min(8).max(120).required(),
  inspectionId: Joi.string().uuid().required(),
  action: Joi.string().valid('COMPLETE').required(),
  baseUpdatedAt: Joi.date().iso().required(),
  payload: Joi.object({
    outcome: Joi.string().valid('COMPLIANT', 'NON_COMPLIANT', 'FOLLOW_UP_REQUIRED').required(),
    findings: Joi.string().trim().min(3).max(8000).required(),
    completedAt: Joi.date().iso().required()
  }).required()
});
const batchSchema = Joi.object({ operations: Joi.array().items(operationSchema).min(1).max(50).required() });

router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'));

router.post('/batch', async (req, res) => {
  const { error, value } = batchSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Lot de synchronisation invalide', details: error.details.map(d => d.message) });

  const results = [];
  for (const operation of value.operations) {
    const inspection = await prisma.inspection.findFirst({
      where: {
        id: operation.inspectionId,
        municipalityId: req.user.municipalityId,
        ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
      },
      select: { id: true, status: true, updatedAt: true }
    });

    if (!inspection) {
      results.push({ idempotencyKey: operation.idempotencyKey, status: 'NOT_FOUND' });
      continue;
    }
    if (inspection.updatedAt.getTime() !== new Date(operation.baseUpdatedAt).getTime()) {
      results.push({ idempotencyKey: operation.idempotencyKey, status: 'CONFLICT', serverUpdatedAt: inspection.updatedAt });
      continue;
    }
    if (inspection.status !== 'SCHEDULED') {
      results.push({ idempotencyKey: operation.idempotencyKey, status: 'REJECTED', reason: 'Inspection non planifiée' });
      continue;
    }

    const updated = await prisma.inspection.update({
      where: { id: inspection.id },
      data: {
        status: 'COMPLETED',
        outcome: operation.payload.outcome,
        findings: operation.payload.findings,
        completedAt: new Date(operation.payload.completedAt),
        completedBy: req.user.sub
      },
      select: { id: true, updatedAt: true }
    });
    results.push({ idempotencyKey: operation.idempotencyKey, status: 'APPLIED', inspection: updated });
  }

  res.json({ results });
});

module.exports = router;
