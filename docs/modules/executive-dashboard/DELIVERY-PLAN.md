# Tableau de bord exécutif transversal — Livraison complète

## Finalité
Donner aux directions municipales une lecture consolidée, explicable et filtrable des permis, inspections, actifs, travaux publics et signalements sans contourner les règles de chaque module.

## Données
ExecutiveMetricDefinition, ExecutiveMetricSnapshot, ExecutiveTarget, ExecutiveAlert, ExecutiveSavedView et ExecutiveAuditEvent, toutes isolées par `municipalityId`.

## Capacités
- scorecard municipale;
- KPI par module et période;
- tendances, objectifs et écarts;
- filtres par secteur, catégorie et responsabilité;
- alertes exécutives et dossiers critiques;
- forage vers les données sources autorisées;
- vues enregistrées et exports;
- dictionnaire des indicateurs avec formule, source, fraîcheur et limites.

## KPI initiaux
- permis : volume, délai, dossiers bloqués, taux de décision;
- inspections : réalisation, retards, conformité;
- actifs : criticité, hors service, renouvellement;
- travaux : arriéré, délai, coût, niveau de service;
- signalements : volume, résolution, dépassements, satisfaction.

## Sécurité et tests
Agrégats municipaux seulement, contrôle des rôles exécutifs, aucune exposition de renseignements personnels, seuils de petits nombres, audit des exports, tests de cohérence et E2E filtre → forage → export.

## Exploitation
Fraîcheur des snapshots, dérive des formules, erreurs de sources, latence, coûts de calcul et alertes de données incomplètes.

## Barrière de production
Contrats de métriques approuvés, snapshots reproductibles, backend, frontend, OpenAPI, sécurité, observabilité et E2E verts en préproduction.
