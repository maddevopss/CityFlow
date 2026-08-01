const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'));

router.get('/:inspectionId', async (req, res) => {
  const { error } = Joi.string().uuid().validate(req.params.inspectionId);
  if (error) return res.status(400).json({ message: 'Identifiant d’inspection invalide' });

  const inspection = await prisma.inspection.findFirst({
    where: {
      id: req.params.inspectionId,
      municipalityId: req.user.municipalityId,
      ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
    },
    include: { evidence: { orderBy: { capturedAt: 'asc' } } }
  });
  if (!inspection) return res.status(404).json({ message: 'Inspection introuvable' });
  if (inspection.status !== 'COMPLETED') return res.status(409).json({ message: 'Le rapport exige une inspection terminée' });

  const payload = {
    inspectionId: inspection.id,
    address: inspection.address,
    inspectionType: inspection.inspectionType,
    outcome: inspection.outcome,
    findings: inspection.findings,
    completedAt: inspection.completedAt,
    evidence: inspection.evidence.map(item => ({ id: item.id, sha256: item.sha256, fileName: item.fileName }))
  };
  const canonical = JSON.stringify(payload);
  const sha256 = crypto.createHash('sha256').update(canonical).digest('hex');
  res.json({ payload, sha256, signature: { status: 'UNSIGNED', algorithm: 'SHA-256' } });
});

module.exports = router;
