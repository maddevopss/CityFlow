# Préparation à la production de CityFlow

## Principe de décision

La mise en production n’est pas une impression générale. Elle repose sur des preuves récentes, traçables et attribuées.

## Barrières obligatoires

### Sécurité

- secrets distincts par environnement;
- aucun secret réel dans Git ou dans les journaux;
- isolation municipale testée aux niveaux HTTP, temps réel et base de données;
- webhook signé et protégé contre la répétition;
- rôles administrateur et agent vérifiés;
- export public limité aux champs autorisés.

### Données

- migrations répétées dans un environnement représentatif;
- sauvegarde récente, vérifiée et stockée hors de l’hôte;
- restauration complète démontrée;
- journal d’audit préservé;
- plan de retour arrière approuvé.

### Exploitation

- métriques accessibles par le réseau d’exploitation seulement;
- alertes testées jusqu’au canal de destination;
- tableau de bord disponible;
- objectifs de santé et de délai visibles;
- procédure d’incident exercée;
- responsables d’astreinte identifiés.

### Capacité et fiabilité

- test de capacité exécuté sur une version candidate;
- marge de capacité documentée;
- reprise du worker et de la sortie transactionnelle démontrée;
- file morte et relance manuelle vérifiées;
- arrêt propre testé.

## Décision

Le statut doit être l’un des suivants :

- **GO** : toutes les barrières obligatoires sont satisfaites;
- **GO avec réserve** : aucune réserve critique, propriétaire et échéance définis;
- **NO-GO** : preuve manquante ou risque critique non maîtrisé.

Une réserve ne peut jamais contourner l’isolation municipale, l’intégrité des données, la restauration ou la gestion des secrets.
