# CF2X-CADRE-0001 — Reproductibilité des expériences

## Objet

Établir les conditions minimales pour qu’une preuve CityFlow puisse être rejouée par une autre personne et produire un résultat comparable.

## Exigences obligatoires

Chaque exécution doit identifier :

- la preuve et sa version;
- le jeu de données et son empreinte;
- l’environnement;
- les dépendances et leurs versions;
- les paramètres;
- la date et l’opérateur;
- les commandes exécutées;
- les résultats attendus et obtenus;
- les écarts;
- la décision humaine.

## Environnement

L’environnement doit être isolé, réinitialisable et dépourvu de données réelles. Les variations connues doivent être déclarées. Toute dépendance externe doit être simulée ou figée.

## Procédure canonique

1. vérifier les empreintes;
2. créer un environnement vierge;
3. charger le jeu synthétique;
4. exécuter les préconditions;
5. lancer les scénarios dans l’ordre déclaré;
6. capturer les sorties et refus;
7. comparer aux invariants;
8. réinitialiser;
9. rejouer au moins une fois;
10. faire réviser le rapport par une personne distincte.

## Résultats

Les verdicts permis sont :

- réussi;
- réussi avec écarts acceptés;
- non concluant;
- échoué;
- invalidé.

Un verdict sans artefacts complets est automatiquement `invalidé`.

## Stabilité

Une preuve est reproductible lorsque deux exécutions indépendantes utilisent les mêmes entrées et produisent les mêmes décisions observables, à l’exception des champs explicitement non déterministes.

## Gestion des écarts

Tout écart doit préciser :

- sa cause connue ou inconnue;
- son effet sur la conclusion;
- son propriétaire;
- la correction proposée;
- la nécessité ou non d’une nouvelle exécution.

Aucun écart ne peut être masqué par une moyenne ou un résumé.

## Conservation

Les artefacts sont conservés avec leur empreinte, leur statut et leur durée de validité. Une modification du protocole, du jeu ou d’une dépendance critique invalide les résultats antérieurs jusqu’à réévaluation.

## Indépendance

La personne qui approuve la conclusion ne doit pas être la seule personne ayant conçu et exécuté la preuve. Les conflits d’intérêts sont déclarés.

## Interdictions

- ajuster les résultats après coup;
- supprimer les échecs;
- sélectionner seulement les scénarios favorables;
- changer les critères après l’exécution;
- déclarer une preuve supérieure à son niveau réel.

## Portée

Ce cadre gouverne les preuves P1 et les préparations P2. Il ne constitue pas une autorisation opérationnelle.