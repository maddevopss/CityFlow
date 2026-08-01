async function assertPermit(db, { municipalityId, permitId }) {
  const permit = await db.roadEvent.findFirst({
    where: { id: permitId, municipalityId, sourceType: 'PERMIT' },
    select: { id: true }
  });
  if (!permit) {
    const error = new Error('Permis introuvable');
    error.code = 'PERMIT_NOT_FOUND';
    throw error;
  }
}

async function waivePermitFee(db, { municipalityId, permitId, reason, actorId }) {
  await assertPermit(db, { municipalityId, permitId });
  const rows = await db.$queryRawUnsafe(
    'SELECT * FROM "PermitFee" WHERE "municipalityId" = $1 AND "permitId" = $2::uuid LIMIT 1',
    municipalityId,
    permitId
  );
  const existing = rows[0];
  if (!existing) {
    const error = new Error('Aucun frais n’est établi pour ce permis');
    error.code = 'PERMIT_FEE_NOT_FOUND';
    throw error;
  }
  if (existing.status === 'PAID') {
    const error = new Error('Un frais payé ne peut pas être dispensé');
    error.code = 'PERMIT_FEE_ALREADY_PAID';
    throw error;
  }
  if (existing.status === 'WAIVED' && existing.waivedReason === reason) return existing;

  const updated = await db.$queryRawUnsafe(
    `UPDATE "PermitFee"
       SET "status" = 'WAIVED', "waivedReason" = $1, "waivedBy" = $2::uuid,
           "waivedAt" = CURRENT_TIMESTAMP, "paymentReference" = NULL,
           "paidBy" = NULL, "paidAt" = NULL, "updatedAt" = CURRENT_TIMESTAMP
     WHERE "municipalityId" = $3 AND "permitId" = $4::uuid
     RETURNING *`,
    reason,
    actorId,
    municipalityId,
    permitId
  );
  return updated[0];
}

module.exports = { waivePermitFee };
