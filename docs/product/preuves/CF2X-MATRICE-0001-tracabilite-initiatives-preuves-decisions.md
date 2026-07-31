# CF2X-MATRICE-0001 — Traçabilité initiatives, preuves et décisions

## Objet

Relier chaque initiative CityFlow 2.x à ses preuves, ses résultats, ses risques et la décision humaine qui en découle.

## Règle

Aucune initiative ne peut progresser sur la base d’une impression générale. Chaque changement d’état exige une chaîne complète :

`initiative → hypothèse → scénario → artefact → résultat → risque → décision`.

## Matrice initiale

| Initiative | Preuve P1 | Objet principal | État initial | Décision maximale après P1 |
|---|---|---|---|---|
| `CF2X-INIT-0001` | `CF2X-PREUVE-0001` | modèle géographique | à exécuter | préparer un prototype isolé P2 |
| `CF2X-INIT-0002` | `CF2X-PREUVE-0002` | cycle de publication | à exécuter | préparer un prototype isolé P2 |
| `CF2X-INIT-0003` | `CF2X-PREUVE-0003` | isolation et audit | à exécuter | préparer des tests automatisés P2 |
| `CF2X-INIT-0004` | `CF2X-PREUVE-0004` | intégrations versionnées | à exécuter | préparer des adaptateurs isolés P2 |
| `CF2X-INIT-0005` | `CF2X-PREUVE-0005` | pilote municipal limité | à exécuter | préparer une simulation P2 |

## Champs obligatoires par résultat

- identifiant du résultat;
- initiative et preuve liées;
- version du protocole;
- version et empreinte des données;
- date d’exécution;
- verdict;
- écarts;
- risques ouverts;
- durée de validité;
- approbateur;
- décision permise;
- décision interdite.

## États de traçabilité

- incomplet;
- prêt à exécuter;
- exécuté sans revue;
- revu;
- expiré;
- invalidé.

Une initiative ne peut progresser que si tous ses liens critiques sont `revus` et non expirés.

## Gestion des changements

Toute modification d’une hypothèse, d’un scénario, d’un jeu de données ou d’une dépendance critique crée une nouvelle version et déclenche une analyse d’impact. Les résultats touchés deviennent `à réévaluer`.

## Risques transversaux

La matrice doit rendre visibles les risques partagés :

- confusion géographique;
- publication incorrecte;
- fuite intermunicipale;
- rupture d’intégration;
- pilote sans fermeture;
- perte de provenance;
- décision automatisée non autorisée.

## Autorité

La matrice informe la décision; elle ne la prend pas. Toute progression demeure une décision humaine nominative et datée.

## Portée

Ce document initialise la traçabilité P1. Les cellules de résultat demeurent vides jusqu’à l’exécution réelle des preuves.