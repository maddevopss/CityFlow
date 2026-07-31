# T9 — Registre des données

## Statut

**REGISTRE INITIALISÉ — AUCUN JEU DE DONNÉES RÉEL ATTESTÉ**

## Objet

Recenser les jeux de données CityFlow, leur source, leur finalité, leur qualité, leurs responsables et leur cycle de vie.

## Champs minimaux

| Champ | Description |
|---|---|
| Identifiant | Référence stable du jeu de données |
| Nom | Désignation compréhensible |
| Source | Autorité, système ou processus d’origine |
| Finalité | Usage autorisé et besoin servi |
| Propriétaire | Autorité responsable du contenu |
| Gardien | Équipe chargée du maintien technique |
| Classification | Publique, interne, sensible ou personnelle |
| Territoire | Portée municipale, régionale ou autre |
| Schéma | Version et emplacement du contrat de données |
| Qualité | Mesures de complétude, exactitude, fraîcheur et cohérence |
| Conservation | Durée, archivage et suppression |
| Partage | Destinataires et conditions |
| État | Planifié, actif, dégradé, retiré ou archivé |
| Révision | Date ou événement du prochain examen |

## Registre

| Identifiant | Nom | Source | Finalité | Propriétaire | Gardien | Classification | Territoire | Schéma | Qualité | Conservation | Partage | État | Révision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Identifier source, finalité et autorité avant ingestion.
2. Définir le schéma et les règles de qualité.
3. Classer les données et limiter les accès.
4. Documenter transformations, enrichissements et publications.
5. Surveiller qualité, fraîcheur et anomalies.
6. Corriger sans supprimer l’historique des écarts.
7. Retirer, archiver ou supprimer selon les obligations applicables.

## Gouvernance

- propriétaire du registre : responsables de gouvernance des données CityFlow;
- mise à jour : à chaque nouveau jeu, nouvelle source, nouveau partage ou changement de finalité;
- revue : périodique et avant publication ou nouvelle utilisation;
- rapprochement : avec obligations, API, actifs, publications et risques;
- historique : schémas versionnés, journaux de transformation et décisions.

## Preuves attendues

- source et autorité confirmées;
- schéma versionné;
- mesures de qualité reproductibles;
- règles d’accès et de conservation;
- journal des transformations;
- preuve de suppression ou d’archivage lorsque requis.

## Barrière finale

Un jeu de données inscrit n’est pas présumé exact, actuel, légalement utilisable ou apte à la publication. Ces propriétés exigent des validations liées à une portée et une période précises.
