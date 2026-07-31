# M5 — Matrice API ↔ dépendances

## Statut

**MATRICE ACTIVE — AUCUNE DISPONIBILITÉ OU COMPATIBILITÉ PRÉSUMÉE**

## Objet

Relier chaque API CityFlow à ses dépendances techniques, contractuelles, de données et d’exploitation.

## Colonnes obligatoires

| API ID | Version | Route ou contrat | Propriétaire | Consommateurs | Dépendance ID | Type | Version attendue | Authentification | Données | Niveau de service | Repli | Surveillance | Dernière revue |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — | — | — | — | — |

## Règles de traçabilité

- chaque API et dépendance possède un identifiant stable;
- les versions compatibles et incompatibles sont explicites;
- les exigences d’authentification et d’autorisation sont documentées;
- les données échangées renvoient au registre T9;
- les fournisseurs externes renvoient au registre T15;
- les stratégies de repli, temporisation et reprise sont décrites.

## Contrôles de cohérence

- aucune API active sans propriétaire et contrat accessible;
- aucune dépendance critique sans surveillance;
- les ruptures de compatibilité possèdent un plan de migration;
- les secrets ne sont jamais inscrits dans la matrice;
- les dépendances retirées possèdent une preuve de fermeture.

## Gouvernance

- propriétaire : architecture et responsables API;
- revue : à chaque version, intégration ou changement de dépendance;
- sources : T8 dépendances, T10 API, T11 environnements et T15 fournisseurs.

## Barrière finale

La documentation d’une dépendance ne garantit ni sa disponibilité, ni sa sécurité, ni sa compatibilité réelle. Ces propriétés doivent être testées et surveillées.
