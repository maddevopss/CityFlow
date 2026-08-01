# Dispense des frais de permis

## Objectif

Permettre à une municipalité de constater officiellement qu’un frais de permis n’est pas exigé, sans supprimer l’évaluation financière ni perdre la preuve de la décision.

## Route

`POST /api/v1/permits/:permitId/fees/waive`

La route exige :

- un utilisateur authentifié;
- le rôle `ADMIN` ou `MANAGER`;
- une municipalité associée;
- un motif de 10 à 1000 caractères;
- le limiteur `permitWriteLimiter`.

## Données conservées

- état `WAIVED`;
- motif de dispense;
- identifiant de l’auteur;
- date de dispense;
- date de mise à jour.

Les références de paiement sont remises à `NULL` lors de la dispense.

## Règles

- un permis doit appartenir à la municipalité de l’utilisateur;
- un frais doit déjà être établi;
- un frais payé ne peut pas être dispensé;
- répéter la même dispense avec le même motif est idempotent;
- une nouvelle évaluation ultérieure remet le frais à l’état `DUE` et efface la preuve de dispense précédente.

## Réponses d’erreur

- `400` : identifiant ou motif invalide;
- `403` : rôle ou municipalité absente;
- `404` : permis ou frais introuvable;
- `409` : frais déjà payé.

## Limites

- aucune approbation à deux personnes;
- aucun remboursement;
- aucune règle automatique d’admissibilité;
- aucune interface frontend dans ce bloc.
