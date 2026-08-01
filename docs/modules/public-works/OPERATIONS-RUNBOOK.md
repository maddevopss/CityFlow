# Guide d’exploitation — Travaux publics

## Vérifications quotidiennes

- ordres urgents non affectés;
- ordres en état `BLOCKED`;
- véhicules affectés alors qu’ils ne sont plus disponibles;
- ordres `COMPLETED` non fermés;
- échecs de création d’événements;
- erreurs 409 et 500 sur les routes du module.

## Diagnostic

1. confirmer la municipalité de l’utilisateur;
2. confirmer le rôle serveur;
3. valider l’identifiant UUID;
4. vérifier l’état courant de l’ordre;
5. vérifier l’état de l’équipe et du véhicule;
6. consulter l’historique append-only;
7. vérifier les preuves et matériaux;
8. conserver le requestId avant escalade.

## Actions interdites

- modifier directement l’état dans la base;
- supprimer l’historique;
- contourner les limiteurs;
- déplacer un ordre vers une autre municipalité;
- inscrire des secrets ou contenus documentaires dans les journaux.

## Escalade

Conserver le requestId, l’identifiant de l’ordre, la municipalité, l’état attendu, l’état observé, le rôle utilisé et l’heure exacte. Ne jamais copier de jeton ni de contenu de preuve.

## Limites

Le guide ne remplace pas les sauvegardes, les procédures d’incident globales ni le plan de reprise après sinistre.