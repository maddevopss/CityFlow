# Registre des actifs municipaux — API

## Portée

Ce bloc expose le registre central des actifs municipaux. Le backend demeure l’autorité pour les rôles, la municipalité, la validation, les conflits de version, l’idempotence et l’archivage.

Aucune migration n’est ajoutée. Cette API dépend des fondations persistantes livrées séparément.

## Endpoints

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/api/v1/municipal-assets` | ADMIN, MANAGER, MUNICIPAL_AGENT, INSPECTOR, VIEWER | Liste paginée, filtrée et recherchable |
| `GET` | `/api/v1/municipal-assets/:id` | ADMIN, MANAGER, MUNICIPAL_AGENT, INSPECTOR, VIEWER | Fiche d’un actif de la municipalité |
| `POST` | `/api/v1/municipal-assets` | ADMIN, MANAGER, MUNICIPAL_AGENT | Création idempotente |
| `PATCH` | `/api/v1/municipal-assets/:id` | ADMIN, MANAGER, MUNICIPAL_AGENT | Modification avec contrôle de version |
| `DELETE` | `/api/v1/municipal-assets/:id` | ADMIN, MANAGER | Archivage logique uniquement |

## Lecture, pagination et recherche

Paramètres pris en charge :

- `page`, à partir de 1;
- `limit`, de 1 à 100;
- `q`, recherche dans le numéro, le nom, la description et l’adresse;
- `assetType`;
- `status`;
- `condition`;
- `ownershipType`;
- `includeArchived`, faux par défaut;
- `sortBy` : `assetNumber`, `name`, `type`, `status`, `updatedAt`, `acquisitionDate`;
- `sortDirection` : `asc` ou `desc`.

Toutes les requêtes SQL filtrent d’abord par `municipalityId`.

## Idempotence

Les créations et les archivages exigent l’en-tête `Idempotency-Key`, de 8 à 200 caractères. Une répétition légitime retourne la ressource existante avec `replayed: true` plutôt que de créer un doublon.

Les événements de création, modification et archivage sont ajoutés dans `MunicipalAssetEvent`. Ils ne sont ni modifiés ni supprimés par cette API.

## Contrôle de concurrence

Chaque modification doit fournir la propriété `version`. Le backend refuse la mutation avec `409 ASSET_VERSION_CONFLICT` lorsque la version fournie ne correspond plus à celle du registre.

## Archivage

`DELETE` ne supprime aucune ligne. Il renseigne `archivedAt` et `archivedBy`, incrémente la version et ajoute un événement append-only. Un motif de 10 à 1000 caractères est obligatoire.

## Erreurs métier

| Code | HTTP | Signification |
|---|---:|---|
| `MUNICIPALITY_REQUIRED` | 403 | Aucun contexte municipal n’est associé à l’utilisateur |
| `ASSET_NOT_FOUND` | 404 | Actif absent de la municipalité ou inexistant |
| `ASSET_NUMBER_INVALID` | 400 | Numéro normalisé vide ou invalide |
| `ASSET_NUMBER_CONFLICT` | 409 | Numéro déjà utilisé dans la municipalité |
| `ASSET_VERSION_CONFLICT` | 409 | Modification concurrente détectée |
| `ASSET_ARCHIVED` | 409 | Modification interdite sur une fiche archivée |

## Observabilité et audit

- les routes utilisent un limiteur de lecture ou d’écriture dès leur déclaration;
- le middleware HTTP existant mesure la durée, le statut et l’identifiant de requête;
- chaque mutation conserve l’acteur, la municipalité, le type d’événement et une charge utile minimale;
- les descriptions complètes, jetons et secrets ne doivent pas être ajoutés aux journaux techniques.

## Limites

- aucune restauration d’archive;
- aucun historique exposé par route dédiée;
- aucun détail spécialisé de bâtiment, parc, réseau, équipement ou véhicule;
- aucune garantie, inspection, maintenance, dépense ou écriture d’amortissement;
- aucune interface frontend.
