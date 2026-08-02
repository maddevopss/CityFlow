const { randomUUID } = require('crypto');
const {
  ASSET_TYPES,
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  ASSET_OWNERSHIP_TYPES,
  normalizeAssetNumber
} = require('../domain/municipalAssets');

const SORT_COLUMNS = Object.freeze({
  assetNumber: '"assetNumber"',
  name: '"name"',
  type: '"assetType"',
  status: '"status"',
  updatedAt: '"updatedAt"',
  acquisitionDate: '"acquisitionDate"'
});

function createHttpError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function safeLimit(value) {
  return Math.min(Math.max(Number(value) || 25, 1), 100);
}

function safePage(value) {
  return Math.max(Number(value) || 1, 1);
}

async function getAsset(db, { municipalityId, id, includeArchived = false }) {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalAsset"
     WHERE "id"=$1::uuid AND "municipalityId"=$2
       AND ($3::boolean OR "archivedAt" IS NULL)
     LIMIT 1`,
    id,
    municipalityId,
    Boolean(includeArchived)
  );
  return rows[0] || null;
}

async function listAssets(db, input) {
  const page = safePage(input.page);
  const limit = safeLimit(input.limit);
  const offset = (page - 1) * limit;
  const sortColumn = SORT_COLUMNS[input.sortBy] || SORT_COLUMNS.updatedAt;
  const sortDirection = String(input.sortDirection || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const query = String(input.q || '').trim() || null;

  const params = [
    input.municipalityId,
    input.assetType || null,
    input.status || null,
    input.condition || null,
    input.ownershipType || null,
    query,
    Boolean(input.includeArchived),
    limit,
    offset
  ];

  const where = `
    "municipalityId"=$1
    AND ($2::text IS NULL OR "assetType"=$2)
    AND ($3::text IS NULL OR "status"=$3)
    AND ($4::text IS NULL OR "condition"=$4)
    AND ($5::text IS NULL OR "ownershipType"=$5)
    AND ($6::text IS NULL OR
      "assetNumber" ILIKE '%' || $6 || '%' OR
      "name" ILIKE '%' || $6 || '%' OR
      COALESCE("description", '') ILIKE '%' || $6 || '%' OR
      COALESCE("address", '') ILIKE '%' || $6 || '%')
    AND ($7::boolean OR "archivedAt" IS NULL)`;

  const [items, countRows] = await Promise.all([
    db.$queryRawUnsafe(
      `SELECT * FROM "MunicipalAsset" WHERE ${where}
       ORDER BY ${sortColumn} ${sortDirection}, "id" ASC
       LIMIT $8 OFFSET $9`,
      ...params
    ),
    db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS total FROM "MunicipalAsset" WHERE ${where}`,
      ...params.slice(0, 7)
    )
  ]);

  const total = Number(countRows[0]?.total || 0);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit)
    }
  };
}

async function findByIdempotencyKey(db, municipalityId, idempotencyKey) {
  if (!idempotencyKey) return null;
  const rows = await db.$queryRawUnsafe(
    `SELECT a.*
     FROM "MunicipalAssetEvent" e
     JOIN "MunicipalAsset" a
       ON a."id"=e."assetId" AND a."municipalityId"=e."municipalityId"
     WHERE e."municipalityId"=$1 AND e."idempotencyKey"=$2
       AND e."eventType"='ASSET_CREATED'
     LIMIT 1`,
    municipalityId,
    idempotencyKey
  );
  return rows[0] || null;
}

