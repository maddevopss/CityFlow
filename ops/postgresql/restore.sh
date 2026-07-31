#!/usr/bin/env bash
set -euo pipefail

: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL is required}"
: "${BACKUP_ARCHIVE:?BACKUP_ARCHIVE is required}"
: "${RESTORE_CONFIRMATION:?Set RESTORE_CONFIRMATION=RESTORE_CITYFLOW}"

if [[ "$RESTORE_CONFIRMATION" != "RESTORE_CITYFLOW" ]]; then
  printf 'Refusing restore: invalid confirmation token.\n' >&2
  exit 64
fi

if [[ ! -f "$BACKUP_ARCHIVE" ]]; then
  printf 'Refusing restore: archive not found: %s\n' "$BACKUP_ARCHIVE" >&2
  exit 66
fi

if [[ -f "$BACKUP_ARCHIVE.sha256" ]]; then
  sha256sum --check "$BACKUP_ARCHIVE.sha256"
fi

pg_restore --list "$BACKUP_ARCHIVE" >/dev/null

pg_restore \
  --dbname="$RESTORE_DATABASE_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$BACKUP_ARCHIVE"

printf 'Restore completed from %s\n' "$BACKUP_ARCHIVE"
