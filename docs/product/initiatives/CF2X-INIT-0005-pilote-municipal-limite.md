---
Projet: CityFlow
Document: Admission CF2X-INIT-0005 — Pilote municipal limité
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: En évaluation
Auteur: MAD DevOps
---

# CF2X-INIT-0005 — Pilote municipal limité

## Décision recherchée

Déterminer les conditions minimales permettant d’expérimenter CityFlow 2.x avec une municipalité volontaire, dans un périmètre restreint, réversible et observable.

Cette initiative demeure **En évaluation**. Elle n’autorise ni déploiement général ni utilisation de données réelles avant une décision explicite.

## Finalité

Le pilote doit vérifier une capacité précise, pas démontrer artificiellement que toute la plateforme est prête. Il doit produire des preuves suffisantes pour décider de poursuivre, corriger, suspendre ou retirer l’expérimentation.

## Portée proposée

- une municipalité;
- un territoire ou service clairement borné;
- un nombre limité d’agents nommés;
- un seul cycle de publication contrôlé;
- des intégrations simulées ou explicitement approuvées;
- une durée définie;
- des données fictives, anonymisées ou autorisées;
- un canal citoyen distinct de la production générale.

## Hors portée

- déploiement multi-municipal;
- remplacement d’un système critique;
- automatisation de l’approbation finale;
- migration massive;
- engagement de disponibilité permanente;
- traitement de données sensibles non nécessaires;
- extension silencieuse du périmètre.

## Prérequis non compensables

1. Sponsor municipal et responsable CityFlow nommés.
2. Objectif, durée, territoire et population touchée documentés.
3. Modèle géographique approuvé pour le périmètre.
4. Cycle de publication avec autorité humaine finale.
5. Isolation et audit testés.
6. Intégrations versionnées ou simulées.
7. Plan d’incident et retour arrière exercés.
8. Information claire aux utilisateurs et citoyens concernés.
9. Accessibilité vérifiée sur les parcours inclus.
10. Critères d’arrêt acceptés avant le démarrage.

## Dossier de lancement

Le dossier doit contenir :

- mandat et résultat attendu;
- périmètre inclus et exclu;
- personnes responsables;
- inventaire des données;
- base légitime et règles de conservation;
- architecture et environnements;
- matrice des accès;
- canaux de soutien;
- calendrier des essais;
- mesures de succès et seuils d’arrêt;
- plan de communication;
- plan de fermeture.

## Mesures minimales

- dossiers reçus, validés, approuvés et publiés;
- délais par étape;
- erreurs et reprises;
- divergences entre version approuvée et diffusée;
- incidents d’accès ou d’isolation;
- demandes de soutien;
- obstacles d’accessibilité;
- corrections manuelles;
- satisfaction des agents;
- compréhension du public;
- capacité à retirer proprement le pilote.

## Règles d’exploitation

- aucun changement de portée sans décision écrite;
- aucun accès privilégié permanent;
- aucune publication automatique finale;
- aucune donnée en production copiée vers un environnement non autorisé;
- chaque incident significatif suspend le flux concerné;
- chaque publication est vérifiée sur le canal cible;
- chaque journée d’essai dispose d’un responsable opérationnel;
- chaque anomalie reçoit un propriétaire et une échéance.

## Phases

1. Préparation et données fictives;
2. Répétition complète sans diffusion publique;
3. Essai contrôlé avec groupe limité;
4. Observation et corrections réversibles;
5. Évaluation indépendante;
6. Décision de poursuivre, prolonger, suspendre ou fermer;
7. Retrait des accès et données temporaires.

Le passage entre les phases exige une décision documentée.

## Critères de succès

Le pilote est concluant seulement si :

- les utilisateurs accomplissent le parcours prévu;
- aucune fuite entre domaines n’est détectée;
- la version publiée correspond à la version approuvée;
- les incidents sont détectés et contenus;
- les preuves sont complètes;
- les citoyens comprennent le statut des informations;
- le retour arrière est réalisable;
- les coûts et efforts d’exploitation sont mesurés;
- les risques résiduels sont acceptables.

## Déclencheurs d’arrêt

- fuite ou accès non autorisé;
- impossibilité d’attribuer une décision;
- publication d’une version non approuvée;
- perte de provenance;
- intégration non maîtrisée;
- obstacle d’accessibilité bloquant;
- absence de responsable opérationnel;
- données conservées sans finalité;
- incident critique sans procédure de reprise;
- pression pour élargir le périmètre sans nouvelle admission.

## Retour arrière

Le pilote doit pouvoir être fermé en :

- suspendant les comptes et intégrations;
- retirant ou corrigeant les publications;
- exportant les preuves nécessaires;
- restituant les données convenues;
- supprimant les données temporaires;
- révoquant les secrets;
- confirmant la fermeture aux parties concernées;
- produisant un rapport final.

## Dépendances

- `CF2X-INIT-0001` — modèle géographique;
- `CF2X-INIT-0002` — cycle municipal de publication;
- `CF2X-INIT-0003` — isolation et audit;
- `CF2X-INIT-0004` — intégrations versionnées;
- procédures de soutien, incident et restauration;
- décision municipale formelle.

## Conditions d’admission

L’initiative pourra devenir **Admissible** lorsque tous les prérequis sont prouvés, que la répétition sans diffusion est réussie, que les seuils d’arrêt sont acceptés et que la fermeture complète a été simulée.

## Preuves attendues

- mandat signé;
- périmètre et calendrier;
- matrice des accès;
- résultats des essais de répétition;
- vérification de sécurité, vie privée et accessibilité;
- simulation d’incident et de fermeture;
- tableau de mesures;
- décision de lancement;
- rapport de fin de pilote.

## Limite

Ce dossier autorise uniquement la préparation du pilote et la collecte des preuves nécessaires à une décision ultérieure.