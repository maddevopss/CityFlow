#!/usr/bin/env bash
set -Eeuo pipefail

: "${DATABASE_URL:?DATABASE_URL est obligatoire}"
: "${BACKUP_FILE:?BACKUP_FILE est obligatoire}"
: "${CONFIRM_RESTORE:?CONFIRM_RESTORE=YES est obligatoire}"

if [[ "${CONFIRM_RESTORE}" != "YES" ]]; then
  printf 'Restauration refusée: définir CONFIRM_RESTORE=YES explicitement.\n' >&2
  exit 2
fi
if [[ ! -f "${BACKUP_FILE}" ]]; then
  printf 'Sauvegarde introuvable: %s\n' "${BACKUP_FILE}" >&2
  exit 2
fi
if [[ -f "${BACKUP_FILE}.sha256" ]]; then
  sha256sum --check "${BACKUP_FILE}.sha256"
fi

pg_restore --exit-on-error --clean --if-exists --no-owner --no-privileges \
  --dbname "${DATABASE_URL}" "${BACKUP_FILE}"

printf 'Restauration terminée depuis: %s\n' "${BACKUP_FILE}"
