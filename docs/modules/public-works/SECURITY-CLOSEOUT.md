# Fermeture sécurité — Travaux publics

## Contrôles

- authentification sur toutes les routes;
- rôles explicites côté serveur;
- isolation stricte par `municipalityId`;
- validation UUID et Joi;
- limitation de débit dès la déclaration de route;
- historique append-only;
- empreinte SHA-256 des preuves;
- paramètres SQL séparés des valeurs métier.

## Risques résiduels acceptés

- les fichiers binaires demeurent hors base;
- aucun suivi GPS temps réel;
- les seuils de débit réutilisent temporairement les limiteurs existants du module Permis;
- le SQL brut devra être remplacé ou encapsulé davantage lors de la génération complète des modèles Prisma.

## Limites

Ce constat porte sur le backend livré dans ce bloc et n’inclut pas encore l’interface frontend.