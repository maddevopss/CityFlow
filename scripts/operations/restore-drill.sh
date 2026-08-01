#!/usr/bin/env bash
set -euo pipefail

: "${OPERATIONS_TEST_DATABASE_URL:?OPERATIONS_TEST_DATABASE_URL requis}"
: "${BACKUP_FILE:?BACKUP_FILE requis}"

lower="$(printf '%s' "$OPERATIONS_TEST_DATABASE_URL" | tr '[:upper:]' '[:lower:]')"
if [[ "$lower" == *prod* || "$lower" == *production* ]]; then
  echo 'Cible de production interdite' >&2
  exit 1
fi

test -f "$BACKUP_FILE"
test -f "$BACKUP_FILE.sha256"
sha256sum -c "$BACKUP_FILE.sha256"

started="$(date +%s)"
pg_restore --clean --if-exists --no-owner --dbname="$OPERATIONS_TEST_DATABASE_URL" "$BACKUP_FILE"
psql "$OPERATIONS_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -c 'SELECT 1;'
ended="$(date +%s)"

echo "restore_seconds=$((ended-started))"
