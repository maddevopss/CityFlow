# Bloc E — Chaîne de traçabilité institutionnelle

## Statut

**ACTIF — CHAÎNE REQ → DEC → RSK → CHG → TST → PRV → VAL CONTRÔLÉE**

## Objet

Relier chaque exigence CityFlow à son origine, ses décisions, ses risques, ses changements, ses tests, ses preuves et sa validation finale.

## Catalogues

- `requirements.json` : exigences `REQ-*`;
- `decisions.json` : décisions `DEC-*`;
- `risks.json` : risques `RSK-*`;
- `changes.json` : changements `CHG-*`;
- `tests.json` : tests `TST-*`;
- `evidence.json` : preuves `PRV-*`;
- `validations.json` : validations `VAL-*`;
- `links.json` : graphe central des relations.

## Règles

1. Les identifiants sont permanents et uniques.
2. Une exigence active doit posséder au moins une décision, un risque, un test, une preuve et une validation.
3. Les références locales doivent pointer vers un fichier présent dans le dépôt.
4. Un objet ne peut être supprimé sans retirer ou remplacer tous ses liens.
5. Une preuve ou une validation ne vaut que pour la portée, la version et l’environnement déclarés.
6. Les résultats `failed`, `blocked` ou `inconclusive` restent visibles.

## Rapport

Le script `scripts/validate-traceability.mjs` calcule la couverture et vérifie que `docs/traceability/report.md` correspond exactement aux catalogues.

## Barrière finale

Une chaîne complète démontre que les relations sont documentées et cohérentes. Elle ne prouve pas automatiquement la conformité, la qualité de l’implémentation ni l’efficacité réelle des contrôles.