# T20 — Index des registres vivants

## Statut

**INDEX ACTIF — REGISTRES T1 À T19 ACCESSIBLES ET CONTRÔLÉS**

## Objet

Fournir un point d’entrée unique vers les registres vivants CityFlow, préciser leur rôle, leur gouvernance et les contrôles minimaux qui empêchent leur dérive documentaire.

## Index

| Registre | Objet | Document |
|---|---|---|
| T1 | Décisions | [Registre des décisions](./t1-registre-decisions.md) |
| T2 | Risques | [Registre des risques](./t2-registre-risques.md) |
| T3 | Incidents | [Registre des incidents](./t3-registre-incidents.md) |
| T4 | Changements | [Registre des changements](./t4-registre-changements.md) |
| T5 | Dérogations | [Registre des dérogations](./t5-registre-derogations.md) |
| T6 | Obligations | [Registre des obligations](./t6-registre-obligations.md) |
| T7 | Actifs | [Registre des actifs](./t7-registre-actifs.md) |
| T8 | Dépendances | [Registre des dépendances](./t8-registre-dependances.md) |
| T9 | Données | [Registre des données](./t9-registre-donnees.md) |
| T10 | API | [Registre des API](./t10-registre-api.md) |
| T11 | Environnements | [Registre des environnements](./t11-registre-environnements.md) |
| T12 | Versions | [Registre des versions](./t12-registre-versions.md) |
| T13 | Audits | [Registre des audits](./t13-registre-audits.md) |
| T14 | Validations | [Registre des validations](./t14-registre-validations.md) |
| T15 | Fournisseurs | [Registre des fournisseurs](./t15-registre-fournisseurs.md) |
| T16 | Parties prenantes | [Registre des parties prenantes](./t16-registre-parties-prenantes.md) |
| T17 | Communications | [Registre des communications](./t17-registre-communications.md) |
| T18 | Publications | [Registre des publications](./t18-registre-publications.md) |
| T19 | Métriques | [Registre des métriques](./t19-registre-metriques.md) |

## Règles communes

1. Chaque entrée possède un identifiant stable, un responsable, un état et une date de révision.
2. Les champs inconnus demeurent explicitement inconnus; ils ne sont jamais comblés par supposition.
3. Les corrections conservent l’historique plutôt que de réécrire silencieusement le passé.
4. Les preuves sont liées à l’entrée concernée et restent vérifiables.
5. Une fermeture exige ses critères propres, ses preuves et son autorité.
6. Les registres liés sont rapprochés après chaque changement significatif.
7. Une entrée expirée, orpheline ou sans responsable devient un écart visible.

## Gouvernance

- propriétaire de l’index : responsables de gouvernance documentaire CityFlow;
- modification : branche dédiée et pull request limitée au périmètre annoncé;
- revue : à chaque ajout, retrait, renommage ou changement de structure;
- compatibilité : toute rupture exige une note de migration et la conservation des anciennes références;
- historique : Git, pull requests et versions remplacées;
- contrôle : script `scripts/validate-live-registers.mjs` exécuté par l’intégration continue.

## Contrôle automatique

Le validateur vérifie :

- la présence de T1 à T20;
- l’unicité des entrées T1 à T19 dans l’index;
- l’existence de chaque lien;
- la cohérence du titre principal;
- la présence des sections Statut, Objet, Gouvernance et Barrière finale;
- l’absence de champs de gouvernance vides dans T20.

## Limites

La validation confirme la structure, la présence et la navigation. Elle ne prouve ni l’exhaustivité des entrées, ni leur exactitude, ni l’efficacité des contrôles opérationnels.

## Barrière finale

L’index rend les registres accessibles et contrôlables. Il ne transforme aucun registre vide, incomplet ou non revu en preuve de maîtrise du projet.
