#!/usr/bin/env bash
set -euo pipefail

severity="${1:-}"
summary="${2:-}"

case "$severity" in
  P1|P2|P3|P4) ;;
  *) echo 'Usage: new-incident.sh P1|P2|P3|P4 "Résumé"' >&2; exit 64 ;;
esac

test -n "$summary" || { echo 'Le résumé est requis.' >&2; exit 64; }

incident_id="INC-$(date -u +%Y%m%dT%H%M%SZ)"
dir="incidents/$incident_id"
mkdir -p "$dir"

cat > "$dir/README.md" <<EOF
# $incident_id — $summary

- Sévérité : $severity
- Début UTC : $(date -u +%FT%TZ)
- Statut : OUVERT
- Responsable : À assigner

## Impact

À compléter.

## Chronologie

| Heure UTC | Événement | Responsable |
|---|---|---|

## Diagnostic

À compléter sans secrets ni données citoyennes.

## Actions et retour arrière

À compléter.

## Validation du rétablissement

À compléter.

## Suivi

- [ ] communication effectuée;
- [ ] preuves conservées;
- [ ] actions correctives assignées;
- [ ] post-mortem requis pour P1/P2.
EOF

printf '%s\n' "$dir/README.md"
