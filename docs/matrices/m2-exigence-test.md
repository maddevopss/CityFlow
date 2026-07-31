# M2 — Matrice exigence ↔ test

## Statut

**MATRICE ACTIVE — AUCUNE EXIGENCE VALIDÉE PAR SIMPLE ASSOCIATION**

## Objet

Relier les exigences CityFlow aux scénarios de test qui les examinent et aux résultats obtenus.

## Colonnes obligatoires

| Exigence ID | Formulation | Niveau | Test ID | Scénario | Données | Environnement | Version | Résultat | Exécution | Preuve | Responsable | Réserves |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | Non exécuté | — | — | — | — |

## Règles de traçabilité

- chaque test possède un identifiant stable;
- les préconditions, données et résultats attendus sont explicites;
- le résultat brut et la date d’exécution sont conservés;
- un test automatisé indique son emplacement et son workflow;
- les tests manuels identifient l’exécutant;
- les résultats échoués ou inconclusifs restent visibles.

## Contrôles de cohérence

- toute exigence testable possède au moins un scénario;
- les exigences non testables expliquent leur mode de preuve;
- aucun test supprimé ne demeure présenté comme preuve active;
- la version et l’environnement testés sont identifiés;
- les anomalies renvoient au registre approprié.

## Gouvernance

- propriétaire : responsables qualité et validation;
- revue : à chaque changement d’exigence, de scénario ou d’architecture;
- conservation : résultats utilisés pour une décision de mise en production.

## Barrière finale

Un test réussi ne prouve que le scénario exécuté, avec ses données, sa version et son environnement. Il ne démontre pas l’absence d’autres défauts.
