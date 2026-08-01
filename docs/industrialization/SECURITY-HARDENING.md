# Bloc 3 — Sécurité

## Objectif

Automatiser l’analyse du code, des dépendances, des secrets, des images et des permissions sans affaiblir les contrôles existants.

## Contrôles

- SAST sur JavaScript et TypeScript;
- audit des dépendances backend, frontend et E2E;
- détection de secrets dans l’historique proposé;
- analyse du système de fichiers et des images de conteneur;
- interdiction des conteneurs privilégiés, de l’utilisateur root et des capacités inutiles;
- revue trimestrielle des rôles, comptes de service, secrets et accès d’administration;
- rotation immédiate après exposition ou départ d’un responsable.

## Niveaux de traitement

- Critique : blocage immédiat et correction avant fusion;
- Élevé : blocage sauf dérogation datée et approuvée;
- Modéré : correction planifiée et suivie;
- Faible : suivi selon le contexte.

## Permissions

Le moindre privilège s’applique aux utilisateurs, services, workflows GitHub Actions et bases de données. Les permissions `write` doivent être explicites, minimales et justifiées.

## Conteneurs

Les images doivent être reproductibles, épinglées, analysées et exécutées avec un utilisateur non root. Aucun secret ne doit être présent dans une couche d’image.

## GO / NO-GO

NO-GO en présence d’un secret détecté, d’une vulnérabilité critique exploitable, d’un accès intermunicipal, d’un workflow sur-privilégié ou d’un conteneur privilégié non dérogé.
