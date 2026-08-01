# Gestion des actifs municipaux — Plan complet

## Finalité

Tenir un registre fiable des parcs, bâtiments, véhicules et équipements, avec localisation, état, criticité, garanties, documents, inspections et historique d’entretien.

## Cycle de vie

`PLANNED → ACTIVE → OUT_OF_SERVICE → DISPOSED` avec transitions auditées.

## Données

Asset, AssetCategory, AssetLocation, AssetDocument, AssetConditionAssessment, AssetMeterReading, AssetLifecycleEvent et AssetRelationship. Chaque objet est isolé par `municipalityId` et dispose d’un code public unique dans la municipalité.

## API et interface

- création, import et recherche paginée;
- fiche d’actif et chronologie;
- hiérarchie parent/enfant;
- état, criticité et valeur de remplacement;
- documents, photos et garanties;
- compteurs et inspections;
- carte et filtres;
- export contrôlé.

## Sécurité et exploitation

Rôles, validation géographique, empreintes des documents, journal d’audit, quotas d’import et détection de doublons. KPI : actifs critiques, hors service, inspections en retard, coût d’entretien, âge et renouvellement prévu.

## Tests et fermeture

Isolation, transitions, imports, hiérarchies cycliques, documents, E2E création → évaluation → ordre de travail → remise en service. Production uniquement après migrations, API, UI, OpenAPI, observabilité et E2E verts.
