# CF2X-PREUVE-0005 — Pilote municipal limité

## Statut

- Initiative liée : `CF2X-INIT-0005`
- Niveau visé : `P1 — preuve conceptuelle reproductible`
- État : `À exécuter`

## Question de preuve

Un pilote CityFlow peut-il être défini de manière assez précise pour être mesuré, suspendu et fermé sans devenir une mise en production implicite?

## Hypothèses

1. Le périmètre du pilote est borné par fonctions, utilisateurs, données et durée.
2. Les critères de succès et d’arrêt sont décidés avant le début.
3. L’autorité municipale peut suspendre immédiatement le pilote.
4. Toute donnée produite possède une règle de conservation ou destruction.
5. La sortie du pilote est explicite, même en cas de succès.
6. Aucun élargissement n’est automatique.

## Pilote synthétique

Le scénario utilise une municipalité fictive, douze agents fictifs, deux services, cinquante dossiers synthétiques et une durée simulée de trente jours.

## Scénarios

1. Validation de l’admissibilité avant ouverture.
2. Refus du démarrage lorsqu’une preuve obligatoire manque.
3. Activation pour les seuls utilisateurs autorisés.
4. Mesure quotidienne des critères convenus.
5. Détection d’un dépassement de périmètre.
6. Suspension immédiate à la suite d’un incident critique.
7. Retour arrière vers l’état antérieur.
8. Reprise après décision humaine documentée.
9. Fin normale avec critères atteints.
10. Fin anticipée avec critères non atteints.
11. Destruction ou archivage contrôlé des données.
12. Refus de transformation automatique en service permanent.

## Mesures minimales

- taux de réussite des tâches;
- erreurs et incidents;
- temps de traitement;
- compréhension des utilisateurs;
- accessibilité;
- demandes de soutien;
- écarts de périmètre;
- capacité de retour arrière.

## Critères d’échec

La preuve échoue si le pilote peut commencer sans décision, dépasser son périmètre sans alerte, survivre à sa date de fin, conserver des données sans règle ou devenir permanent sans nouvelle autorisation.

## Artefacts exigés

- charte synthétique du pilote;
- matrice des responsabilités;
- calendrier;
- tableau de mesures;
- journal des incidents;
- preuve de suspension et retour arrière;
- rapport de fermeture;
- décision humaine.

## Décision permise

Une réussite P1 autorise seulement la préparation d’un environnement P2 et d’un protocole de simulation. Aucun pilote municipal réel n’est autorisé.