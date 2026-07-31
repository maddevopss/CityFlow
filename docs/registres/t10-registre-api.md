# T10 — Registre des API

## Statut

**REGISTRE INITIALISÉ — AUCUNE API RÉELLE APPROUVÉE**

## Objet

Recenser les interfaces de programmation CityFlow, leurs propriétaires, consommateurs, contrats, versions, dépendances et conditions de retrait.

## Champs minimaux

| Champ | Description |
|---|---|
| Identifiant | Référence stable de l’API |
| Nom | Désignation compréhensible |
| Finalité | Service rendu par l’interface |
| Propriétaire | Autorité responsable du contrat |
| Exploitant | Équipe chargée du fonctionnement |
| Consommateurs | Systèmes ou partenaires connus |
| Version | Version active du contrat |
| Authentification | Mécanisme d’identité et d’autorisation |
| Données | Catégories lues, produites ou modifiées |
| Dépendances | Services, données et fournisseurs requis |
| Limites | Quotas, délais, tailles et restrictions |
| Observabilité | Journaux, métriques, traces et alertes |
| Compatibilité | Politique de changement et migration |
| Retrait | Date, préavis et solution de remplacement |
| État | Planifiée, active, dégradée, dépréciée ou retirée |
| Révision | Date ou événement du prochain examen |

## Registre

| Identifiant | Nom | Finalité | Propriétaire | Exploitant | Consommateurs | Version | Authentification | Données | Dépendances | Limites | Observabilité | Compatibilité | Retrait | État | Révision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Définir finalité, propriétaire et consommateurs avant exposition.
2. Versionner le contrat et les erreurs.
3. Documenter authentification, autorisation et limites.
4. Relier données, dépendances et obligations.
5. Tester compatibilité, défaillance et reprise.
6. Surveiller usages, erreurs, quotas et abus.
7. Déprécier puis retirer avec préavis et preuve de migration.

## Gouvernance

- propriétaire du registre : responsables d’architecture et d’intégration CityFlow;
- mise à jour : à chaque création, nouvelle version, changement incompatible ou retrait;
- revue : avant exposition externe et après incident significatif;
- rapprochement : avec dépendances, données, actifs, fournisseurs et versions;
- historique : contrats versionnés, journaux de changements et décisions d’architecture.

## Preuves attendues

- contrat ou spécification versionnée;
- résultats de tests;
- politiques d’accès et quotas;
- consommateurs confirmés;
- métriques et alertes observables;
- plan de migration et preuve de retrait.

## Barrière finale

Une API inscrite n’est pas présumée stable, sécurisée, compatible ou disponible. Chaque qualité doit être démontrée pour une version, un environnement et une période déterminés.
