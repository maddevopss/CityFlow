#!/usr/bin/env bash
set -euo pipefail

: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL is required}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"

case "${RESTORE_DATABASE_URL,,}" in
  *prod*|*production*)
    echo 'Refus: la cible de restauration ressemble à un environnement de production.' >&2
    exit 64
    ;;
esac

test -f "$BACKUP_FILE"
test -f "$BACKUP_FILE.sha256"
sha256sum --check "$BACKUP_FILE.sha256"

pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$RESTORE_DATABASE_URL" "$BACKUP_FILE"
printf 'restore_completed=%s\n' "$(date -u +%FT%TZ)"
