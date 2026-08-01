#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIR:?BACKUP_DIR is required}"

mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$BACKUP_DIR/cityflow-$timestamp.dump"
checksum="$archive.sha256"

pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" > "$archive"
sha256sum "$archive" > "$checksum"

printf 'backup=%s\nchecksum=%s\n' "$archive" "$checksum"
