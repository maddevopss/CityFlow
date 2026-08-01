# Publication officielle CityFlow v1.0.0

## Préconditions

1. Toutes les PR de clôture sont fusionnées.
2. Les barrières `Security suite`, `Production readiness`, `V1 release gate` et `Document compliance` sont vertes sur `main`.
3. La validation humaine GO est consignée.
4. Les essais de préproduction et le retour arrière ont été vérifiés.

## Publication

1. Résoudre le commit exact de `main`.
2. Créer le tag annoté `v1.0.0` sur ce commit.
3. Publier une GitHub Release non brouillon et non préversion.
4. Joindre les notes de version et les empreintes SHA-256 des artefacts.
5. Déclencher la vérification post-déploiement autorisée.

## Interdictions

- aucun tag déplacé;
- aucune publication depuis une branche différente de `main`;
- aucun secret dans les notes ou artefacts;
- aucune publication automatique sans approbation humaine.

## Après publication

Activer la fenêtre de surveillance de 24 heures et appliquer la procédure de rollback en cas d’état critique.
