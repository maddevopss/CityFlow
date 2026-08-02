# Actifs municipaux — Historique et restauration

## Portée

Ce bloc expose l’historique append-only des actifs municipaux et permet la restauration contrôlée d’un actif archivé.

Aucune migration n’est ajoutée. Le bloc réutilise `MunicipalAssetEvent` et les champs d’archivage déjà présents.

## Endpoints

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/api/v1/municipal-assets/:assetId/history` | ADMIN, MANAGER, MUNICIPAL_AGENT, INSPECTOR, VIEWER | Historique paginé et filtrable |
| `POST` | `/api/v1/municipal-assets/:assetId/restore` | ADMIN, MANAGER | Restauration idempotente d’un actif archivé |

## Historique

Filtres disponibles :

- `page` et `limit`;
- `eventType`;
- `actorId`;
- `from` et `to`.

La lecture vérifie d’abord que l’actif appartient à la municipalité du jeton. Les événements sont triés du plus récent au plus ancien. Aucune route de modification ou de suppression d’événement n’est exposée.

## Restauration

La restauration :

- exige un motif de 10 à 1000 caractères;
- exige un en-tête `Idempotency-Key`;
- refuse un actif non archivé;
- refuse les états `RETIRED` et `DISPOSED` comme état de retour;
- utilise `INACTIVE` par défaut;
- efface `archivedAt` et `archivedBy`;
- incrémente la version;
- conserve l’acteur et le motif dans un événement `RESTORED` append-only;
- s’exécute dans une transaction.

## Sécurité

- `municipalityId` provient exclusivement du jeton;
- une ressource externe est présentée comme introuvable;
- les rôles de restauration sont limités à `ADMIN` et `MANAGER`;
- les routes appliquent les limiteurs dédiés aux actifs;
- la validation Joi précède les accès aux services;
- aucune suppression physique n’est réalisée.

## Erreurs métier

| Code | HTTP | Signification |
|---|---:|---|
| `ASSET_NOT_FOUND` | 404 | Actif absent ou hors municipalité |
| `ASSET_NOT_ARCHIVED` | 409 | Restauration demandée sur un actif actif |
| `ASSET_RESTORE_CONFLICT` | 409 | L’état d’archivage a changé pendant la transaction |

## Observabilité

Les requêtes utilisent l’identifiant et les métriques HTTP du middleware global. Les événements conservent seulement les métadonnées nécessaires à l’audit, sans jeton ni contenu sensible.

## Limites

- aucune restauration vers `RETIRED` ou `DISPOSED`;
- aucun retour automatique à un état calculé;
- aucune interface frontend;
- aucun export d’historique;
- aucune modification ou suppression des événements existants.
