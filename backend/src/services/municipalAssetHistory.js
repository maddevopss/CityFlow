const { randomUUID } = require('crypto');

function createHttpError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function safePage(value) {
  return Math.max(Number(value) || 1, 1);
}

function safeLimit(value) {
  return Math.min(Math.max(Number(value) || 25, 1), 100);
}

async function assertAsset(db, { municipalityId, assetId, includeArchived = true }) {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalAsset"
     WHERE "id"=$1::uuid AND "municipalityId"=$2
       AND ($3::boolean OR "archivedAt" IS NULL)
     LIMIT 1`,
    assetId,
    municipalityId,
    Boolean(includeArchived)
  );
  if (!rows[0]) throw createHttpError(404, 'Actif municipal introuvable', 'ASSET_NOT_FOUND');
  return rows[0];
}

async function listAssetHistory(db, input) {
  await assertAsset(db, input);
  const page = safePage(input.page);
  const limit = safeLimit(input.limit);
  const offset = (page - 1) * limit;
  const params = [
    input.municipalityId,
    input.assetId,
    input.eventType || null,
    input.actorId || null,
    input.from || null,
    input.to || null
  ];

  const [items, countRows] = await Promise.all([
    db.$queryRawUnsafe(
      `SELECT * FROM "MunicipalAssetEvent"
       WHERE "municipalityId"=$1 AND "assetId"=$2::uuid
         AND ($3::text IS NULL OR "eventType"=$3)
         AND ($4::uuid IS NULL OR "actorId"=$4::uuid)
         AND ($5::timestamptz IS NULL OR "createdAt">=$5::timestamptz)
         AND ($6::timestamptz IS NULL OR "createdAt"<=$6::timestamptz)
       ORDER BY "createdAt" DESC, "id" DESC LIMIT $7 OFFSET $8`,
      ...params,
      limit,
      offset
    ),
    db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS total FROM "MunicipalAssetEvent"
       WHERE "municipalityId"=$1 AND "assetId"=$2::uuid
         AND ($3::text IS NULL OR "eventType"=$3)
         AND ($4::uuid IS NULL OR "actorId"=$4::uuid)
         AND ($5::timestamptz IS NULL OR "createdAt">=$5::timestamptz)
         AND ($6::timestamptz IS NULL OR "createdAt"<=$6::timestamptz)`,
      ...params
    )
  ]);

  const total = Number(countRows[0]?.total || 0);
  return { items, pagination: { page, limit, total, totalPages: total ? Math.ceil(total / limit) : 0 } };
}

async function restoreAsset(db, input) {
  const asset = await assertAsset(db, input);
  if (!asset.archivedAt) throw createHttpError(409, 'L’actif n’est pas archivé', 'ASSET_NOT_ARCHIVED');

  const replay = await db.$queryRawUnsafe(
    `SELECT "id" FROM "MunicipalAssetEvent"
     WHERE "municipalityId"=$1 AND "assetId"=$2::uuid AND "idempotencyKey"=$3 LIMIT 1`,
    input.municipalityId,
    input.assetId,
    input.idempotencyKey
  );
  if (replay[0]) return { item: asset, replayed: true };

  return db.$transaction(async (tx) => {
    const updated = await tx.$queryRawUnsafe(
      `UPDATE "MunicipalAsset"
       SET "archivedAt"=NULL,"archivedBy"=NULL,"status"=$1,"version"="version"+1,"updatedBy"=$2::uuid,"updatedAt"=NOW()
       WHERE "id"=$3::uuid AND "municipalityId"=$4 AND "archivedAt" IS NOT NULL RETURNING *`,
      input.status,
      input.actorId,
      input.assetId,
      input.municipalityId
    );
    if (!updated[0]) throw createHttpError(409, 'La restauration est devenue invalide', 'ASSET_RESTORE_CONFLICT');

    await tx.$executeRawUnsafe(
      `INSERT INTO "MunicipalAssetEvent"
       ("id","municipalityId","assetId","actorId","eventType","metadata","idempotencyKey")
       VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'RESTORED',$5::jsonb,$6)`,
      randomUUID(), input.municipalityId, input.assetId, input.actorId,
      JSON.stringify({ reason: input.reason, restoredStatus: input.status, previousArchivedAt: asset.archivedAt }),
      input.idempotencyKey
    );
    return { item: updated[0], replayed: false };
  });
}

module.exports = { listAssetHistory, restoreAsset };
