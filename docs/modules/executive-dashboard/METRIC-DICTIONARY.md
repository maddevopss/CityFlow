# Dictionnaire des indicateurs exécutifs

## Règles communes

- toutes les mesures sont limitées à la municipalité du jeton;
- la période par défaut couvre les 30 derniers jours;
- les valeurs financières sont exprimées dans la devise de la municipalité;
- la date `generatedAt` indique la fraîcheur du calcul;
- aucun renseignement nominatif citoyen ou employé n’est retourné.

## Inspections

- `total`: inspections créées dans la période;
- `completed`: inspections terminées;
- `nonCompliant`: inspections avec résultat non conforme.

## Permis

- `total`: demandes créées;
- `issued`: permis délivrés;
- `pending`: demandes soumises ou en révision.

## Actifs

- `total`: actifs enregistrés;
- `outOfService`: actifs hors service;
- `critical`: actifs classés critiques.

## Travaux publics

- `total`: ordres créés;
- `backlog`: ordres brouillons, planifiés ou affectés;
- `actualCost`: somme des coûts réels dans la période.

## Signalements citoyens

- `total`: signalements reçus;
- `open`: signalements reçus, triés ou en traitement;
- `resolved`: signalements résolus.

## Dépendances

Le tableau exécutif dépend des migrations et contrats API des modules Inspections, Permis, Actifs, Travaux publics et Signalements citoyens. Il doit être fusionné après leurs socles backend.
