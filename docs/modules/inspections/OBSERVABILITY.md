# Observabilité du module Inspections

## Objectif

Rendre le cycle d’inspection exploitable en production sans exposer de données sensibles ni mélanger les municipalités.

## Journaux d’audit obligatoires

Chaque mutation doit produire un événement structuré avec :

- `eventId`, `occurredAt`, `action` et `result`;
- `municipalityId`, `actorId`, `actorRole` et `requestId`;
- `inspectionId` lorsque l’action cible une inspection;
- les champs modifiés sous forme de noms seulement, sans contenu libre;
- aucune preuve binaire, aucun jeton, aucune adresse courriel complète et aucun constat terrain dans les journaux.

Actions minimales : `inspection.created`, `inspection.assigned`, `inspection.completed`, `evidence.registered`, `report.generated`, `notification.queued`, `sync.applied` et `sync.conflict`.

## Métriques

| Métrique | Type | Dimensions autorisées |
|---|---|---|
| `cityflow_inspection_requests_total` | compteur | route, méthode, statut HTTP |
| `cityflow_inspection_request_duration_ms` | histogramme | route, méthode |
| `cityflow_inspections_created_total` | compteur | type |
| `cityflow_inspections_completed_total` | compteur | résultat |
| `cityflow_inspections_overdue` | jauge | aucune dimension municipale publique |
| `cityflow_inspection_sync_conflicts_total` | compteur | action |
| `cityflow_inspection_notifications_total` | compteur | canal, résultat |

Les identifiants de municipalité, d’utilisateur, d’inspection et de permis sont interdits comme étiquettes de métriques afin d’éviter une cardinalité non bornée.

## Tableau de bord d’exploitation

Le tableau de bord doit afficher : débit, latence p50/p95/p99, taux d’erreur, inspections en retard, conflits de synchronisation, notifications en échec et saturation des quotas.

## Alertes initiales

- taux d’erreur serveur supérieur à 2 % pendant 10 minutes;
- p95 supérieur à 1 000 ms pendant 15 minutes;
- conflit de synchronisation supérieur à 5 % pendant 30 minutes;
- file de notifications sans progression pendant 15 minutes;
- absence complète de métriques du service pendant 5 minutes.

## Conservation et accès

- journaux applicatifs : 30 jours en ligne, 365 jours en archive contrôlée;
- événements d’audit : durée conforme aux politiques municipales applicables;
- accès réservé à l’exploitation autorisée;
- export d’audit traçable et journalisé;
- corrélation par `requestId` entre API, audit et erreurs.

## Critères d’acceptation

1. Toutes les mutations critiques génèrent un événement d’audit.
2. Les métriques ne contiennent aucune dimension à cardinalité non bornée.
3. Les tableaux de bord distinguent disponibilité, performance et activité métier.
4. Les alertes sont testées par injection contrôlée.
5. Un inspecteur ne peut jamais consulter les journaux d’une autre municipalité.
