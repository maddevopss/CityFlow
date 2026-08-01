# Guide développeur — API Inspections

## Authentification

Toutes les routes utilisent un jeton JWT transmis dans `Authorization: Bearer <token>`. La municipalité et le rôle proviennent exclusivement du jeton validé côté serveur.

## Rôles

- `ADMIN` et `MUNICIPAL_AGENT` peuvent créer, affecter et piloter les inspections;
- `INSPECTOR` ne consulte et ne termine que les inspections qui lui sont affectées;
- les ressources d’une autre municipalité répondent comme introuvables.

## Cycle minimal

1. `POST /api/v1/inspections` pour planifier;
2. `POST /api/v1/inspections/{id}/assign` pour affecter;
3. `POST /api/v1/inspections/{id}/evidence` pour enregistrer les métadonnées de preuve;
4. `POST /api/v1/inspections/{id}/complete` pour terminer;
5. `GET /api/v1/inspection-reports/{id}` pour produire le rapport;
6. `POST /api/v1/inspection-notifications/dispatch` pour préparer ou mettre en file la notification.

## Pagination et recherche

La liste accepte `page`, `pageSize`, `status`, `inspectionType`, `assignedTo`, `scheduledFrom`, `scheduledTo` et `q`. `pageSize` est borné à 100. La réponse contient `items` et `pagination`.

## Idempotence

Les opérations de synchronisation et de notification doivent fournir une clé idempotente lorsque leur contrat l’exige. Un client doit réutiliser la même clé lors d’une reprise après délai d’attente.

## Erreurs

- `400` : entrée invalide;
- `401` : jeton absent ou invalide;
- `403` : rôle insuffisant;
- `404` : ressource absente ou hors périmètre municipal;
- `409` : transition ou doublon incompatible;
- `429` : quota dépassé, avec `Retry-After`.

## Compatibilité

Les changements incompatibles exigent une nouvelle version d’API. Les champs ajoutés restent optionnels jusqu’à la publication d’une version majeure suivante.

## Validation locale

Le fichier `inspections.openapi.yaml` doit être validé par un analyseur OpenAPI 3.1 et comparé aux tests d’intégration des routes avant chaque publication.
