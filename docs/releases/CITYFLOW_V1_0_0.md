# CityFlow 1.0.0 — Registre de livraison

## Statut

Candidate livrable pour un projet pilote municipal contrôlé.

## Date de préparation

2026-08-02

## Périmètre fonctionnel

- événements routiers et cycle de validation;
- permis, documents, frais et délivrance;
- inspections, affectations, preuves, calendrier, rappels et tendances;
- demandes citoyennes, messages, niveaux de service et escalades;
- notifications et opérations;
- exports GeoJSON;
- contrôle de santé versionné.

## Garanties techniques vérifiées

- authentification JWT et autorisations par rôle;
- isolation municipale appliquée aux lectures et écritures sensibles;
- limitation de débit placée avant authentification sur les surfaces durcies;
- webhook de permis signé sur les octets bruts reçus;
- validation des entrées principales;
- métriques HTTP réservées aux administrateurs;
- découpage du bundle frontend et budget automatique;
- tests backend et frontend intégrés à la CI;
- gouvernance de pull request obligatoire.

## Critères de livraison

La version peut être taguée `v1.0.0` uniquement lorsque :

1. la PR de livraison est fusionnée;
2. toutes les barrières CI sont vertes;
3. aucune alerte CodeQL bloquante n’est ouverte;
4. les migrations ont été validées sur une base de préproduction;
5. le frontend et le backend utilisent les bonnes URL de production;
6. les secrets de production ont été injectés hors dépôt;
7. le contrôle `/health` retourne `status: ok` et `version: 1.0.0`;
8. un responsable municipal accepte le périmètre pilote.

## Limites connues

- les limiteurs utilisent la mémoire locale du processus;
- le déploiement horizontal exige un magasin partagé pour les compteurs;
- la version vise un pilote contrôlé, pas un déploiement municipal massif;
- la qualité des données géographiques importées demeure sous la responsabilité de la source;
- les sauvegardes, la restauration et la supervision doivent être configurées par l’environnement d’hébergement.

## Retour arrière

Le retour arrière doit restaurer ensemble :

- l’image backend précédente;
- l’image frontend précédente;
- la version de schéma compatible;
- les variables d’environnement précédentes.

Aucune migration destructive ne doit être exécutée sans sauvegarde testée et procédure de restauration documentée.
