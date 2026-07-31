# T5 — Registre des dérogations

## Statut

**REGISTRE VIVANT — AUCUNE DÉROGATION IMPLICITE OU PERMANENTE**

## Objet

Rendre visibles les exceptions temporaires aux exigences, politiques, contrôles, référentiels ou pratiques CityFlow, ainsi que leurs risques et conditions de retrait.

## Portée

Le registre couvre les dérogations documentaires, techniques, opérationnelles, de sécurité, de données, de vie privée, d’accessibilité, de conformité, de déploiement et de gouvernance.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | `DER-AAAA-NNN` unique |
| Exigence concernée | Référence exacte à la règle ou au contrôle |
| Demandeur | Personne ou rôle sollicitant l’exception |
| Responsable | Propriétaire de la dérogation |
| Autorité | Rôle habilité à l’approuver |
| Justification | Motif concret et alternatives impossibles |
| Portée | Systèmes, données, territoires et publics concernés |
| Début | Date de prise d’effet |
| Expiration | Date obligatoire de fin ou de réexamen |
| Risques | Scénarios et niveau résiduel |
| Mesures compensatoires | Contrôles temporaires et preuves |
| Surveillance | Signaux, fréquence et responsables |
| Conditions d’arrêt | Événements imposant la révocation |
| Plan de retour | Étapes pour rétablir l’exigence normale |
| Statut | demandée, approuvée, refusée, active, expirée, révoquée ou fermée |
| Preuves | Analyses, avis, décisions et validations liés |

## Entrées

| Identifiant | Exigence | Statut | Responsable | Autorité | Début | Expiration | Risque | Preuves |
|---|---|---|---|---|---|---|---|---|
| — | Registre initialisé | actif | Maintenance CityFlow | Gouvernance du dépôt | 2026-07-31 | Première dérogation réelle | non évalué | Historique Git |

## Cycle de vie

1. Documenter la demande avant l’application de l’exception.
2. Évaluer les alternatives et les risques.
3. Définir des mesures compensatoires vérifiables.
4. Obtenir une approbation attribuable et limitée dans le temps.
5. Surveiller les conditions et déclencheurs.
6. Expirer, révoquer ou renouveler par une nouvelle décision explicite.
7. Fermer après retour à l’exigence normale ou remplacement autorisé.

## Gouvernance

- propriétaire : responsable de gouvernance CityFlow;
- autorisation : rôle compétent pour l’exigence concernée;
- durée : aucune dérogation sans expiration ou réexamen daté;
- revue : avant expiration et lors de tout incident ou changement lié;
- conservation : permanente pour toute dérogation ayant été active;
- renouvellement : nouvelle justification, nouvelle analyse et nouvelle approbation.

## Preuves attendues

- exigence exacte concernée;
- justification et alternatives;
- analyse de risques;
- approbation attribuable;
- preuves des mesures compensatoires;
- résultats de surveillance;
- preuve du retrait ou du retour à la normale.

## Barrière finale

Le silence, l’habitude ou l’urgence ne constituent jamais une dérogation. Toute exception doit être explicite, attribuée, limitée, surveillée et révocable.
