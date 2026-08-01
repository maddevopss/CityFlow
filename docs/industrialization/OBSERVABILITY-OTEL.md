# Observabilité complète

## Objectif

Fournir des métriques, journaux et traces corrélables pour toutes les requêtes CityFlow sans exposer de données sensibles.

## Contrat

- identifiant de corrélation propagé du frontal au backend;
- métriques HTTP : débit, erreurs, latence p50/p95/p99;
- métriques métier par module sans identifiant citoyen;
- traces distribuées via OpenTelemetry;
- export OTLP configurable;
- tableaux de bord pour disponibilité, erreurs, files et tâches planifiées;
- alertes avec propriétaire, seuil, fenêtre et procédure associée.

## Données interdites

Les mots de passe, jetons, cookies, pièces jointes, corps complets et données personnelles ne doivent jamais apparaître dans les attributs de trace ou les journaux.

## SLO initiaux

- disponibilité API : 99,9 %;
- p95 lecture : 500 ms;
- p95 écriture : 800 ms;
- taux d’erreur serveur : inférieur à 1 %;
- fraîcheur des tâches planifiées : moins de 10 minutes.

## GO / NO-GO

GO si la configuration est validée, les attributs sensibles sont exclus et chaque alerte possède un runbook. NO-GO si une trace contient un secret, si les métriques ne sont pas isolées par municipalité ou si une alerte est sans propriétaire.
