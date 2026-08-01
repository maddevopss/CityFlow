# Matrice de traçabilité — Inspections v1

| Capacité | PR | Implémentation principale | Validation |
|---|---:|---|---|
| Cycle backend | #399 | `Inspection`, `/api/v1/inspections` | tests d’intégration backend |
| Interface terrain | #400 | pages et service frontend inspections | tests frontend et build |
| Affectation | #401 | champs d’affectation, `/assign`, liste des inspecteurs | sécurité, isolation, couverture |
| Preuves terrain | #402 | `InspectionEvidence`, routes `/evidence` | validation SHA-256, doublons, isolation |
| Rappels | #403 | `InspectionReminder`, génération J-1, acquittement | idempotence, rôles, isolation |
| Calendrier | #404 | `/inspection-calendar`, export `.ics`, vue hebdomadaire | Backend CI, Frontend CI, conflits |

## Chaîne de gouvernance

- Exigence : `REQ-CF-GOV-001`
- Décision : `DEC-CF-GOV-001`
- Risque : `RSK-CF-GOV-001`
- Changement : `CHG-CF-GOV-001`
- Test : `TST-CF-GOV-001`
- Preuve : `PRV-CF-GOV-001`
- Validation : `VAL-CF-GOV-001`

La présente fermeture ne remplace pas les catalogues officiels. Elle consolide les liens entre le code, les tests, les PR et les preuves de validation du module.
