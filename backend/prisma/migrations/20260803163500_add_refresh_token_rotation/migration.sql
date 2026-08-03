CREATE TABLE "auth_refresh_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "rotated_at" TIMESTAMPTZ,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "auth_refresh_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "auth_refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "auth_refresh_tokens_token_hash_key"
  ON "auth_refresh_tokens"("token_hash");

CREATE INDEX "auth_refresh_tokens_user_active_idx"
  ON "auth_refresh_tokens"("user_id", "expires_at")
  WHERE "rotated_at" IS NULL AND "revoked_at" IS NULL;
