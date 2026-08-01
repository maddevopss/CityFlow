# Couverture métier des frais de permis

## Objectif

Fermer les branches non couvertes du service `permitFees` sans modifier la logique de production.

## Scénarios couverts

- absence de frais lors d’une consultation;
- établissement avec devise et note par défaut;
- établissement avec paramètres SQL vérifiés;
- paiement idempotent avec la même référence;
- refus d’une seconde référence de paiement;
- refus d’un paiement lorsqu’aucun frais n’existe;
- paiement avec une date explicite;
- paiement laissant PostgreSQL choisir la date courante;
- isolation stricte par municipalité;
- absence d’accès SQL lorsque le permis n’appartient pas à la municipalité.

## Sécurité et intégrité

Les tests vérifient que la recherche du permis inclut toujours :

- l’identifiant du permis;
- la municipalité courante;
- le type de source `PERMIT`.

Ils vérifient aussi que les paramètres sensibles restent transmis séparément à la requête SQL plutôt que concaténés dans la chaîne.

## Limites

- la base PostgreSQL est simulée;
- aucune migration n’est ajoutée;
- aucune logique métier ou route HTTP n’est modifiée;
- les tests d’intégration des routes demeurent dans la PR précédente dédiée.
