const { appendEventAudit } = require('./eventAudit');
const { evaluatePermitDocumentCompliance } = require('./permitDocumentCompliance');
const { resolveRequiredDocumentTypes } = require('./permitDocumentRequirementCatalog');

function buildIssuanceNumber(municipalityId, issuedAt, permitId) {
  const year = issuedAt.getUTCFullYear();
  const suffix = permitId.replace(/-/g, '').slice(0, 10).toUpperCase();
  return `CF-${municipalityId}-${year}-${suffix}`;
}

async function getPermitIssuance(db, { municipalityId, permitId }) {
  const rows = await db.$queryRawUnsafe(
    'SELECT * FROM "PermitIssuance" WHERE "municipalityId" = $1 AND "permitId" = $2::uuid LIMIT 1',
    municipalityId,
    permitId
  );
  return rows[0] || null;
}

async function issuePermit(db, { municipalityId, permitId, actorId, actorRole }) {
  return db.$transaction(async (tx) => {
    const permit = await tx.roadEvent.findFirst({
      where: { id: permitId, municipalityId, sourceType: 'PERMIT' },
      select: { id: true, status: true, subtype: true, details: true }
    });
    if (!permit) {
      const error = new Error('Permis introuvable');
      error.code = 'PERMIT_NOT_FOUND';
      throw error;
    }

    const existing = await getPermitIssuance(tx, { municipalityId, permitId });
    if (existing) return existing;

    if (permit.status !== 'APPROVED') {
      const error = new Error('Le permis doit être approuvé avant sa délivrance');
      error.code = 'PERMIT_NOT_APPROVED';
      throw error;
    }

    const requiredDocumentTypes = await resolveRequiredDocumentTypes(tx, {
      municipalityId,
      permitSubtype: permit.subtype,
      fallback: permit.details?.requiredDocumentTypes || []
    });
    const compliance = evaluatePermitDocumentCompliance({
      ...(permit.details || {}),
      requiredDocumentTypes
    });
    if (!compliance.compliant) {
      const error = new Error('Les pièces justificatives obligatoires ne sont pas toutes acceptées');
      error.code = 'PERMIT_DOCUMENTS_INCOMPLETE';
      error.compliance = compliance;
      throw error;
    }

    const feeRows = await tx.$queryRawUnsafe(
      'SELECT * FROM "PermitFee" WHERE "municipalityId" = $1 AND "permitId" = $2::uuid LIMIT 1',
      municipalityId,
      permitId
    );
    const fee = feeRows[0];
    if (!fee || !['PAID', 'WAIVED'].includes(fee.status)) {
      const error = new Error('Les frais doivent être payés ou dispensés avant la délivrance');
      error.code = 'PERMIT_FEE_UNSETTLED';
      throw error;
    }

    const issuedAt = new Date();
    const issuanceNumber = buildIssuanceNumber(municipalityId, issuedAt, permitId);
    const rows = await tx.$queryRawUnsafe(
      `INSERT INTO "PermitIssuance" ("municipalityId", "permitId", "issuanceNumber", "issuedBy", "issuedAt")
       VALUES ($1, $2::uuid, $3, $4::uuid, $5::timestamptz)
       ON CONFLICT ("municipalityId", "permitId") DO UPDATE SET "permitId" = EXCLUDED."permitId"
       RETURNING *`,
      municipalityId,
      permitId,
      issuanceNumber,
      actorId,
      issuedAt.toISOString()
    );
    const issuance = rows[0];

    await appendEventAudit({
      eventId: permitId,
      municipalityId,
      action: 'PERMIT_ISSUED',
      actorId,
      actorRole,
      previousStatus: permit.status,
      newStatus: permit.status,
      metadata: { issuanceNumber, feeStatus: fee.status },
      db: tx
    });

    return issuance;
  });
}

module.exports = { buildIssuanceNumber, getPermitIssuance, issuePermit };
