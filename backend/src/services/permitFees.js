async function assertPermit(db, { municipalityId, permitId }) {
  const permit = await db.roadEvent.findFirst({ where: { id: permitId, municipalityId, sourceType: 'PERMIT' }, select: { id: true, status: true } });
  if (!permit) { const error = new Error('Permis introuvable'); error.code = 'PERMIT_NOT_FOUND'; throw error; }
  return permit;
}

async function getPermitFee(db, { municipalityId, permitId }) {
  await assertPermit(db, { municipalityId, permitId });
  const rows = await db.$queryRawUnsafe(
    'SELECT * FROM "PermitFee" WHERE "municipalityId" = $1 AND "permitId" = $2::uuid LIMIT 1',
    municipalityId,
    permitId
  );
  return rows[0] || null;
}

async function assessPermitFee(db, { municipalityId, permitId, amountCents, currency = 'CAD', note = null, actorId }) {
  await assertPermit(db, { municipalityId, permitId });
  const rows = await db.$queryRawUnsafe(
    `INSERT INTO "PermitFee" ("municipalityId", "permitId", "amountCents", "currency", "status", "note", "assessedBy", "assessedAt", "updatedAt")
     VALUES ($1, $2::uuid, $3, $4, 'DUE', $5, $6::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT ("municipalityId", "permitId") DO UPDATE SET
       "amountCents" = EXCLUDED."amountCents", "currency" = EXCLUDED."currency", "status" = 'DUE',
       "note" = EXCLUDED."note", "assessedBy" = EXCLUDED."assessedBy", "assessedAt" = CURRENT_TIMESTAMP,
       "paymentReference" = NULL, "paidBy" = NULL, "paidAt" = NULL, "updatedAt" = CURRENT_TIMESTAMP
     RETURNING *`,
    municipalityId,
    permitId,
    amountCents,
    currency,
    note,
    actorId
  );
  return rows[0];
}

async function markPermitFeePaid(db, { municipalityId, permitId, paymentReference, paidAt, actorId }) {
  await assertPermit(db, { municipalityId, permitId });
  const existing = await getPermitFee(db, { municipalityId, permitId });
  if (!existing) { const error = new Error('Aucun frais n’est établi pour ce permis'); error.code = 'PERMIT_FEE_NOT_FOUND'; throw error; }
  if (existing.status === 'PAID') {
    if (existing.paymentReference === paymentReference) return existing;
    const error = new Error('Le paiement du permis est déjà enregistré'); error.code = 'PERMIT_FEE_ALREADY_PAID'; throw error;
  }
  const rows = await db.$queryRawUnsafe(
    `UPDATE "PermitFee" SET "status" = 'PAID', "paymentReference" = $1, "paidBy" = $2::uuid,
       "paidAt" = COALESCE($3::timestamptz, CURRENT_TIMESTAMP), "updatedAt" = CURRENT_TIMESTAMP
     WHERE "municipalityId" = $4 AND "permitId" = $5::uuid RETURNING *`,
    paymentReference,
    actorId,
    paidAt || null,
    municipalityId,
    permitId
  );
  return rows[0];
}

module.exports = { getPermitFee, assessPermitFee, markPermitFeePaid };
