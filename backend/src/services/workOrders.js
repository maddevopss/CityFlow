const { randomUUID } = require('crypto');

const STATUSES = ['DRAFT', 'PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CLOSED', 'CANCELLED'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

async function listWorkOrders(db, { municipalityId, status, assignedTeamId, q, limit = 50 }) {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "WorkOrder"
     WHERE "municipalityId" = $1
       AND ($2::text IS NULL OR "status" = $2)
       AND ($3::uuid IS NULL OR "assignedTeamId" = $3)
       AND ($4::text IS NULL OR "title" ILIKE '%' || $4 || '%' OR "number" ILIKE '%' || $4 || '%')
     ORDER BY "updatedAt" DESC LIMIT $5`,
    municipalityId, status || null, assignedTeamId || null, q || null, Math.min(Number(limit) || 50, 100)
  );
  return rows;
}

async function getWorkOrder(db, { municipalityId, id }) {
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "WorkOrder" WHERE "id" = $1::uuid AND "municipalityId" = $2 LIMIT 1`, id, municipalityId
  );
  return rows[0] || null;
}

async function createWorkOrder(db, input) {
  const id = randomUUID();
  const number = input.number || `WO-${new Date().getUTCFullYear()}-${id.slice(0, 8).toUpperCase()}`;
  const priority = PRIORITIES.includes(input.priority) ? input.priority : 'NORMAL';
  await db.$executeRawUnsafe(
    `INSERT INTO "WorkOrder" ("id","municipalityId","number","title","description","category","priority","status","location","citizenRequestId","roadEventId","permitId","plannedStartAt","plannedEndAt","createdBy")
     VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,'DRAFT',$8::jsonb,$9::uuid,$10::uuid,$11::uuid,$12,$13,$14::uuid)`,
    id, input.municipalityId, number, input.title, input.description, input.category || 'OTHER', priority,
    JSON.stringify(input.location || null), input.citizenRequestId || null, input.roadEventId || null,
    input.permitId || null, input.plannedStartAt || null, input.plannedEndAt || null, input.actorId
  );
  await db.$executeRawUnsafe(
    `INSERT INTO "WorkOrderEvent" ("id","municipalityId","workOrderId","actorId","eventType","toStatus") VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'CREATED','DRAFT')`,
    randomUUID(), input.municipalityId, id, input.actorId
  );
  return getWorkOrder(db, { municipalityId: input.municipalityId, id });
}

async function transitionWorkOrder(db, { municipalityId, id, actorId, toStatus, resolution }) {
  if (!STATUSES.includes(toStatus)) {
    const error = new Error('invalid work order status'); error.statusCode = 400; throw error;
  }
  const current = await getWorkOrder(db, { municipalityId, id });
  if (!current) { const error = new Error('work order not found'); error.statusCode = 404; throw error; }
  const timestamps = {
    IN_PROGRESS: '"startedAt" = COALESCE("startedAt", NOW()),',
    COMPLETED: '"completedAt" = COALESCE("completedAt", NOW()),',
    CLOSED: '"closedAt" = COALESCE("closedAt", NOW()), "closedBy" = $5::uuid,'
  };
  await db.$executeRawUnsafe(
    `UPDATE "WorkOrder" SET "status"=$1, ${timestamps[toStatus] || ''} "resolution"=COALESCE($2,"resolution"), "updatedAt"=NOW() WHERE "id"=$3::uuid AND "municipalityId"=$4`,
    toStatus, resolution || null, id, municipalityId, actorId
  );
  await db.$executeRawUnsafe(
    `INSERT INTO "WorkOrderEvent" ("id","municipalityId","workOrderId","actorId","eventType","fromStatus","toStatus") VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'STATUS_CHANGED',$5,$6)`,
    randomUUID(), municipalityId, id, actorId, current.status, toStatus
  );
  return getWorkOrder(db, { municipalityId, id });
}

module.exports = { STATUSES, PRIORITIES, listWorkOrders, getWorkOrder, createWorkOrder, transitionWorkOrder };