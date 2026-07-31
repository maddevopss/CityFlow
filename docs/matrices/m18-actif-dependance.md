# M18 — Matrice actif ↔ dépendance

## Statut

**MATRICE DISPONIBLE — AUCUN ACTIF RÉELLEMENT QUALIFIÉ PAR CE DOCUMENT**

## Objet

Relier les actifs CityFlow à leurs dépendances techniques, organisationnelles et fournisseurs afin d’identifier les concentrations de risque et les points uniques de défaillance.

## Colonnes obligatoires

| Actif | Type | Criticité | Propriétaire | Dépendance | Type de dépendance | Fournisseur ou équipe | Mode de défaillance | Mesure de repli | Preuve de test | Dernière revue |
|---|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — | — |

## Règles de traçabilité

- chaque actif doit correspondre à une entrée du registre T7;
- chaque dépendance doit correspondre à T8 ou être ajoutée à ce registre;
- les fournisseurs concernés doivent être reliés à T15;
- les actifs critiques doivent documenter un mode de défaillance et une mesure de repli;
- la preuve de test doit identifier le scénario, la date et le résultat.

## Contrôles de cohérence

- aucun actif critique sans propriétaire;
- aucune dépendance critique sans responsable ni plan de repli;
- aucun point unique de défaillance non accepté explicitement;
- aucune dépendance retirée encore déclarée active;
- aucun test ancien présenté comme preuve actuelle sans justification.

## Gouvernance

- propriétaire : architecture et exploitation CityFlow;
- contributeurs : sécurité, données, fournisseurs et responsables de service;
- revue : trimestrielle et après tout changement d’architecture ou incident majeur;
- sources : T7, T8, T15, T3 et M4.

## Barrière finale

Une dépendance documentée n’est pas nécessairement maîtrisée. Sa disponibilité, sa capacité, sa sécurité et son mécanisme de repli doivent être démontrés séparément.
