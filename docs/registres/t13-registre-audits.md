# T13 — Registre des audits

## Statut

**REGISTRE VIVANT — 2 AUDITS RÉELS CONSIGNÉS**

## Objet

Maintenir la trace des audits CityFlow, de leur mandat, de leur portée, de leurs constats, de leurs preuves et de leur suivi.

## Portée

Le registre couvre les audits internes, externes, techniques, opérationnels, contractuels, réglementaires, documentaires et de sécurité.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | unique |
| Type | nature de l’audit |
| Mandant | autorité ayant demandé l’audit |
| Auditeur | personne ou organisation responsable |
| Indépendance | conflits et limites déclarés |
| Portée | systèmes, périodes et exclusions |
| Critères | exigences évaluées |
| Méthode | travaux réalisés |
| Dates | début, fin et suivi |
| Constats | conformités, écarts et non-vérifications |
| Gravité | méthode explicite |
| Actions | responsables et échéances |
| Statut | prévu, en cours, rapporté, suivi ou clos |
| Preuves | rapport et artefacts |

## Registre

| ID | Type | Portée | Auditeur | Début | Rapport | Constats ouverts | Statut | Prochaine action | Preuves |
|---|---|---|---|---|---|---|---|---|---|
| AUDIT-2026-001 | Technique (qualité du code) | `backend/src`, `frontend/src`, configuration, CI, dépendances | Revue technique interne | 2026-07-31 | [docs/audits/2026-07-31-audit-qualite-code.md](../audits/2026-07-31-audit-qualite-code.md) | 0 — les 6 constats (1 critique, 3 élevés, 2 moyens partiels) ont été traités par les PR #687, #688, #691 ; la correction du constat critique a elle-même introduit le risque RSK-2026-001, consigné en T2 | clos | Aucune — suivi assuré par AUDIT-2026-002 | Rapport daté, PR de correction fusionnées |
| AUDIT-2026-002 | Technique + vérification de l'ancrage SYSTEME_MAD | `backend/`, `frontend/`, CI GitHub Actions, `docs/integration-systeme-mad/`, registres T | Revue technique interne | 2026-08-05 | [docs/audits/2026-08-05-audit-technique-ancrage-systeme-mad.md](../audits/2026-08-05-audit-technique-ancrage-systeme-mad.md) | 3 ouverts — RSK-2026-001 (régression CSRF/session, CI rouge sur `main`), RSK-2026-002 (tests de sécurité non exécutés) et RSK-2026-003 (chaîne de migrations Prisma cassée, découverte via la CI de la PR #692 elle-même), tous consignés en T2 | rapporté | Corriger RSK-2026-001, RSK-2026-002 et RSK-2026-003 avant toute mise en production, puis rouvrir un audit de clôture | Run CI `maddevopss/CityFlow` #30916518659 (échec) et exécutions CI de la PR #692, reproduction locale documentée dans le rapport |

## Cycle de vie

1. Définir mandat, critères et indépendance.
2. Autoriser la portée et les accès.
3. Exécuter et conserver les preuves.
4. Produire les constats sans masquer les limites.
5. Attribuer les actions correctives.
6. Vérifier les corrections avant clôture.

## Gouvernance

- propriétaire du registre : responsables de gouvernance CityFlow;
- mise à jour : à chaque étape importante de l’audit;
- revue : selon les échéances du plan d’action;
- conservation : rapports, preuves et historique des corrections;
- rapprochement : registres des obligations, risques, incidents, validations et dérogations.

## Preuves attendues

- mandat approuvé;
- critères et échantillons;
- rapport daté;
- preuves reliées aux constats;
- réponses des responsables;
- vérification des actions terminées.

## Barrière finale

L’existence d’un audit ou d’un rapport ne démontre pas une conformité générale. Seuls les critères, la portée, les preuves et les constats explicitement évalués peuvent soutenir une conclusion limitée.