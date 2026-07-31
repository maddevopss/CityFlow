# T4 — Registre des changements

## Statut

**REGISTRE VIVANT — AUCUN CHANGEMENT PRÉSUMÉ SÛR PAR SA SEULE APPROBATION**

## Objet

Conserver la préparation, l’autorisation, l’exécution, la validation et le retour d’expérience des changements apportés à CityFlow.

## Portée

Le registre couvre le code, les configurations, les données, les infrastructures, les interfaces, les dépendances, les procédures, les politiques, les documents de référence et les activations fonctionnelles.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | `CHG-AAAA-NNN` unique |
| Titre | Description courte et précise |
| Type | standard, normal, urgent ou retrait |
| Demandeur | Personne ou rôle à l’origine |
| Responsable | Propriétaire de l’exécution |
| Justification | Besoin et résultat attendu |
| Portée | Services, données, territoires et publics touchés |
| Dépendances | Éléments requis ou affectés |
| Risques | Analyse et niveau résiduel |
| Plan | Étapes, ordre et responsabilités |
| Validation préalable | Tests, revues et preuves |
| Fenêtre | Date, heure et contraintes |
| Critères go/no-go | Conditions d’autorisation ou d’arrêt |
| Retour arrière | Déclencheurs, procédure et preuve de capacité |
| Communication | Publics, messages et canaux |
| Résultat | réalisé, partiel, échoué, annulé ou retiré |
| Validation après changement | Santé, impacts et observations |
| Revue | Leçons, écarts et actions suivantes |

## Entrées

| Identifiant | Titre | Type | Statut | Responsable | Fenêtre | Risque | Résultat | Preuves |
|---|---|---|---|---|---|---|---|---|
| — | Registre initialisé | documentaire | actif | Maintenance CityFlow | 2026-07-31 | non évalué | créé | Historique Git |

## Cycle de vie

1. Enregistrer le changement avant son exécution, sauf urgence justifiée.
2. Relier risques, validations, dépendances et communications.
3. Documenter la décision go/no-go.
4. Conserver les observations pendant l’exécution.
5. Valider la santé et les impacts après activation.
6. Exécuter une revue pour tout échec, urgence ou impact significatif.

## Gouvernance

- propriétaire : responsable de la gestion des changements CityFlow;
- autorisation : rôle proportionné au risque et à la portée;
- revue : après chaque changement significatif et périodiquement pour les changements standards;
- urgence : justification, durée et revue rétrospective obligatoires;
- conservation : historique complet, y compris échecs et annulations.

## Preuves attendues

- demande et justification;
- analyse des impacts et risques;
- validations préalables;
- décision d’autorisation;
- journal d’exécution;
- preuve de santé ou de retour arrière;
- communication et revue.

## Barrière finale

Une approbation ne prouve ni la sécurité ni la réussite d’un changement. Les validations, les critères d’arrêt, le retour arrière et les observations après activation demeurent obligatoires.
