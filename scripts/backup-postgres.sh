#!/usr/bin/env bash
set -Eeuo pipefail

: "${DATABASE_URL:?DATABASE_URL est obligatoire}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="${BACKUP_DIR}/cityflow-${TIMESTAMP}.dump"

if ! [[ "${RETENTION_DAYS}" =~ ^[0-9]+$ ]]; then
  printf 'BACKUP_RETENTION_DAYS doit être un entier positif.\n' >&2
  exit 2
fi

umask 077
mkdir -p "${BACKUP_DIR}"
pg_dump --format=custom --no-owner --no-privileges --file "${BACKUP_FILE}" "${DATABASE_URL}"
pg_restore --list "${BACKUP_FILE}" > "${BACKUP_FILE}.toc"
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"

find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'cityflow-*.dump' -mtime "+${RETENTION_DAYS}" -delete
find "${BACKUP_DIR}" -maxdepth 1 -type f \( -name 'cityflow-*.dump.toc' -o -name 'cityflow-*.dump.sha256' \) -mtime "+${RETENTION_DAYS}" -delete

printf 'Sauvegarde créée: %s\n' "${BACKUP_FILE}"
printf 'Inventaire: %s.toc\n' "${BACKUP_FILE}"
printf 'Empreinte: %s.sha256\n' "${BACKUP_FILE}"
