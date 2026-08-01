# Administration des pièces obligatoires

## Objectif

Permettre aux équipes municipales de définir les pièces exigées pour chaque type de permis sans modifier les données de chaque dossier individuellement.

## Accès

- consultation : rôles municipaux autorisés au module Permis;
- modification : `ADMIN` et `MANAGER`;
- isolation : le catalogue affiché et modifié appartient uniquement à la municipalité du jeton.

## Utilisation

1. Ouvrir la page **Permis municipaux**.
2. Repérer le panneau **Pièces obligatoires par type de permis**.
3. Saisir le type de permis, par exemple `EXCAVATION`.
4. Saisir une pièce par ligne, ou séparer les valeurs avec une virgule ou un point-virgule.
5. Enregistrer.

Les valeurs sont normalisées en majuscules et dédupliquées.

## Modification

Le bouton **Modifier** recharge une exigence existante dans le formulaire. L’enregistrement met à jour la règle municipale correspondante.

## Désactivation

Pour désactiver les exigences d’un type de permis sans supprimer sa configuration :

1. sélectionner la règle;
2. vider complètement la liste des pièces;
3. enregistrer.

Une liste vide signifie qu’aucune pièce obligatoire n’est active pour ce type de permis.

## Effet sur l’approbation

Lorsqu’un permis est approuvé, CityFlow utilise en priorité le catalogue municipal. Si aucune règle municipale n’existe, les exigences embarquées dans le dossier demeurent le mécanisme de compatibilité.

## Sécurité et exploitation

Les appels utilisent les routes existantes :

- `GET /api/v1/permits/document-requirements` avec `permitReadLimiter`;
- `PUT /api/v1/permits/document-requirements` avec `permitWriteLimiter`.

Aucune nouvelle route non limitée n’est introduite par ce bloc.
