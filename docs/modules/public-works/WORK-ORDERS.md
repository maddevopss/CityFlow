# Ordres de travail

Ce bloc ajoute la création, la consultation, la recherche et les transitions d’état des ordres de travail municipaux. Chaque ordre reste isolé par municipalité et conserve un historique append-only.

Les routes d’écriture utilisent un limiteur dès leur déclaration. Les rôles autorisés sont explicitement définis côté serveur.

## Limites

Aucune interface frontend, aucun stockage binaire et aucune planification automatique ne sont inclus.