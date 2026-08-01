# Conformité documentaire des permis

## Objectif

Empêcher l’approbation d’un permis tant que toutes les pièces obligatoires ne sont pas acceptées par la municipalité.

## Configuration

Les types obligatoires sont déclarés dans `RoadEvent.details.requiredDocumentTypes`.

Exemple :

```json
{
  "requiredDocumentTypes": ["PLAN", "ASSURANCE"]
}
```

Les types sont normalisés en majuscules et dédupliqués.

## Évaluation

Le détail municipal retourne `documentCompliance` avec :

- `compliant`;
- `requiredTypes`;
- `acceptedTypes`;
- `pendingTypes`;
- `rejectedTypes`;
- `missingTypes`.

Une pièce obligatoire est satisfaite uniquement lorsqu’une pièce du même type possède l’état `ACCEPTED`.

## Barrière d’approbation

La transition `SUBMITTED -> APPROVED` retourne `409 PERMIT_DOCUMENTS_INCOMPLETE` lorsque `missingTypes` n’est pas vide. La réponse contient le résumé complet de conformité.

Les autres transitions ne sont pas bloquées par cette règle. Un permis qui ne déclare aucun type obligatoire demeure conforme afin de préserver la compatibilité avec les dossiers existants.

## Sécurité

Aucune nouvelle route n’est ajoutée. Les routes existantes de lecture et de transition conservent respectivement `permitReadLimiter` et `permitWriteLimiter`, puis l’authentification et l’autorisation par rôle.
