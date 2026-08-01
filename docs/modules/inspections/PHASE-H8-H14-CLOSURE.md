# Clôture de la phase avancée des inspections

## Statut

Phase H8 à H14 préparée sous forme de pile de pull requests révisables.

## Blocs

| Bloc | Pull request | Capacité |
|---|---:|---|
| H8 | #406 | Tableau de bord opérationnel |
| H9 | #407 | Indicateurs et tendances |
| H10 | #408 | Synchronisation hors ligne |
| H11 | #409 | Rapports déterministes et signables |
| H12 | #410 | Optimisation initiale des tournées |
| H13 | #411 | Contrat de notifications externes |
| H14 | #412 | Consolidation et clôture documentaire |

## Ordre d’intégration

Les PR sont empilées. Elles doivent être fusionnées dans l’ordre numérique. Après chaque fusion, la PR suivante doit être rebasée ou sa base doit être replacée sur `main` avant la fusion.

## Garanties communes

- authentification et contrôle des rôles;
- isolation municipale lorsqu’une donnée persistée est consultée;
- validation structurée des entrées;
- tests ciblés par capacité;
- déclaration de traçabilité dans chaque PR;
- limites explicites pour éviter de présenter une fondation comme une intégration fournisseur complète.

## Risques résiduels

- la synchronisation ne conserve pas encore de reçu serveur durable;
- la signature ne repose pas encore sur un certificat institutionnel;
- l’optimisation utilise une distance géométrique sans réseau routier;
- les notifications ne disposent pas encore d’adaptateurs fournisseurs ni d’une file durable;
- une validation terrain mobile complète demeure nécessaire.

## Critères de fermeture

La phase est considérée intégrée lorsque les PR #407 à #411 sont fusionnées dans l’ordre, que leurs contrôles CI sont verts et que leurs limites sont inscrites dans la feuille de route opérationnelle.
