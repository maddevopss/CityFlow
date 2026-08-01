# Bloc 2 — Exploitation

## Objectif

Rendre CityFlow opérable avec sauvegardes vérifiables, supervision, journaux corrélés, gestion des incidents et exercices de reprise.

## Sauvegarde et restauration

- sauvegarde PostgreSQL quotidienne chiffrée;
- conservation définie par environnement;
- test de restauration au minimum mensuel sur une base isolée;
- preuve obligatoire : empreinte du fichier, durée, taille, version PostgreSQL et résultat de validation;
- aucun test de restauration ne doit viser la production.

## Supervision

Métriques minimales : disponibilité, débit, erreurs 4xx/5xx, p50/p95/p99, saturation base de données, files d’attente, tâches planifiées, délais métier et fraîcheur des KPI. Les alertes doivent contenir service, environnement, corrélation, impact estimé et procédure associée.

## Journaux

Tous les services propagent un identifiant de corrélation. Les journaux excluent secrets, jetons, mots de passe et données personnelles non nécessaires. La durée de conservation est définie et révisée.

## Incidents et astreinte

Sévérités : SEV-1 indisponibilité ou fuite; SEV-2 dégradation majeure; SEV-3 défaut limité; SEV-4 demande non urgente. Chaque incident produit chronologie, décision, restauration, cause, actions et preuve de fermeture.

## Reprise après sinistre

Objectifs initiaux à confirmer : RPO 24 h et RTO 4 h. Un exercice trimestriel valide restauration base, secrets, stockage objet, DNS, déploiement et vérifications fonctionnelles.

## GO / NO-GO

NO-GO si aucune sauvegarde récente vérifiable, si la restauration n’a jamais été exercée, si une alerte critique n’a pas de procédure ou si les journaux exposent des secrets.
