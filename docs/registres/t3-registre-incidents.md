# T3 — Registre des incidents

## Statut

**REGISTRE VIVANT — AUCUN INCIDENT PRÉSUMÉ CLOS PAR LE SEUL RETOUR DU SERVICE**

## Objet

Conserver une trace chronologique, attribuée et vérifiable des incidents affectant CityFlow, ses usagers, ses partenaires, ses données ou ses services.

## Portée

Le registre couvre les interruptions, dégradations, erreurs de publication, atteintes à la sécurité, incidents de données, défauts de conformité, défaillances de dépendances et événements opérationnels significatifs.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | `INC-AAAA-NNN` unique |
| Titre | Résumé factuel de l’événement |
| Détection | Date, heure, source et premier signal |
| Début estimé | Moment où l’impact a probablement commencé |
| Fin d’impact | Moment où l’impact observable a cessé |
| Gravité | Niveau défini et justifié |
| Statut | détecté, qualifié, contenu, rétabli, analysé ou fermé |
| Services touchés | Composants, territoires et dépendances concernés |
| Impacts | Citoyens, municipalités, données et opérations touchés |
| Commandement | Responsable de coordination |
| Chronologie | Actions, décisions et observations horodatées |
| Cause | confirmée, probable ou inconnue |
| Contournement | Mesure temporaire et limites |
| Correction | Action permanente prévue ou réalisée |
| Communication | Avis internes, partenaires et publics |
| Preuves | Journaux, captures, métriques, tickets et validations |
| Problème lié | Référence vers l’analyse de cause profonde |
| Fermeture | Critères, autorité et date de clôture |

## Entrées

| Identifiant | Titre | Gravité | Statut | Début | Responsable | Service | Preuves |
|---|---|---|---|---|---|---|---|
| — | Registre initialisé | non applicable | actif | 2026-07-31 | Maintenance CityFlow | Documentation | Historique Git |

## Cycle de vie

1. Ouvrir une entrée dès la qualification initiale.
2. Conserver une chronologie factuelle et horodatée.
3. Distinguer rétablissement, résolution et fermeture.
4. Relier les communications et décisions importantes.
5. Ouvrir un problème lorsque la cause ou la non-récurrence exige une analyse.
6. Fermer seulement après validation des impacts, actions et preuves.

## Gouvernance

- propriétaire : responsable des opérations CityFlow;
- mise à jour : commandement d’incident ou personne déléguée;
- revue : après chaque incident significatif et lors des revues opérationnelles;
- conservation : permanente pour les incidents ayant eu un impact réel;
- correction : ajout daté ou nouvelle version, jamais suppression de la chronologie.

## Preuves attendues

- signal initial;
- chronologie complète;
- mesures d’impact;
- décisions de contenu et de rétablissement;
- communications diffusées;
- validation de correction;
- revue post-incident.

## Barrière finale

Le retour apparent du service ne suffit pas à fermer un incident. Les impacts, la cause connue ou inconnue, les actions, les communications et les risques résiduels doivent rester visibles.
