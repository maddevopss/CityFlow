# Catalogue municipal des pièces obligatoires

## Objectif

Centraliser, par municipalité et par type de permis, la liste des pièces qui doivent être acceptées avant une approbation.

## Modèle

Chaque entrée associe :

- une municipalité;
- un type de permis normalisé;
- une liste dédupliquée de types de documents obligatoires;
- l’utilisateur ayant effectué la dernière modification.

L’unicité est garantie par `(municipalityId, permitSubtype)`.

## Contrats API

### Lecture

`GET /api/v1/permits/document-requirements`

- limiteur : `permitReadLimiter`;
- rôles : `ADMIN`, `MANAGER`, `MUNICIPAL_AGENT`, `VIEWER`;
- isolation : municipalité du jeton.

### Mise à jour

`PUT /api/v1/permits/document-requirements`

- limiteur : `permitWriteLimiter`;
- rôles : `ADMIN`, `MANAGER`;
- corps : `permitSubtype` et `requiredDocumentTypes`;
- normalisation : majuscules, espaces retirés, doublons supprimés.

## Règle de décision

Lors de l’approbation :

1. CityFlow cherche une exigence municipale correspondant au type du permis;
2. si elle existe, elle devient la source d’autorité;
3. sinon, `details.requiredDocumentTypes` demeure le repli compatible;
4. toutes les pièces obligatoires doivent être présentes et acceptées.

## Sécurité

Toutes les routes possèdent un limiteur explicite avant l’authentification et l’autorisation. Aucune municipalité ne peut lire ou modifier le catalogue d’une autre municipalité.

## Limites

Ce bloc fournit le backend et les contrats. L’écran d’administration du catalogue sera livré séparément afin de garder une PR ciblée et testable.
