# T1 — Registre des décisions

## Statut

**REGISTRE VIVANT — AUCUNE DÉCISION PRÉSUMÉE VALIDE SANS PREUVE**

## Objet

Conserver les décisions structurantes de CityFlow, leur contexte, leurs responsables, leurs limites et leurs conditions de révision.

## Portée

Le registre couvre les décisions institutionnelles, métier, techniques, opérationnelles, de sécurité, de données, de déploiement et de gouvernance.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | `DEC-AAAA-NNN` unique et stable |
| Titre | Résumé clair de la décision |
| Date | Date de prise d’effet |
| Statut | proposée, approuvée, refusée, remplacée, expirée ou retirée |
| Responsable | Personne ou rôle qui répond de la décision |
| Autorité | Rôle habilité à approuver |
| Contexte | Besoin, problème, contrainte ou événement déclencheur |
| Options | Solutions examinées, incluant l’option de ne rien changer |
| Décision | Choix retenu et justification |
| Portée | Systèmes, territoires, équipes et données touchés |
| Limites | Exclusions, hypothèses et inconnues |
| Risques | Risques résiduels et traitements associés |
| Preuves | Analyses, validations, avis et documents liés |
| Révision | Date ou événement déclencheur du réexamen |
| Remplacement | Identifiant de la décision qui la remplace, le cas échéant |

## Entrées

| Identifiant | Titre | Statut | Responsable | Autorité | Date | Révision | Preuves |
|---|---|---|---|---|---|---|---|
| — | Registre initialisé | active | Maintenance CityFlow | Gouvernance du dépôt | 2026-07-31 | À la première décision réelle | Historique Git |

## Cycle de vie

1. Créer l’entrée avant l’exécution lorsque la situation le permet.
2. Relier les options, risques et preuves disponibles.
3. Faire approuver par l’autorité attribuée.
4. Mettre à jour le statut sans effacer l’historique.
5. Réexaminer à l’échéance ou lors d’un changement important.
6. Marquer toute décision remplacée, expirée ou retirée.

## Gouvernance

- propriétaire : responsables de gouvernance CityFlow;
- contributeurs : responsables métier, techniques et opérationnels concernés;
- revue : à chaque nouvelle décision et lors de la revue documentaire périodique;
- conservation : permanente pour les décisions ayant eu un effet réel;
- correction : nouvelle version ou nouvelle entrée, jamais réécriture silencieuse.

## Preuves attendues

- demande ou événement déclencheur;
- options examinées;
- analyse des impacts et risques;
- approbation attribuable;
- résultats de validation;
- communication et suivi, lorsque requis.

## Barrière finale

Une entrée dans ce registre ne crée pas l’autorité de décider. Une décision demeure non attestée si son responsable, son autorité, ses limites ou ses preuves ne sont pas explicites.
