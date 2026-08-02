# Bâtiments municipaux

## Portée

Ce bloc ajoute une spécialisation structurée pour les actifs de type `BUILDING`. Il ne duplique pas le registre central : la fiche bâtiment complète l’actif existant.

## Données

- usage principal;
- année de construction et dernière rénovation;
- nombre d’étages;
- superficie brute;
- capacité d’occupation;
- statut patrimonial;
- conformité d’accessibilité;
- sécurité incendie;
- cote énergétique;
- métadonnées extensibles;
- version de concurrence.

## Endpoints

| Méthode | Route | Rôles |
|---|---|---|
| `GET` | `/api/v1/municipal-assets/:assetId/building` | ADMIN, MANAGER, MUNICIPAL_AGENT, INSPECTOR, VIEWER |
| `PUT` | `/api/v1/municipal-assets/:assetId/building` | ADMIN, MANAGER, MUNICIPAL_AGENT |

## Sécurité

- `municipalityId` provient du jeton;
- l’actif doit exister dans la même municipalité;
- l’actif doit être de type `BUILDING`;
- les actifs archivés sont refusés;
- validation Joi avant l’accès au service;
- limiteurs déclarés sur chaque route;
- contrôle de version pour les modifications;
- événements `BUILDING_CREATED` et `BUILDING_UPDATED` ajoutés à l’historique append-only.

## Migration

Une seule migration crée `MunicipalBuilding`, avec une relation un-à-un par municipalité et actif. Les années, surfaces, capacités, états de sécurité et versions sont contraints côté PostgreSQL.

## Erreurs métier

- `ASSET_NOT_FOUND` : actif absent ou hors municipalité;
- `ASSET_TYPE_MISMATCH` : actif d’un autre type;
- `BUILDING_NOT_FOUND` : aucune fiche spécialisée;
- `BUILDING_VERSION_CONFLICT` : modification concurrente.

## Limites

- aucune gestion des pièces ou locaux;
- aucun système de chauffage ou de ventilation;
- aucune inspection réglementaire spécialisée;
- aucun plan, fichier binaire ou jumeau numérique;
- aucune maintenance ni garantie dans cette PR.
