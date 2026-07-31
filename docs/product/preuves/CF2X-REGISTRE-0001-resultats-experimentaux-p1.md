# CF2X-REGISTRE-0001 — Résultats expérimentaux P1

## Objet

Fournir un registre unique, lisible et auditable pour consigner les exécutions des preuves CityFlow 2.x sans confondre protocole prévu et résultat réellement obtenu.

## Principe

Une preuve décrite n’est pas une preuve exécutée. Aucun résultat ne peut être inscrit sans artefacts, empreintes et revue humaine.

## Entrée minimale

Chaque entrée doit contenir :

- identifiant `CF2X-RESULTAT-XXXX`;
- preuve liée;
- initiative liée;
- date et environnement;
- opérateur;
- réviseur indépendant;
- version du protocole;
- version du jeu synthétique;
- empreintes;
- verdict;
- écarts;
- incidents;
- risques résiduels;
- décision humaine;
- date d’expiration.

## Verdicts autorisés

- `RÉUSSI`;
- `RÉUSSI_AVEC_ÉCARTS`;
- `NON_CONCLUANT`;
- `ÉCHOUÉ`;
- `INVALIDÉ`.

## Registre initial

| Résultat | Preuve | État | Verdict | Décision |
|---|---|---|---|---|
| à attribuer | `CF2X-PREUVE-0001` | non exécutée | aucun | aucune |
| à attribuer | `CF2X-PREUVE-0002` | non exécutée | aucun | aucune |
| à attribuer | `CF2X-PREUVE-0003` | non exécutée | aucun | aucune |
| à attribuer | `CF2X-PREUVE-0004` | non exécutée | aucun | aucune |
| à attribuer | `CF2X-PREUVE-0005` | non exécutée | aucun | aucune |

## Règles d’inscription

1. Une entrée est append-only.
2. Une correction crée une nouvelle entrée liée à la précédente.
3. Un résultat invalidé demeure visible.
4. Un échec ne peut être supprimé.
5. Les pièces manquantes entraînent le verdict `INVALIDÉ`.
6. La décision ne peut dépasser la portée permise par la preuve.

## Expiration

Un résultat expire lors d’un changement critique du protocole, des données, des dépendances ou des hypothèses. L’expiration ne supprime pas l’historique; elle interdit seulement de s’en servir comme preuve courante.

## Publication

Le registre peut être résumé publiquement, mais les artefacts sensibles ou de sécurité demeurent soumis à une diffusion contrôlée. Le résumé ne doit jamais masquer un échec ou un risque résiduel important.

## Autorité

Le registre conserve la preuve de décision, mais ne remplace ni l’approbation humaine ni l’autorité municipale.

## État actuel

Aucune preuve P1 n’est déclarée exécutée par ce document. Le registre est prêt à recevoir les résultats futurs.