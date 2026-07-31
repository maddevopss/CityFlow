---
Projet: CityFlow
Document: Ouverture de la campagne d’exécution P1
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Ouverture de la campagne d’exécution P1

## 1. Intention

Ce document ouvre la campagne d’exécution des preuves P1 préparées pour CityFlow 2.x.

Il distingue explicitement :

- les protocoles déjà rédigés;
- les exécutions à réaliser;
- les artefacts à produire;
- les résultats à enregistrer;
- les décisions humaines qui pourront suivre.

Aucune preuve n’est réputée réussie du seul fait que son protocole existe.

## 2. Portée de la campagne

La campagne couvre exclusivement :

- `CF2X-PREUVE-0001` — modèle géographique officiel;
- `CF2X-PREUVE-0002` — cycle municipal de publication;
- `CF2X-PREUVE-0003` — isolation municipale et audit;
- `CF2X-PREUVE-0004` — intégrations versionnées;
- `CF2X-PREUVE-0005` — pilote municipal limité.

Toutes les exécutions utilisent uniquement des données synthétiques et des environnements isolés.

## 3. Conditions préalables

Une preuve ne peut être exécutée que si :

1. son protocole est fusionné et identifié par une version stable;
2. les données synthétiques nécessaires sont disponibles;
3. l’environnement d’essai est isolé de toute donnée réelle;
4. la graine, les versions et les dépendances sont figées;
5. les résultats attendus et critères d’échec sont explicites;
6. les journaux, sorties et empreintes peuvent être conservés;
7. une personne responsable de l’exécution est désignée;
8. une personne distincte peut effectuer la revue.

## 4. Ordre recommandé

L’ordre d’exécution recommandé est :

1. modèle géographique;
2. isolation municipale et audit;
3. cycle municipal de publication;
4. intégrations versionnées;
5. simulation du pilote municipal limité.

Cet ordre réduit le risque de valider des processus qui reposeraient sur une géographie ou une isolation encore non démontrée.

## 5. Unité d’exécution

Chaque exécution produit une unité immuable contenant au minimum :

- identifiant d’exécution;
- identifiant de preuve;
- date et heure;
- commit testé;
- version du protocole;
- version du jeu synthétique;
- empreinte de l’environnement;
- commande ou procédure exacte;
- sorties brutes;
- journaux;
- résultats par scénario;
- écarts observés;
- verdict proposé;
- identité de l’exécutant;
- identité du réviseur;
- liens vers les artefacts.

## 6. Verdicts permis

Les seuls verdicts permis sont :

- `RÉUSSIE`;
- `ÉCHOUÉE`;
- `PARTIELLE`;
- `INVALIDE`;
- `NON EXÉCUTÉE`.

Un résultat partiel ne peut pas être présenté comme une réussite.

Une exécution invalide doit demeurer visible dans le registre avec sa cause.

## 7. Règles de reproductibilité

Chaque preuve doit être rejouée au moins une seconde fois à partir des mêmes entrées.

Une preuve ne peut être proposée comme réussie que si :

- les deux exécutions aboutissent au même verdict;
- les écarts sont expliqués;
- aucun scénario bloquant n’échoue;
- les artefacts sont complets;
- la revue indépendante confirme la cohérence entre protocole, sorties et verdict.

## 8. Gestion des écarts

Tout écart doit être classé :

- défaut du protocole;
- défaut du jeu de données;
- défaut d’environnement;
- défaut d’implémentation;
- résultat non déterministe;
- erreur humaine;
- cause inconnue.

Aucun écart ne peut être corrigé silencieusement après l’exécution.

Une nouvelle exécution reçoit un nouvel identifiant.

## 9. Barrières

Cette campagne n’autorise pas :

- l’utilisation de données municipales réelles;
- une connexion à un fournisseur réel;
- une publication publique;
- un accès de soutien réel;
- un pilote municipal;
- le passage automatique au niveau P2;
- une décision opérationnelle sans autorité humaine.

## 10. Critère de fermeture

La campagne P1 peut être fermée seulement lorsque chaque preuve possède :

- au moins une exécution complète;
- un rejeu indépendant ou contrôlé;
- un verdict explicite;
- les artefacts obligatoires;
- une entrée dans le registre;
- une mise à jour de la matrice de traçabilité;
- une décision humaine documentée.

## 11. Décision d’ouverture

La campagne est déclarée `OUVERTE — EXÉCUTION AUTORISÉE EN ENVIRONNEMENT SYNTHÉTIQUE SEULEMENT`.

Cette décision autorise la production des outils et artefacts nécessaires aux preuves P1. Elle n’accorde aucune autorisation d’usage réel.