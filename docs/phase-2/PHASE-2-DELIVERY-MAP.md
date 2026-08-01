# Phase 2 — Carte de livraison

## Objectif

Ouvrir cinq modules métier CityFlow selon les mêmes règles de gouvernance, sécurité, isolation municipale, preuve et validation que le module Inspections.

## Modules

1. Permis et autorisations.
2. Actifs municipaux.
3. Travaux publics.
4. Signalements citoyens.
5. Tableau de bord exécutif transversal.

## Structure commune de livraison

Chaque module doit couvrir :

- modèle de données et migrations;
- API sécurisée et isolée par municipalité;
- rôles, validations et transitions d’état;
- interface utilisateur responsive;
- audit, métriques et exploitation;
- tests unitaires, intégration et E2E;
- documentation OpenAPI et guides;
- constat de préparation à la production.

## Ordre recommandé

Permis → Actifs → Travaux publics → Signalements → Tableau de bord transversal.

Les dépendances métier doivent rester explicites : un ordre de travail peut référencer un actif ou un signalement; une inspection peut référencer un permis; le tableau de bord consomme les agrégats publiés par les modules sans contourner leurs règles d’accès.

## Barrière de fermeture

Aucun module n’est déclaré prêt pour la production avant :

- CI backend et frontend vertes;
- migrations vérifiées;
- tests E2E verts en préproduction;
- documentation et gouvernance validées;
- preuves d’isolation municipale;
- exploitation et retour arrière documentés.
