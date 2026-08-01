# Gestion des actifs municipaux — Livraison complète

## Finalité
Tenir un registre fiable des parcs, bâtiments, véhicules et équipements, avec localisation, état, criticité, documents, garanties, inspections, compteurs et historique d’entretien.

## Cycle de vie
`PLANNED → ACTIVE → OUT_OF_SERVICE → DISPOSED`, avec transitions auditées.

## Données
Asset, AssetCategory, AssetLocation, AssetDocument, AssetConditionAssessment, AssetMeterReading, AssetRelationship et AssetLifecycleEvent, toutes isolées par `municipalityId`.

## Capacités
- création, import, recherche et export;
- fiche d’actif et chronologie;
- hiérarchies parent/enfant;
- état, criticité et valeur de remplacement;
- documents, photos, garanties et compteurs;
- inspections et entretien;
- carte et filtres;
- intégration avec les ordres de travail.

## Sécurité et tests
Rôles, contrôle des documents, validation géographique, détection de doublons, prévention des cycles, audit, quotas d’import, isolation et E2E actif → évaluation → ordre de travail → remise en service.

## Exploitation
Actifs critiques, hors service, inspections en retard, coût d’entretien, âge moyen et renouvellement prévu.

## Barrière de production
Migrations, backend, frontend, OpenAPI, sécurité, observabilité et E2E verts en préproduction.
