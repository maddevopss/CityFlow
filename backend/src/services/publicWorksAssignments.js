const { randomUUID } = require('crypto');

async function listTeams(db, municipalityId) {
  return db.$queryRawUnsafe(
    `SELECT * FROM "PublicWorksTeam" WHERE "municipalityId"=$1 ORDER BY "status", "name"`, municipalityId
  );
}

async function listVehicles(db, municipalityId) {
  return db.$queryRawUnsafe(
    `SELECT * FROM "PublicWorksVehicle" WHERE "municipalityId"=$1 ORDER BY "status", "unitNumber"`, municipalityId
  );
}

async function assignWorkOrder(db, { municipalityId, workOrderId, teamId, vehicleId, actorId }) {
  const orderRows = await db.$queryRawUnsafe(
    `SELECT * FROM "WorkOrder" WHERE "id"=$1::uuid AND "municipalityId"=$2 LIMIT 1`, workOrderId, municipalityId
  );
  const order = orderRows[0];
  if (!order) { const error = new Error('work order not found'); error.statusCode = 404; throw error; }

  if (teamId) {
    const teams = await db.$queryRawUnsafe(
      `SELECT "id" FROM "PublicWorksTeam" WHERE "id"=$1::uuid AND "municipalityId"=$2 AND "status"='ACTIVE' LIMIT 1`, teamId, municipalityId
    );
    if (!teams[0]) { const error = new Error('team not available'); error.statusCode = 409; throw error; }
  }

  if (vehicleId) {
    const vehicles = await db.$queryRawUnsafe(
      `SELECT "id" FROM "PublicWorksVehicle" WHERE "id"=$1::uuid AND "municipalityId"=$2 AND "status"='AVAILABLE' LIMIT 1`, vehicleId, municipalityId
    );
    if (!vehicles[0]) { const error = new Error('vehicle not available'); error.statusCode = 409; throw error; }
  }

  await db.$executeRawUnsafe(
    `UPDATE "WorkOrder" SET "assignedTeamId"=$1::uuid,"assignedVehicleId"=$2::uuid,"status"='ASSIGNED',"updatedAt"=NOW() WHERE "id"=$3::uuid AND "municipalityId"=$4`,
    teamId || null, vehicleId || null, workOrderId, municipalityId
  );
  await db.$executeRawUnsafe(
    `INSERT INTO "WorkOrderEvent" ("id","municipalityId","workOrderId","actorId","eventType","fromStatus","toStatus","metadata") VALUES ($1::uuid,$2,$3::uuid,$4::uuid,'ASSIGNED',$5,'ASSIGNED',$6::jsonb)`,
    randomUUID(), municipalityId, workOrderId, actorId, order.status, JSON.stringify({ teamId: teamId || null, vehicleId: vehicleId || null })
  );
  const rows = await db.$queryRawUnsafe(
    `SELECT * FROM "WorkOrder" WHERE "id"=$1::uuid AND "municipalityId"=$2 LIMIT 1`, workOrderId, municipalityId
  );
  return rows[0];
}

module.exports = { listTeams, listVehicles, assignWorkOrder };