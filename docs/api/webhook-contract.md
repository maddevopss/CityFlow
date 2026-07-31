# Contrat des webhooks CityFlow

## Livraison

- identifiant unique d’événement;
- horodatage UTC;
- type et version de schéma;
- signature HMAC vérifiable;
- reprises avec délai croissant;
- file morte après épuisement;
- journalisation sans contenu sensible.

## Consommateur

Le consommateur doit traiter les événements de façon idempotente, vérifier la signature avant lecture et répondre rapidement avant tout travail long.

## Évolution

Les champs nouveaux sont ajoutés sans casser les consommateurs existants. Toute suppression exige une nouvelle version et une période de transition.