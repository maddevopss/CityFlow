# Contrat de gouvernance vivante des pull requests

## Statut

**ACTIF — VALIDATION AUTOMATIQUE ET REVUE HUMAINE REQUISES**

## Objet

Faire de chaque pull request un point d’alimentation contrôlé de la chaîne de traçabilité CityFlow, sans confondre déclaration, preuve et approbation.

## Contrat obligatoire

Chaque pull request doit documenter :

- son intention;
- les changements réalisés;
- les validations exécutées;
- les identifiants de traçabilité applicables;
- son impact documentaire;
- toute dérogation;
- ses limites.

Les identifiants sont résolus dans les catalogues `docs/traceability/*.json`.

## Usage de N/A

`N/A` est permis uniquement lorsqu’un type de relation n’est réellement pas applicable. Il doit être suivi d’une justification précise et révisable.

Exemple acceptable :

```text
N/A — aucun choix d’architecture distinct dans cette correction documentaire
```

Les formulations vagues comme `N/A`, `aucun`, `rien` ou `sans objet` ne suffisent pas.

## Rapport automatique

Le workflow `PR governance` produit :

- un verdict structurel;
- les identifiants résolus;
- les justifications N/A;
- les erreurs et avertissements;
- un rapport conservé comme artefact pendant 30 jours;
- un résumé visible dans GitHub Actions.

## Règles de fusion

Une pull request ne doit pas être fusionnée lorsque :

- une section obligatoire manque;
- un identifiant est absent de son catalogue;
- un préfixe ne correspond pas au type déclaré;
- un N/A n’est pas justifié;
- un impact documentaire positif ne nomme aucun document;
- la chaîne de traçabilité du dépôt est déjà incohérente.

## Responsabilités

- auteur : déclarer une traçabilité honnête et limitée;
- réviseur : évaluer la pertinence des liens et la qualité des preuves;
- mainteneur : faire évoluer les catalogues et règles par PR dédiée;
- CI : vérifier la structure, les références et produire le rapport.

## Limites

Le workflow ne peut pas démontrer que :

- l’exigence est correctement formulée;
- la décision est juste;
- le risque est suffisamment traité;
- le test est pertinent;
- la preuve est authentique ou complète;
- la validation humaine a été menée avec compétence.

## Barrière finale

Une pull request structurellement conforme reste une proposition. La décision de fusion demeure humaine, attribuée et limitée aux preuves disponibles.
