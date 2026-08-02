const { randomUUID } = require('crypto');

function createHttpError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function assertBuildingAsset(db, municipalityId, assetId) {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalAsset" WHERE "id"=$1::uuid AND "municipalityId"=$2 AND "archivedAt" IS NULL LIMIT 1`,
    assetId,
    municipalityId
  );
  const asset = rows[0];
  if (!asset) throw createHttpError(404, 'Actif municipal introuvable', 'ASSET_NOT_FOUND');
  if (asset.assetType !== 'BUILDING') throw createHttpError(409, 'L’actif n’est pas un bâtiment', 'ASSET_TYPE_MISMATCH');
  return asset;
}

async function getBuilding(db, { municipalityId, assetId }) {
  await assertBuildingAsset(db, municipalityId, assetId);
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalBuilding" WHERE "municipalityId"=$1 AND "assetId"=$2::uuid LIMIT 1`,
    municipalityId,
    assetId
  );
  return rows[0] || null;
}

async function upsertBuilding(db, input) {
  const asset = await assertBuildingAsset(db, input.municipalityId, input.assetId);
  const currentRows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalBuilding" WHERE "municipalityId"=$1 AND "assetId"=$2::uuid LIMIT 1`,
    input.municipalityId,
    input.assetId
  );
  const current = currentRows[0] || null;
  if (current && current.version !== input.version) {
    throw createHttpError(409, 'La fiche bâtiment a été modifiée', 'BUILDING_VERSION_CONFLICT');
  }
  const id = current?.id || randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO "MunicipalBuilding" ("id","municipalityId","assetId","buildingUse","constructionYear","floorCount","grossAreaM2","occupancyCapacity","heritageStatus","accessibilityStatus","fireSafetyStatus","energyRating","lastRenovationYear","metadata","version","createdBy","updatedBy")
     VALUES ($1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,1,$15::uuid,$15::uuid)
     ON CONFLICT ("municipalityId","assetId") DO UPDATE SET
       "buildingUse"=EXCLUDED."buildingUse","constructionYear"=EXCLUDED."constructionYear","floorCount"=EXCLUDED."floorCount",
       "grossAreaM2"=EXCLUDED."grossAreaM2","occupancyCapacity"=EXCLUDED."occupancyCapacity","heritageStatus"=EXCLUDED."heritageStatus",
       "accessibilityStatus"=EXCLUDED."accessibilityStatus","fireSafetyStatus"=EXCLUDED."fireSafetyStatus","energyRating"=EXCLUDED."energyRating",
       "lastRenovationYear"=EXCLUDED."lastRenovationYear","metadata"=EXCLUDED."metadata","version"="MunicipalBuilding"."version"+1,
       "updatedBy"=$15::uuid,"updatedAt"=NOW()`,
    id,input.municipalityId,input.assetId,input.buildingUse,input.constructionYear||null,input.floorCount||null,
    input.grossAreaM2||null,input.occupancyCapacity ?? null,input.heritageStatus,input.accessibilityStatus,
    input.fireSafetyStatus,input.energyRating||null,input.lastRenovationYear||null,JSON.stringify(input.metadata||{}),input.actorId
  );
  await db.$executeRawUnsafe(
    `INSERT INTO "MunicipalAssetEvent" ("id","municipalityId","assetId","actorId","eventType","metadata") VALUES ($1::uuid,$2,$3::uuid,$4::uuid,$5,$6::jsonb)`,
    randomUUID(),input.municipalityId,input.assetId,input.actorId,current?'BUILDING_UPDATED':'BUILDING_CREATED',
    JSON.stringify({ buildingUse: input.buildingUse, assetVersion: asset.version })
  );
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "MunicipalBuilding" WHERE "municipalityId"=$1 AND "assetId"=$2::uuid LIMIT 1`,
    input.municipalityId,
    input.assetId
  );
  return rows[0];
}

module.exports = { getBuilding, upsertBuilding };
