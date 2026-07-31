# Gestion des configurations — CityFlow 2.x

## Objet

Ce cadre définit comment CityFlow 2.x identifie, versionne, autorise, déploie, vérifie et retire les configurations qui modifient le comportement d’un service.

## Identifiant

Chaque élément géré reçoit un identifiant `CF2X-CONF-xxxx`.

## Portée

Le registre couvre paramètres applicatifs, variables d’environnement, règles, seuils, drapeaux fonctionnels, politiques d’accès, tâches planifiées et configurations fournisseurs.

## Exigences

Chaque élément possède un propriétaire, une finalité, une valeur attendue, des environnements autorisés, une classification, un historique et une méthode de retour.

## Changements

Toute modification importante est reliée à une décision ou un changement autorisé. Les valeurs sensibles ne sont jamais conservées en clair dans la documentation.

## Dérive

Les écarts entre configuration déclarée et configuration réelle doivent être détectables, attribuables et corrigés. Une dérive critique déclenche incident ou gel.

## Accès

Les modifications utilisent le moindre privilège, une séparation des responsabilités et des accès temporaires lorsque possible.

## Validation

La validation confirme la valeur appliquée, l’environnement, l’effet attendu, l’absence d’exposition sensible et la capacité de retour.

## Retrait

Les paramètres obsolètes, drapeaux permanents et accès inutilisés sont retirés avec preuve, sans effacer leur historique.
