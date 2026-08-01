# Contrat d’observabilité — Permis municipaux

## Événements à mesurer

- ingestion créée, mise à jour, conflit et rejet;
- transition soumise, approuvée, refusée et fermée;
- pièce ajoutée, acceptée et refusée;
- frais évalué, payé et dispensé;
- délivrance créée ou bloquée.

## Dimensions minimales

- `municipalityId`;
- route et méthode HTTP;
- code de résultat métier;
- statut HTTP;
- durée;
- rôle de l’acteur;
- identifiant de corrélation;
- sous-type de permis lorsque disponible.

## Données interdites

- contenu des pièces;
- jetons d’accès;
- données bancaires;
- motif complet lorsqu’il peut contenir des renseignements personnels;
- charge JSON intégrale provenant d’un partenaire.

## Indicateurs opérationnels

- taux de succès par opération;
- erreurs 5xx;
- conflits 409;
- temps entre soumission et décision;
- temps entre approbation et délivrance;
- nombre de permis bloqués par pièces ou frais;
- répétitions de références de paiement.

## Alertes recommandées

- hausse soutenue des erreurs 5xx;
- absence d’ingestion attendue;
- explosion des conflits d’unicité;
- délivrances bloquées anormalement;
- latence élevée sur les lectures ou écritures;
- augmentation des refus d’autorisation.

## Conservation

Les métriques agrégées peuvent être conservées plus longtemps que les journaux détaillés. Les identifiants techniques doivent suivre la politique générale de rétention de CityFlow.