const { createHash, randomBytes, randomUUID } = require('crypto');

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken() {
  return randomBytes(32).toString('base64url');
}

async function createRefreshToken(client, { userId, expiresAt }) {
  const token = generateRefreshToken();
  const tokenHash = hashToken(token);

  await client.$executeRaw`
    INSERT INTO "auth_refresh_tokens" ("id", "user_id", "token_hash", "expires_at")
    VALUES (${randomUUID()}::uuid, ${userId}::uuid, ${tokenHash}, ${expiresAt})
  `;

  return token;
}

async function rotateRefreshToken(client, { token, expiresAt }) {
  const tokenHash = hashToken(token);
  const rows = await client.$queryRaw`
    UPDATE "auth_refresh_tokens"
    SET "rotated_at" = CURRENT_TIMESTAMP
    WHERE "token_hash" = ${tokenHash}
      AND "rotated_at" IS NULL
      AND "revoked_at" IS NULL
      AND "expires_at" > CURRENT_TIMESTAMP
    RETURNING "user_id"
  `;

  if (rows.length !== 1) {
    return null;
  }

  const userId = rows[0].user_id;
  const nextToken = await createRefreshToken(client, { userId, expiresAt });

  return { userId, refreshToken: nextToken };
}

module.exports = { createRefreshToken, rotateRefreshToken };
