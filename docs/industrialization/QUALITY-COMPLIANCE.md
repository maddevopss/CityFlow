# Bloc 1 — Qualité et conformité

## Objectif

Fournir une barrière unique et vérifiable pour la traçabilité, les contrats API, la couverture, l’accessibilité et les performances de CityFlow.

## Barrières obligatoires

1. Chaque exigence livrée doit référencer au moins un test et une preuve reproductible.
2. Tous les contrats `docs/api/*.yaml` doivent être valides et sans erreur OpenAPI.
3. Les tests backend et frontend doivent conserver leurs seuils de couverture existants; aucun abaissement silencieux n’est permis.
4. Les pages publiques et authentifiées doivent viser WCAG 2.2 AA : navigation clavier, libellés, focus visible, contrastes et messages d’erreur compréhensibles.
5. Budgets initiaux : p95 API inférieur à 1 s sur les lectures principales; LCP inférieur à 2,5 s; CLS inférieur à 0,1; aucune régression de bundle supérieure à 10 % sans décision documentée.

## Matrice minimale de traçabilité

| Élément | Identifiant | Preuve attendue |
|---|---|---|
| Exigence | `REQ-CF-*` | document ou issue approuvée |
| Décision | `DEC-CF-*` | ADR ou décision de PR |
| Risque | `RSK-CF-*` | registre avec traitement |
| Test | `TST-CF-*` | test automatisé ou protocole signé |
| Preuve | `PRV-CF-*` | artefact CI, rapport ou capture horodatée |
| Validation | `VAL-CF-*` | verdict et responsable |

## Exécution

Le workflow `quality-compliance.yml` valide les contrats OpenAPI, exécute les suites backend et frontend et publie les rapports disponibles. Les audits Lighthouse et axe sur une vraie préproduction restent une étape manuelle obligatoire avant GO tant que l’URL de préproduction n’est pas exposée aux workflows.

## GO / NO-GO

GO uniquement si les tests, la gouvernance documentaire et les contrats sont verts, sans dérogation non expirée. Toute fuite de couverture, contrat invalide, défaut d’accessibilité bloquant ou dépassement non accepté entraîne NO-GO.
