const { randomUUID } = require('crypto');

async function assertWorkOrder(db, municipalityId, workOrderId) {
  const rows = await db.$queryRawUnsafe(
    `SELECT "id","status" FROM "WorkOrder" WHERE "id"=$1::uuid AND "municipalityId"=$2 LIMIT 1`,
    workOrderId, municipalityId
  );
  if (!rows[0]) { const error = new Error('work order not found'); error.statusCode = 404; throw error; }
  return rows[0];
}

async function addEvidence(db, input) {
  await assertWorkOrder(db, input.municipalityId, input.workOrderId);
  const id = randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO "WorkOrderEvidence" ("id","municipalityId","workOrderId","evidenceType","fileName","mimeType","sizeBytes","storageKey","sha256","description","capturedAt","uploadedBy")
     VALUES ($1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8,$9,$10,$11,$12::uuid)`,
    id, input.municipalityId, input.workOrderId, input.evidenceType, input.fileName, input.mimeType,
    input.sizeBytes, input.storageKey, input.sha256, input.description || null, input.capturedAt, input.actorId
  );
  return { id, ...input };
}

async function addMaterial(db, input) {
  await assertWorkOrder(db, input.municipalityId, input.workOrderId);
  const id = randomUUID();
  await db.$executeRawUnsafe(
    `INSERT INTO "WorkOrderMaterial" ("id","municipalityId","workOrderId","itemCode","description","quantity","unit","unitCost","recordedBy")
     VALUES ($1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8,$9::uuid)`,
    id, input.municipalityId, input.workOrderId, input.itemCode, input.description,
    input.quantity, input.unit, input.unitCost == null ? null : input.unitCost, input.actorId
  );
  return { id, ...input };
}

async function getExecutionSummary(db, { municipalityId, workOrderId }) {
  await assertWorkOrder(db, municipalityId, workOrderId);
  const [evidence, materials, events] = await Promise.all([
    db.$queryRawUnsafe(`SELECT * FROM "WorkOrderEvidence" WHERE "municipalityId"=$1 AND "workOrderId"=$2::uuid ORDER BY "capturedAt" DESC`, municipalityId, workOrderId),
    db.$queryRawUnsafe(`SELECT * FROM "WorkOrderMaterial" WHERE "municipalityId"=$1 AND "workOrderId"=$2::uuid ORDER BY "recordedAt" DESC`, municipalityId, workOrderId),
    db.$queryRawUnsafe(`SELECT * FROM "WorkOrderEvent" WHERE "municipalityId"=$1 AND "workOrderId"=$2::uuid ORDER BY "createdAt" ASC`, municipalityId, workOrderId)
  ]);
  const materialCost = materials.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitCost || 0), 0);
  return { evidence, materials, events, materialCost };
}

module.exports = { addEvidence, addMaterial, getExecutionSummary };