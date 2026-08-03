const { randomUUID } = require('crypto');

async function createSession(client, { userId, tokenId, expiresAt }) {
  await client.$executeRaw`
    INSERT INTO "auth_sessions" ("id", "user_id", "token_id", "expires_at")
    VALUES (${randomUUID()}::uuid, ${userId}::uuid, ${tokenId}::uuid, ${expiresAt})
  `;
}

async function isSessionActive(client, { userId, tokenId }) {
  const rows = await client.$queryRaw`
    SELECT "id"
    FROM "auth_sessions"
    WHERE "user_id" = ${userId}::uuid
      AND "token_id" = ${tokenId}::uuid
      AND "revoked_at" IS NULL
      AND "expires_at" > CURRENT_TIMESTAMP
    LIMIT 1
  `;

  return rows.length === 1;
}

async function revokeSession(client, { userId, tokenId }) {
  const updated = await client.$executeRaw`
    UPDATE "auth_sessions"
    SET "revoked_at" = CURRENT_TIMESTAMP
    WHERE "user_id" = ${userId}::uuid
      AND "token_id" = ${tokenId}::uuid
      AND "revoked_at" IS NULL
  `;

  return updated === 1;
}

module.exports = { createSession, isSessionActive, revokeSession };
