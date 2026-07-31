# T14 — Registre des validations

## Statut

**REGISTRE INITIALISÉ — AUCUNE VALIDATION RÉELLE CONSIGNÉE**

## Objet

Conserver les validations CityFlow de manière reproductible, attribuée et reliée aux exigences, versions, environnements et preuves.

## Portée

Le registre couvre les essais fonctionnels, techniques, de sécurité, de performance, d’accessibilité, de reprise, de données, d’intégration et les validations humaines.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | unique |
| Objet | élément validé |
| Exigence | critère ou décision source |
| Version | version exacte |
| Environnement | contexte d’exécution |
| Scénario | étapes reproductibles |
| Données | jeux et préconditions |
| Responsable | exécutant |
| Date | moment d’exécution |
| Résultat attendu | seuil ou comportement |
| Résultat observé | faits mesurés |
| Verdict | conforme, non conforme ou inconclusif |
| Écarts | anomalies et réserves |
| Preuves | journaux, captures, rapports ou artefacts |
| Statut | prévue, exécutée, contestée, remplacée ou close |

## Registre

| ID | Objet | Version | Environnement | Exigence | Responsable | Date | Verdict | Écarts | Preuves |
|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Relier la validation à une exigence explicite.
2. Fixer version, environnement et préconditions.
3. Exécuter sans modifier silencieusement le scénario.
4. Conserver les résultats bruts et défavorables.
5. Qualifier le verdict et les limites.
6. Réexécuter après correction ou changement pertinent.

## Gouvernance

- propriétaire du registre : responsables de qualité CityFlow;
- mise à jour : à chaque planification, exécution, contestation ou remplacement;
- revue : avant toute décision reposant sur la validation;
- conservation : résultats, versions et artefacts liés;
- rapprochement : registres des versions, environnements, changements, audits et obligations.

## Preuves attendues

- scénario versionné;
- données et préconditions;
- journaux ou résultats bruts;
- identité de l’exécutant;
- écarts et réserves;
- décision fondée sur le résultat.

## Barrière finale

Une validation réussie ne vaut que pour l’exigence, la version, les données et l’environnement testés. Elle ne démontre pas une qualité générale ni l’absence d’autres défauts.