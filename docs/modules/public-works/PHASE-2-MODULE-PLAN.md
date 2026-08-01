# Travaux publics — Plan complet

## Finalité

Planifier, affecter, exécuter et fermer les ordres de travail liés aux actifs, routes, espaces publics et signalements citoyens.

## Cycle de vie

`DRAFT → PLANNED → ASSIGNED → IN_PROGRESS → BLOCKED → COMPLETED → VERIFIED → CLOSED`, avec annulation motivée.

## Données

WorkOrder, WorkTask, WorkAssignment, WorkLog, MaterialUsage, EquipmentUsage, WorkEvidence, WorkSchedule, MaintenancePlan et WorkAuditEvent.

## Capacités

- ordres correctifs et préventifs;
- priorités, compétences et équipes;
- planification et calendrier;
- temps, matériaux, véhicules et coûts;
- preuves terrain et mode hors ligne;
- vérification et fermeture;
- liens vers actifs et signalements;
- entretien récurrent.

## Sécurité, tests et exploitation

Isolation municipale, séparation affectation/vérification, limites de lots, idempotence mobile et audit. Tests des transitions, conflits, coûts, preuves et E2E signalement → ordre → intervention → fermeture. KPI : arriéré, temps de prise en charge, temps de résolution, coûts, récurrence et respect des niveaux de service.
