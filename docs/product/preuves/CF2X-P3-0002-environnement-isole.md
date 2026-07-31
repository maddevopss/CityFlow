# P3 — Environnement isolé de préproduction

## Objet

Définir les caractéristiques minimales d’un environnement P3 représentatif, séparé et réversible.

## Exigences

- séparation des accès, secrets, journaux et données;
- configuration versionnée;
- dépendances contrôlées;
- absence de trafic public;
- destruction et reconstruction documentées;
- surveillance des écarts avec la configuration attendue.

## Critère d’arrêt

Toute fuite vers un service réel, perte d’isolation ou impossibilité de reconstruire l’environnement suspend P3.

## État

`ENVIRONNEMENT DÉFINI — ISOLATION NON VALIDÉE`
