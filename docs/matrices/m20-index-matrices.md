# M20 — Index des matrices

## Statut

**INDEX ACTIF — STRUCTURE DOCUMENTAIRE SOUS CONTRÔLE AUTOMATIQUE**

## Objet

Fournir un point d’entrée unique vers les matrices de traçabilité M1 à M19 de CityFlow et définir leurs règles communes d’utilisation, de preuve et de maintenance.

## Index

| Identifiant | Matrice | Document |
|---|---|---|
| M1 | Exigence ↔ preuve | [Ouvrir](./m1-exigence-preuve.md) |
| M2 | Exigence ↔ test | [Ouvrir](./m2-exigence-test.md) |
| M3 | Risque ↔ contrôle | [Ouvrir](./m3-risque-controle.md) |
| M4 | Composant ↔ propriétaire | [Ouvrir](./m4-composant-proprietaire.md) |
| M5 | API ↔ dépendances | [Ouvrir](./m5-api-dependances.md) |
| M6 | Donnée ↔ obligation | [Ouvrir](./m6-donnee-obligation.md) |
| M7 | Phase ↔ référentiel | [Ouvrir](./m7-phase-referentiel.md) |
| M8 | Référentiel ↔ annexe | [Ouvrir](./m8-referentiel-annexe.md) |
| M9 | Service ↔ niveau de service | [Ouvrir](./m9-service-niveau-service.md) |
| M10 | Incident ↔ action corrective | [Ouvrir](./m10-incident-action-corrective.md) |
| M11 | Changement ↔ validation | [Ouvrir](./m11-changement-validation.md) |
| M12 | Version ↔ environnement | [Ouvrir](./m12-version-environnement.md) |
| M13 | Fournisseur ↔ obligation | [Ouvrir](./m13-fournisseur-obligation.md) |
| M14 | Métrique ↔ décision | [Ouvrir](./m14-metrique-decision.md) |
| M15 | Publication ↔ source | [Ouvrir](./m15-publication-source.md) |
| M16 | Partie prenante ↔ responsabilité | [Ouvrir](./m16-partie-prenante-responsabilite.md) |
| M17 | Communication ↔ public cible | [Ouvrir](./m17-communication-public-cible.md) |
| M18 | Actif ↔ dépendance | [Ouvrir](./m18-actif-dependance.md) |
| M19 | Incident ↔ retour d’expérience | [Ouvrir](./m19-incident-retour-experience.md) |

## Règles communes

- chaque ligne doit utiliser des identifiants stables et vérifiables;
- chaque relation doit préciser sa portée, sa version et son responsable;
- les absences, non-applicabilités et dérogations doivent être explicites;
- les éléments orphelins, périmés ou contradictoires doivent rester visibles jusqu’à résolution;
- les preuves et sources utilisées doivent demeurer accessibles;
- une matrice doit être révisée lorsque l’un des objets reliés change.

## Gouvernance

- propriétaire de la famille : responsables de gouvernance et d’architecture CityFlow;
- contributeurs : responsables produit, techniques, sécurité, données, exploitation et conformité;
- revue : annuelle au minimum et après tout changement majeur touchant les relations décrites;
- versionnement : toute modification substantielle doit être traçable dans Git;
- contrôle : le validateur automatisé vérifie la structure et la navigation à chaque changement pertinent.

## Limites

Le contrôle automatique confirme la présence et la structure minimale des documents. Il ne prouve pas que les relations sont complètes, exactes, à jour ou réellement efficaces.

## Barrière finale

Une relation inscrite dans une matrice ne constitue jamais, à elle seule, une preuve de conformité, de responsabilité ou d’efficacité. Le verdict reste limité aux sources, versions, preuves et validations réellement examinées.
