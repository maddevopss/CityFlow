# Interface municipale des frais et paiements de permis

## Objectif

Permettre aux équipes municipales de consulter le montant exigé pour un permis, d’enregistrer ou de corriger l’évaluation avant paiement et de constater un paiement réalisé dans un système externe autorisé.

## Parcours

1. Ouvrir la page **Permis municipaux**.
2. Sélectionner un permis dans le registre.
3. Consulter le panneau **Frais et paiement** dans la fiche.
4. Pour un administrateur ou un gestionnaire, saisir le montant en dollars et une note facultative.
5. Lorsque le frais est à payer, saisir la référence du reçu ou de la transaction externe.
6. Constater le paiement; l’état devient **Payé**.

## Permissions

- `VIEWER` et `MUNICIPAL_AGENT` peuvent consulter le montant et son état.
- `ADMIN` et `MANAGER` peuvent évaluer les frais et constater le paiement.
- Le backend demeure l’autorité pour les permissions et l’isolation municipale.

## Validation de saisie

- le montant accepte zéro ou une valeur positive;
- deux décimales au maximum;
- le montant est converti en cents avant l’appel API;
- la devise envoyée est `CAD`;
- la référence de paiement contient entre 3 et 200 caractères;
- aucune donnée bancaire ou de carte n’est demandée par l’interface.

## États

- **À payer** : un montant existe et aucun paiement n’est constaté;
- **Payé** : une référence externe a été enregistrée;
- **Dispensé** : état réservé au backend pour un futur bloc de dispense.

## Contrats utilisés

- `GET /api/v1/permits/:permitId/fees`;
- `PUT /api/v1/permits/:permitId/fees`;
- `POST /api/v1/permits/:permitId/fees/mark-paid`.

## Limites

- aucun paiement n’est traité dans CityFlow;
- aucun remboursement ni annulation de paiement;
- aucune dispense n’est exposée dans cette interface;
- la référence externe est une preuve déclarative et doit provenir d’un système autorisé;
- la délivrance officielle du permis sera traitée dans un bloc distinct.
