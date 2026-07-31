# T7 — Registre des actifs

## Statut

**REGISTRE INITIALISÉ — AUCUN INVENTAIRE RÉEL ATTESTÉ**

## Objet

Maintenir l’inventaire des actifs matériels, logiciels, informationnels et documentaires nécessaires à CityFlow.

## Champs minimaux

| Champ | Description |
|---|---|
| Identifiant | Référence stable de l’actif |
| Nom | Désignation compréhensible |
| Type | Service, application, infrastructure, donnée, document ou équipement |
| Propriétaire | Autorité responsable de l’actif |
| Exploitant | Équipe chargée de son fonctionnement |
| Environnement | Local, validation, préproduction ou production |
| Criticité | Faible, moyenne, élevée ou essentielle |
| Données traitées | Catégories et sensibilité |
| Dépendances | Actifs ou fournisseurs requis |
| Version | Version ou configuration active |
| État | Planifié, actif, dégradé, retiré ou archivé |
| Révision | Date ou événement du prochain examen |

## Registre

| Identifiant | Nom | Type | Propriétaire | Exploitant | Environnement | Criticité | Données | Dépendances | Version | État | Révision |
|---|---|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Inventorier avant mise en service.
2. Attribuer propriétaire et exploitant.
3. Documenter criticité, données et dépendances.
4. Conserver les changements de version et de configuration.
5. Réévaluer après incident, changement majeur ou nouvelle obligation.
6. Préparer le retrait, la migration et l’archivage.
7. Conserver la preuve de suppression ou de transfert.

## Gouvernance

- propriétaire du registre : responsables d’architecture et d’exploitation CityFlow;
- mise à jour : à chaque création, transfert, modification ou retrait;
- revue : périodique et avant toute analyse de continuité ou de sécurité;
- rapprochement : avec les registres des dépendances, données, environnements et fournisseurs;
- historique : conservé dans Git et les journaux de changements.

## Preuves attendues

- propriétaire et exploitant confirmés;
- configuration ou version observée;
- emplacement ou environnement vérifié;
- dépendances reliées;
- décision de mise en service ou de retrait;
- preuve d’archivage ou de destruction.

## Barrière finale

Un actif inscrit n’est pas présumé disponible, sécurisé, maintenu ou conforme. Ces qualités exigent des validations et des preuves distinctes.
