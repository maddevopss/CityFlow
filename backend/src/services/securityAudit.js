const { randomUUID } = require('crypto');
const prisma = require('../db/prisma');

const SAFE_ACTIONS = new Set([
  'auth.login.succeeded',
  'auth.login.failed',
  'auth.refresh.succeeded',
  'auth.refresh.failed',
  'auth.logout.succeeded'
]);

async function appendSecurityAudit({
  action,
  result,
  municipalityId = null,
  actorId = null,
  requestId = null,
  metadata = {},
  db = prisma
}) {
  if (!SAFE_ACTIONS.has(action)) throw new Error('Action d’audit de sécurité non autorisée');
  if (!['SUCCESS', 'FAILURE'].includes(result)) throw new Error('Résultat d’audit de sécurité invalide');

  const id = randomUUID();
  await db.$executeRaw`
    INSERT INTO "SecurityAudit" (
      "id", "municipalityId", "actorId", "action", "result", "requestId", "metadata"
    ) VALUES (
      ${id}::uuid,
      ${municipalityId},
      ${actorId}::uuid,
      ${action},
      ${result},
      ${requestId},
      ${JSON.stringify(metadata)}::jsonb
    )
  `;
  return id;
}

module.exports = { appendSecurityAudit };
