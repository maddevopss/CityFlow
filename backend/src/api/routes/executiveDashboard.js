const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_MANAGER', 'EXECUTIVE_VIEWER'));

function numberFrom(rows, key = 'count') {
  const value = rows?.[0]?.[key];
  return typeof value === 'bigint' ? Number(value) : Number(value || 0);
}

router.get('/', async (req, res) => {
  const schema = Joi.object({ from: Joi.date().iso(), to: Joi.date().iso().min(Joi.ref('from')) });
  const { error, value } = schema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Période exécutive invalide' });

  const from = value.from ? new Date(value.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = value.to ? new Date(value.to) : new Date();
  const municipalityId = req.user.municipalityId;

  const [inspections, permits, assets, workOrders, reports] = await Promise.all([
    prisma.$queryRawUnsafe('SELECT COUNT(*)::bigint AS count, COUNT(*) FILTER (WHERE status = $2)::bigint AS completed, COUNT(*) FILTER (WHERE outcome = $3)::bigint AS non_compliant FROM "Inspection" WHERE "municipalityId" = $1 AND "createdAt" BETWEEN $4 AND $5', municipalityId, 'COMPLETED', 'NON_COMPLIANT', from, to),
    prisma.$queryRawUnsafe('SELECT COUNT(*)::bigint AS count, COUNT(*) FILTER (WHERE status = $2)::bigint AS issued, COUNT(*) FILTER (WHERE status IN ($3,$4))::bigint AS pending FROM "PermitApplication" WHERE "municipalityId" = $1 AND "createdAt" BETWEEN $5 AND $6', municipalityId, 'ISSUED', 'SUBMITTED', 'UNDER_REVIEW', from, to),
    prisma.$queryRawUnsafe('SELECT COUNT(*)::bigint AS count, COUNT(*) FILTER (WHERE status = $2)::bigint AS out_of_service, COUNT(*) FILTER (WHERE criticality = $3)::bigint AS critical FROM "Asset" WHERE "municipalityId" = $1', municipalityId, 'OUT_OF_SERVICE', 'CRITICAL'),
    prisma.$queryRawUnsafe('SELECT COUNT(*)::bigint AS count, COUNT(*) FILTER (WHERE status IN ($2,$3,$4))::bigint AS backlog, COALESCE(SUM("actualCost"),0)::numeric AS actual_cost FROM "WorkOrder" WHERE "municipalityId" = $1 AND "createdAt" BETWEEN $5 AND $6', municipalityId, 'DRAFT', 'PLANNED', 'ASSIGNED', from, to),
    prisma.$queryRawUnsafe('SELECT COUNT(*)::bigint AS count, COUNT(*) FILTER (WHERE status IN ($2,$3,$4))::bigint AS open, COUNT(*) FILTER (WHERE status = $5)::bigint AS resolved FROM "CitizenReport" WHERE "municipalityId" = $1 AND "createdAt" BETWEEN $6 AND $7', municipalityId, 'RECEIVED', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', from, to)
  ]);

  const inspectionRow = inspections[0] || {};
  const permitRow = permits[0] || {};
  const assetRow = assets[0] || {};
  const workRow = workOrders[0] || {};
  const reportRow = reports[0] || {};

  res.json({
    period: { from: from.toISOString(), to: to.toISOString() },
    generatedAt: new Date().toISOString(),
    municipalityId,
    modules: {
      inspections: { total: numberFrom(inspections), completed: Number(inspectionRow.completed || 0), nonCompliant: Number(inspectionRow.non_compliant || 0) },
      permits: { total: numberFrom(permits), issued: Number(permitRow.issued || 0), pending: Number(permitRow.pending || 0) },
      assets: { total: numberFrom(assets), outOfService: Number(assetRow.out_of_service || 0), critical: Number(assetRow.critical || 0) },
      publicWorks: { total: numberFrom(workOrders), backlog: Number(workRow.backlog || 0), actualCost: Number(workRow.actual_cost || 0) },
      citizenReports: { total: numberFrom(reports), open: Number(reportRow.open || 0), resolved: Number(reportRow.resolved || 0) }
    }
  });
});

module.exports = router;
