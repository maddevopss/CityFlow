# A20 — Bibliothèque des modèles CityFlow

## Statut

**INDEX VALIDÉ — BIBLIOTHÈQUE A1 À A20 ACCESSIBLE ET CONTRÔLÉE**

## Objet

Regrouper les modèles A1 à A19, préciser leur usage et empêcher qu’un document rempli soit confondu avec une preuve, une autorisation ou une conformité démontrée.

## Index

| Annexe | Modèle | Usage principal |
|---|---|---|
| [A1](./a1-modele-decision.md) | Décision | Motiver et limiter une décision |
| [A2](./a2-modele-adr.md) | ADR | Documenter une décision d’architecture |
| [A3](./a3-modele-analyse-risques.md) | Analyse de risques | Évaluer et traiter un scénario de risque |
| [A4](./a4-modele-incident.md) | Incident | Conserver chronologie, impacts et réponse |
| [A5](./a5-modele-probleme.md) | Problème | Analyser une cause profonde |
| [A6](./a6-modele-changement.md) | Changement | Préparer et contrôler une modification |
| [A7](./a7-modele-validation.md) | Validation | Exécuter un scénario reproductible |
| [A8](./a8-modele-revue.md) | Revue | Examiner preuves, écarts et décisions |
| [A9](./a9-modele-audit.md) | Audit | Évaluer des critères dans une portée définie |
| [A10](./a10-modele-registre.md) | Registre | Maintenir des éléments vivants et traçables |
| [A11](./a11-modele-obligation.md) | Obligation | Relier exigence, contrôle et preuve |
| [A12](./a12-modele-service.md) | Service | Décrire responsabilité et exploitation |
| [A13](./a13-modele-api.md) | API | Définir contrat, version et retrait |
| [A14](./a14-modele-donnees.md) | Données | Gouverner source, qualité et cycle de vie |
| [A15](./a15-modele-deploiement.md) | Déploiement | Préparer, exécuter et valider une livraison |
| [A16](./a16-modele-continuite.md) | Continuité | Préparer et exercer la reprise |
| [A17](./a17-modele-communication.md) | Communication | Informer avec transparence et limites |
| [A18](./a18-modele-formation.md) | Formation | Définir objectifs et valider les acquis |
| [A19](./a19-modele-rapport.md) | Rapport | Consolider faits, analyses et recommandations |

## Règles d’utilisation

1. Copier le modèle sans supprimer ses barrières.
2. Attribuer un identifiant, une version, un responsable et une date.
3. Remplacer tous les champs vides ou les marquer explicitement non applicables.
4. Relier les affirmations importantes à des preuves accessibles.
5. Conserver les résultats défavorables, réserves et incertitudes.
6. Archiver les versions remplacées plutôt que les écraser.
7. Exiger une revue avant toute déclaration de fermeture.

## Gouvernance

- propriétaire de la bibliothèque : responsables de maintenance du dépôt CityFlow;
- fréquence de revue : à chaque ajout, retrait ou changement incompatible, puis lors de la revue documentaire périodique;
- mécanisme de proposition : branche dédiée et pull request expliquant intention, impacts, validations et limites;
- compatibilité et migration : toute rupture exige une note de migration et la conservation des versions remplacées;
- registre des versions : historique Git, pull requests fusionnées et journal des changements du dépôt.

## Contrôle automatique

Le script `scripts/validate-template-library.mjs` vérifie :

- la présence des annexes A1 à A20;
- la cohérence de leur titre principal;
- la présence d’un statut et d’une barrière finale;
- les liens de l’index A20;
- l’absence de champs de gouvernance vides;
- le constat explicite de validation de la bibliothèque.

La vérification est exécutée par l’intégration continue pour toute modification des modèles, du script ou de son propre workflow.

## Conditions de fermeture

- [x] A1 à A19 fusionnés et accessibles;
- [x] liens et titres vérifiés par contrôle automatique;
- [x] responsabilités attribuées;
- [x] règles d’utilisation approuvées par fusion de la présente modification;
- [x] aucune annexe présentée comme preuve autonome.

## Limites restantes

- la validation structurelle ne juge pas la qualité d’un modèle rempli;
- elle ne prouve ni conformité, ni efficacité opérationnelle, ni approbation métier;
- les usages réels devront produire leurs propres preuves et revues.

## Barrière finale

La bibliothèque fournit des structures de travail. La qualité d’un document dépend de son contenu, de ses preuves, de ses responsables et de sa revue; remplir un modèle ne démontre rien à lui seul.
