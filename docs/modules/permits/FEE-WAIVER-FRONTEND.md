# Dispense des frais — interface municipale

## Objectif

Permettre aux gestionnaires autorisés de dispenser les frais d’un permis depuis sa fiche tout en conservant une preuve lisible de la décision.

## Accès

- consultation : tous les rôles municipaux ayant accès à la fiche du permis;
- décision : `ADMIN` et `MANAGER` uniquement.

## Parcours

Lorsque les frais sont à l’état `DUE`, le panneau permet de saisir un motif de dispense de 10 à 1000 caractères. Une confirmation explicite est demandée avant l’envoi.

Après succès, le panneau affiche :

- l’état `Dispensé`;
- le motif;
- la date de décision;
- l’identifiant de l’auteur.

## Contrat API

L’interface appelle :

`POST /api/v1/permits/:permitId/fees/waive`

avec :

```json
{ "reason": "Motif municipal documenté" }
```

La route backend conserve `permitWriteLimiter`, l’authentification et l’autorisation `ADMIN` ou `MANAGER`.

## Garde-fous

- aucun bouton de dispense lorsque les frais sont déjà payés ou dispensés;
- validation locale et validation serveur du motif;
- confirmation utilisateur avant mutation;
- rafraîchissement du frais et de la fiche après succès;
- aucune donnée bancaire manipulée.

## Limites

- aucune approbation à deux personnes;
- aucune annulation de dispense;
- aucune admissibilité automatique;
- l’auteur est affiché par son identifiant technique dans ce bloc.
