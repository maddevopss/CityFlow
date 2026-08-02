const { randomUUID } = require('crypto');

const PARK_TYPES = Object.freeze(['NEIGHBORHOOD','REGIONAL','RIVERFRONT','SPORTS','NATURE','PLAZA','OTHER']);
const MAINTENANCE_LEVELS = Object.freeze(['MINIMAL','STANDARD','ENHANCED','INTENSIVE']);

function httpError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function getPark(db, { municipalityId, assetId }) {
  const assets = await db.$queryRawUnsafe(
    `SELECT "id", "assetType", "archivedAt" FROM "MunicipalAsset"
     WHERE "id"=$1::uuid AND "municipalityId"=$2 LIMIT 1`,
    assetId,
    municipalityId
  );
  const asset = assets[0];
  if (!asset) throw httpError(404, 'Actif municipal introuvable', 'ASSET_NOT_FOUND');
  if (asset.archivedAt) throw httpError(409, 'Actif municipal archivé', 'ASSET_ARCHIVED');
  if (asset.assetType !== 'PARK') throw httpError(409, 'L actif n est pas un parc', 'ASSET_TYPE_MISMATCH');

  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalPark" WHERE "assetId"=$1::uuid AND "municipalityId"=$2 LIMIT 1`,
    assetId,
    municipalityId
  );
  return rows[0] || null;
}

async function savePark(db, input) {
  return db.$transaction(async (tx) => {
    const assets = await tx.$queryRawUnsafe(
      `SELECT "id", "assetType", "archivedAt" FROM "MunicipalAsset"
       WHERE "id"=$1::uuid AND "municipalityId"=$2 FOR UPDATE`,
      input.assetId,
      input.municipalityId
    );
    const asset = assets[0];
    if (!asset) throw httpError(404, 'Actif municipal introuvable', 'ASSET_NOT_FOUND');
    if (asset.archivedAt) throw httpError(409, 'Actif municipal archivé', 'ASSET_ARCHIVED');
    if (asset.assetType !== 'PARK') throw httpError(409, 'L actif n est pas un parc', 'ASSET_TYPE_MISMATCH');

    const existing = await tx.$queryRawUnsafe(
      `SELECT "version" FROM "MunicipalPark" WHERE "assetId"=$1::uuid AND "municipalityId"=$2 FOR UPDATE`,
      input.assetId,
      input.municipalityId
    );
    if (existing[0] && Number(existing[0].version) !== Number(input.version)) {
      throw httpError(409, 'La fiche parc a été modifiée', 'PARK_VERSION_CONFLICT');
    }

    const rows = await tx.$queryRawUnsafe(
      `INSERT INTO "MunicipalPark" (
        "assetId","municipalityId","parkType","areaSquareMeters","openingHours","amenities",
        "accessible","hasRestrooms","hasParking","hasLighting","maintenanceLevel",
        "responsibleDepartment","version","createdBy","updatedBy"
      ) VALUES ($1::uuid,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11,$12,1,$13::uuid,$13::uuid)
      ON CONFLICT ("assetId") DO UPDATE SET
        "parkType"=EXCLUDED."parkType",
        "areaSquareMeters"=EXCLUDED."areaSquareMeters",
        "openingHours"=EXCLUDED."openingHours",
        "amenities"=EXCLUDED."amenities",
        "accessible"=EXCLUDED."accessible",
        "hasRestrooms"=EXCLUDED."hasRestrooms",
        "hasParking"=EXCLUDED."hasParking",
        "hasLighting"=EXCLUDED."hasLighting",
        "maintenanceLevel"=EXCLUDED."maintenanceLevel",
        "responsibleDepartment"=EXCLUDED."responsibleDepartment",
        "version"="MunicipalPark"."version"+1,
        "updatedBy"=EXCLUDED."updatedBy",
        "updatedAt"=NOW()
      RETURNING *`,
      input.assetId,
      input.municipalityId,
      input.parkType,
      input.areaSquareMeters ?? null,
      JSON.stringify(input.openingHours || {}),
      JSON.stringify(input.amenities || []),
      Boolean(input.accessible),
      Boolean(input.hasRestrooms),
      Boolean(input.hasParking),
      Boolean(input.hasLighting),
      input.maintenanceLevel,
      input.responsibleDepartment || null,
      input.actorId
    );

    await tx.$executeRawUnsafe(
      `INSERT INTO "MunicipalAssetEvent" (
        "id","municipalityId","assetId","actorId","eventType","metadata","idempotencyKey"
      ) VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'PARK_PROFILE_SAVED',$5::jsonb,$6)`,
      randomUUID(),
      input.municipalityId,
      input.assetId,
      input.actorId,
      JSON.stringify({ version: rows[0].version, parkType: input.parkType }),
      input.idempotencyKey || null
    );
    return rows[0];
  });
}

module.exports = { PARK_TYPES, MAINTENANCE_LEVELS, getPark, savePark };