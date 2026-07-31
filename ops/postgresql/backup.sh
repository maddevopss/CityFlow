#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIRECTORY:=./backups}"
: "${BACKUP_RETENTION_DAYS:=14}"

umask 077
mkdir -p "$BACKUP_DIRECTORY"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$BACKUP_DIRECTORY/cityflow-$timestamp.dump"
checksum="$archive.sha256"

pg_dump \
  --dbname="$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="$archive"

sha256sum "$archive" > "$checksum"
pg_restore --list "$archive" >/dev/null

find "$BACKUP_DIRECTORY" -type f \
  \( -name 'cityflow-*.dump' -o -name 'cityflow-*.dump.sha256' \) \
  -mtime "+$BACKUP_RETENTION_DAYS" -delete

printf 'Backup verified: %s\n' "$archive"
