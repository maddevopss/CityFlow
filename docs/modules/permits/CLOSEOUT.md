# Fermeture du module — Permis municipaux

## Capacités livrées

- ingestion idempotente et protégée contre la concurrence;
- registre municipal filtrable et paginé;
- fiche détaillée avec historique et inspections;
- cycle de décision complet;
- pièces justificatives vérifiables;
- catalogue municipal des pièces obligatoires;
- blocage de l’approbation sans conformité documentaire;
- frais, paiement externe et dispense auditable;
- délivrance officielle transactionnelle et idempotente;
- interfaces municipales correspondantes;
- tests unitaires, intégration, compilation et couverture;
- documentation de sécurité, exploitation, observabilité et validation.

## Preuves de conception

Le backend demeure l’autorité pour les rôles, la municipalité, les transitions et la conformité. Les opérations sensibles sont limitées, validées et auditables. Les répétitions légitimes sont idempotentes et les conflits sont explicites.

## Dépendances externes assumées

- stockage des fichiers;
- encaissement bancaire;
- signature électronique;
- diffusion automatique au demandeur;
- plateforme finale de métriques et d’alertes.

## Décision

Le module Permis municipaux est considéré fonctionnellement complet pour sa portée actuelle. Les ajouts futurs seront traités comme de nouvelles capacités et non comme des éléments manquants de cette fermeture.

## Conditions de constat définitif

La fermeture devient définitive après fusion des PR de sécurité, exploitation, observabilité et validation, puis comparaison confirmant leur présence dans `main` avec toutes les vérifications obligatoires vertes.