async function createAsset(db, input) {
  const existing = await findByIdempotencyKey(db, input.municipalityId, input.idempotencyKey);
  if (existing) return { item: existing, replayed: true };

  const id = randomUUID();
  const eventId = randomUUID();
  const assetNumber = normalizeAssetNumber(input.assetNumber);

  if (!assetNumber) throw createHttpError(400, 'Numéro d’actif invalide', 'ASSET_NUMBER_INVALID');

  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO "MunicipalAsset" (
          "id","municipalityId","assetNumber","name","description","assetType","status","condition",
          "ownershipType","department","address","location","acquisitionDate","commissionedAt",
          "acquisitionCost","usefulLifeYears","residualValue","metadata","createdBy","updatedBy"
        ) VALUES (
          $1::uuid,$2,$3,$4,$5,$6,'DRAFT',$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17::jsonb,$18::uuid,$18::uuid
        )`,
        id,
        input.municipalityId,
        assetNumber,
        input.name,
        input.description || null,
        input.assetType,
        input.condition || 'UNKNOWN',
        input.ownershipType || 'OWNED',
        input.department || null,
        input.address || null,
        JSON.stringify(input.location || null),
        input.acquisitionDate || null,
        input.commissionedAt || null,
        input.acquisitionCost ?? null,
        input.usefulLifeYears ?? null,
        input.residualValue ?? null,
        JSON.stringify(input.metadata || {}),
        input.actorId
      );
      await tx.$executeRawUnsafe(
        `INSERT INTO "MunicipalAssetEvent" (
          "id","municipalityId","assetId","actorId","eventType","toStatus","payload","idempotencyKey"
        ) VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'ASSET_CREATED','DRAFT',$5::jsonb,$6)`,
        eventId,
        input.municipalityId,
        id,
        input.actorId,
        JSON.stringify({ assetNumber, assetType: input.assetType }),
        input.idempotencyKey || null
      );
    });
  } catch (error) {
    if (error.code === 'P2002' || error.code === '23505') {
      const replay = await findByIdempotencyKey(db, input.municipalityId, input.idempotencyKey);
      if (replay) return { item: replay, replayed: true };
      throw createHttpError(409, 'Le numéro d’actif existe déjà', 'ASSET_NUMBER_CONFLICT');
    }
    throw error;
  }

  return {
    item: await getAsset(db, { municipalityId: input.municipalityId, id }),
    replayed: false
  };
}

async function updateAsset(db, input) {
  const current = await getAsset(db, {
    municipalityId: input.municipalityId,
    id: input.id,
    includeArchived: true
  });
  if (!current) throw createHttpError(404, 'Actif municipal introuvable', 'ASSET_NOT_FOUND');
  if (current.archivedAt) throw createHttpError(409, 'Actif municipal archivé', 'ASSET_ARCHIVED');
  if (Number(current.version) !== Number(input.version)) {
    throw createHttpError(409, 'La fiche a été modifiée par un autre utilisateur', 'ASSET_VERSION_CONFLICT');
  }

  const nextStatus = input.status || current.status;
  const eventId = randomUUID();
  const payload = {};
  for (const field of ['name','description','status','condition','ownershipType','department','address','location','commissionedAt','metadata']) {
    if (Object.prototype.hasOwnProperty.call(input, field)) payload[field] = input[field];
  }

  await db.$transaction(async (tx) => {
    const updated = await tx.$executeRawUnsafe(
      `UPDATE "MunicipalAsset" SET
        "name"=COALESCE($1,"name"),
        "description"=CASE WHEN $2::boolean THEN $3 ELSE "description" END,
        "status"=COALESCE($4,"status"),
        "condition"=COALESCE($5,"condition"),
        "ownershipType"=COALESCE($6,"ownershipType"),
        "department"=CASE WHEN $7::boolean THEN $8 ELSE "department" END,
        "address"=CASE WHEN $9::boolean THEN $10 ELSE "address" END,
        "location"=CASE WHEN $11::boolean THEN $12::jsonb ELSE "location" END,
        "commissionedAt"=CASE WHEN $13::boolean THEN $14 ELSE "commissionedAt" END,
        "metadata"=CASE WHEN $15::boolean THEN $16::jsonb ELSE "metadata" END,
        "updatedBy"=$17::uuid,
        "version"="version"+1,
        "updatedAt"=NOW()
       WHERE "id"=$18::uuid AND "municipalityId"=$19 AND "version"=$20 AND "archivedAt" IS NULL`,
      input.name || null,
      Object.prototype.hasOwnProperty.call(input, 'description'), input.description ?? null,
      input.status || null,
      input.condition || null,
      input.ownershipType || null,
      Object.prototype.hasOwnProperty.call(input, 'department'), input.department ?? null,
      Object.prototype.hasOwnProperty.call(input, 'address'), input.address ?? null,
      Object.prototype.hasOwnProperty.call(input, 'location'), JSON.stringify(input.location ?? null),
      Object.prototype.hasOwnProperty.call(input, 'commissionedAt'), input.commissionedAt ?? null,
      Object.prototype.hasOwnProperty.call(input, 'metadata'), JSON.stringify(input.metadata || {}),
      input.actorId,
      input.id,
      input.municipalityId,
      input.version
    );
    if (updated !== 1) throw createHttpError(409, 'Conflit de version', 'ASSET_VERSION_CONFLICT');

    await tx.$executeRawUnsafe(
      `INSERT INTO "MunicipalAssetEvent" (
        "id","municipalityId","assetId","actorId","eventType","fromStatus","toStatus","payload","idempotencyKey"
      ) VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'ASSET_UPDATED',$5,$6,$7::jsonb,$8)`,
      eventId,
      input.municipalityId,
      input.id,
      input.actorId,
      current.status,
      nextStatus,
      JSON.stringify(payload),
      input.idempotencyKey || null
    );
  });

  return getAsset(db, { municipalityId: input.municipalityId, id: input.id });
}

async function archiveAsset(db, input) {
  const current = await getAsset(db, {
    municipalityId: input.municipalityId,
    id: input.id,
    includeArchived: true
  });
  if (!current) throw createHttpError(404, 'Actif municipal introuvable', 'ASSET_NOT_FOUND');
  if (current.archivedAt) return { item: current, replayed: true };

  await db.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `UPDATE "MunicipalAsset"
       SET "archivedAt"=NOW(),"archivedBy"=$1::uuid,"updatedBy"=$1::uuid,
           "version"="version"+1,"updatedAt"=NOW()
       WHERE "id"=$2::uuid AND "municipalityId"=$3 AND "archivedAt" IS NULL`,
      input.actorId,
      input.id,
      input.municipalityId
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO "MunicipalAssetEvent" (
        "id","municipalityId","assetId","actorId","eventType","fromStatus","toStatus","payload","idempotencyKey"
      ) VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'ASSET_ARCHIVED',$5,$5,$6::jsonb,$7)`,
      randomUUID(),
      input.municipalityId,
      input.id,
      input.actorId,
      current.status,
      JSON.stringify({ reason: input.reason }),
      input.idempotencyKey || null
    );
  });

  return {
    item: await getAsset(db, { municipalityId: input.municipalityId, id: input.id, includeArchived: true }),
    replayed: false
  };
}

module.exports = {
  ASSET_TYPES,
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  ASSET_OWNERSHIP_TYPES,
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  archiveAsset
};
