# Fermeture sécurité — Permis municipaux

## Portée

Ce constat couvre l’ingestion, le registre, le détail, les décisions, les pièces justificatives, les exigences documentaires, les frais, les dispenses et la délivrance officielle.

## Barrières confirmées

- authentification obligatoire sur les routes municipales;
- autorisation explicite selon le rôle;
- isolation par `municipalityId` provenant du jeton;
- validation UUID avant les accès aux données;
- limitation de débit sur chaque route de lecture ou d’écriture;
- séparation des paramètres et des requêtes SQL;
- idempotence sur l’ingestion, les paiements, les dispenses et la délivrance;
- empreinte SHA-256 obligatoire pour les références documentaires;
- journalisation des décisions sensibles;
- aucune donnée bancaire ou binaire conservée dans PostgreSQL.

## Règle pour les prochaines évolutions

Toute nouvelle route du module doit déclarer son limiteur dès la définition de la route, conserver l’isolation municipale, valider ses entrées et ajouter un test négatif d’autorisation.

## Risques résiduels acceptés

- le stockage binaire demeure externe;
- aucune signature électronique n’est fournie;
- les références de paiement sont déclaratives;
- aucune approbation à deux personnes n’est encore exigée.

## Décision

La surface actuelle est considérée fermée du point de vue des contrôles applicatifs. Toute extension devra rouvrir explicitement cette revue.