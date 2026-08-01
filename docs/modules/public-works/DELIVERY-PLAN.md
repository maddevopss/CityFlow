# Travaux publics — Livraison complète

## Finalité
Planifier, affecter, exécuter, vérifier et fermer les ordres de travail liés aux actifs, routes, espaces publics et signalements.

## Cycle de vie
`DRAFT → PLANNED → ASSIGNED → IN_PROGRESS → BLOCKED → COMPLETED → VERIFIED → CLOSED`, avec annulation motivée.

## Données
WorkOrder, WorkTask, WorkAssignment, WorkLog, MaterialUsage, EquipmentUsage, WorkEvidence, WorkSchedule, MaintenancePlan et WorkAuditEvent, toutes isolées par `municipalityId`.

## Capacités
- ordres correctifs et préventifs;
- priorités, compétences et équipes;
- planification et calendrier;
- temps, matériaux, véhicules et coûts;
- preuves terrain et mode hors ligne;
- vérification et fermeture;
- liens vers actifs et signalements;
- entretien récurrent.

## Sécurité et tests
Séparation affectation/vérification, transitions contrôlées, limites de lots, idempotence mobile, audit, isolation et E2E signalement → ordre → intervention → fermeture.

## Exploitation
Arriéré, temps de prise en charge, temps de résolution, coûts, récurrence, ordres bloqués et respect des niveaux de service.

## Barrière de production
Migrations, backend, frontend, OpenAPI, sécurité, observabilité et E2E verts en préproduction.
