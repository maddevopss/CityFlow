CREATE TABLE "citizen_escalation_runs" (
  "id" BIGSERIAL PRIMARY KEY,
  "municipality_id" INTEGER NOT NULL,
  "source" VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
  "status" VARCHAR(16) NOT NULL,
  "scanned" INTEGER NOT NULL DEFAULT 0,
  "candidates" INTEGER NOT NULL DEFAULT 0,
  "notifications_created" INTEGER NOT NULL DEFAULT 0,
  "duration_ms" INTEGER NOT NULL DEFAULT 0,
  "error_message" TEXT,
  "started_at" TIMESTAMPTZ NOT NULL,
  "completed_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "citizen_escalation_runs_municipality_id_fkey"
    FOREIGN KEY ("municipality_id") REFERENCES "Municipality"("id") ON DELETE CASCADE
);

CREATE INDEX "citizen_escalation_runs_municipality_completed_idx"
  ON "citizen_escalation_runs" ("municipality_id", "completed_at" DESC);

CREATE INDEX "citizen_escalation_runs_status_completed_idx"
  ON "citizen_escalation_runs" ("status", "completed_at" DESC);
