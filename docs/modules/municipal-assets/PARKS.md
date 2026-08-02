# Parcs et espaces verts municipaux

## Portée

Cette capacité spécialise un actif municipal de type `PARK`. Le registre central demeure l’autorité pour l’identité, la municipalité, l’archivage et l’historique.

## Données

La fiche parc contient le type de parc, la superficie, les heures d’ouverture, les commodités, l’accessibilité, les toilettes, le stationnement, l’éclairage, le niveau d’entretien et le service responsable.

Types permis : `NEIGHBORHOOD`, `REGIONAL`, `RIVERFRONT`, `SPORTS`, `NATURE`, `PLAZA`, `OTHER`.

Niveaux d’entretien : `MINIMAL`, `STANDARD`, `ENHANCED`, `INTENSIVE`.

## Endpoints

| Méthode | Route | Rôles |
|---|---|---|
| `GET` | `/api/v1/municipal-assets/:assetId/park` | ADMIN, MANAGER, MUNICIPAL_AGENT, INSPECTOR, VIEWER |
| `PUT` | `/api/v1/municipal-assets/:assetId/park` | ADMIN, MANAGER, MUNICIPAL_AGENT |

## Sécurité

- `municipalityId` provient exclusivement du jeton;
- un actif absent ou externe produit une réponse uniforme;
- seuls les actifs `PARK` non archivés sont acceptés;
- Joi valide toutes les entrées;
- les routes utilisent les limiteurs d’actifs;
- les mises à jour utilisent un contrôle de version;
- chaque enregistrement produit un événement append-only `PARK_PROFILE_SAVED`;
- aucune suppression physique n’est exposée.

## Erreurs métier

- `ASSET_NOT_FOUND`;
- `ASSET_ARCHIVED`;
- `ASSET_TYPE_MISMATCH`;
- `PARK_NOT_FOUND`;
- `PARK_VERSION_CONFLICT`;
- `MUNICIPALITY_REQUIRED`.

## Tests

- contrat de migration;
- référentiels et contrôle de version;
- audit append-only;
- authentification et RBAC;
- validation Joi;
- propagation stricte du `municipalityId` du jeton.

## Limites

- aucune gestion d’arbre individuel;
- aucun calendrier d’entretien;
- aucune réservation d’installation;
- aucun fichier ou plan binaire;
- aucune inspection, garantie, maintenance ou dépense spécialisée.