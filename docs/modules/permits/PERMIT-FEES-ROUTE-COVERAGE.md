# Couverture des routes de frais de permis

## Objectif

Garantir le contrat HTTP des routes municipales de frais de permis et empêcher qu'une évolution du module réduise silencieusement la couverture globale sous la barrière de qualité.

## Portée

Les tests couvrent :

- la consultation des frais;
- l'évaluation d'un montant;
- la devise `CAD` par défaut;
- la constatation d'un paiement;
- la dispense auditable;
- les identifiants invalides;
- l'absence de municipalité;
- les rôles non autorisés;
- les erreurs de validation;
- les ressources introuvables;
- les conflits de paiement ou de dispense;
- la transmission des erreurs inattendues au gestionnaire global.

## Sécurité vérifiée

Les tests passent par les routes Express réelles et confirment que :

- les routes de lecture conservent `permitReadLimiter`;
- les routes d'écriture conservent `permitWriteLimiter`;
- l'authentification est obligatoire;
- les écritures restent réservées à `ADMIN` et `MANAGER`;
- chaque opération exige un `municipalityId`;
- aucune donnée bancaire n'est manipulée.

## Limites

- les services métiers sont simulés afin d'isoler le contrat des routes;
- les migrations et contraintes PostgreSQL sont couvertes par leurs blocs dédiés;
- aucun fournisseur de paiement externe n'est appelé.
