# Frais et paiements des permis

## Objectif

Ce bloc ajoute un registre municipal simple pour établir les frais d’un permis et constater leur paiement sans intégrer directement un fournisseur de paiement.

## Contrats API

- `GET /api/v1/permits/:permitId/fees` : consulter les frais; rôles municipaux autorisés; `permitReadLimiter`.
- `PUT /api/v1/permits/:permitId/fees` : créer ou remplacer l’évaluation; rôles `ADMIN` et `MANAGER`; `permitWriteLimiter`.
- `POST /api/v1/permits/:permitId/fees/mark-paid` : constater un paiement; rôles `ADMIN` et `MANAGER`; `permitWriteLimiter`.

Les montants sont stockés en cents afin d’éviter les erreurs d’arrondi. La devise est un code de trois lettres et vaut `CAD` par défaut.

## États

- `DUE` : montant établi et non payé;
- `PAID` : paiement constaté avec une référence externe unique;
- `WAIVED` : réservé à un bloc futur de dispense gouvernée.

## Idempotence

Répéter `mark-paid` avec la même référence retourne le paiement existant. Une référence différente après paiement produit un conflit `409 PERMIT_FEE_ALREADY_PAID`.

## Sécurité

Chaque opération vérifie le permis par `municipalityId`, `id` et `sourceType=PERMIT`. Les routes sont limitées en débit avant l’authentification et l’autorisation, conformément aux barrières CodeQL du dépôt.

## Limites

- aucun encaissement bancaire ou Stripe n’est exécuté;
- aucune donnée de carte n’est stockée;
- l’interface frontend sera livrée séparément;
- la dispense de frais et les remboursements ne sont pas encore exposés;
- ce bloc constate un paiement externe à partir d’une référence fournie par un système autorisé.
