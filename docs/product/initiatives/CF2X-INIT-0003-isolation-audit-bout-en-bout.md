---
Projet: CityFlow
Document: Admission CF2X-INIT-0003 — Isolation et audit de bout en bout
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: En évaluation
Auteur: MAD DevOps
---

# CF2X-INIT-0003 — Isolation et audit de bout en bout

## 1. Décision recherchée

Déterminer si CityFlow 2.x peut garantir qu’une municipalité, ses agents, ses partenaires et ses canaux publics n’accèdent qu’aux données, décisions et preuves qui leur sont explicitement attribuées.

L’initiative demeure **En évaluation**. Elle n’autorise aucune migration de données réelles ni activation multi-municipale.

## 2. Problème

Une séparation uniquement visible dans l’interface ne constitue pas une isolation. Une donnée peut encore fuir par une requête directe, une tâche asynchrone, un export, un cache, un journal, une pièce jointe, une recherche ou une intégration.

De la même façon, un journal technique incomplet ne permet pas de reconstruire qui a consulté, modifié, approuvé, publié, corrigé ou retiré une information.

## 3. Résultat attendu

CityFlow doit fournir simultanément :

- une isolation municipale appliquée côté serveur et dans les traitements différés;
- une autorisation fondée sur l’organisation, le rôle, l’action et la ressource;
- une traçabilité des décisions et changements significatifs;
- une provenance vérifiable des données et documents;
- une conservation limitée et justifiée des preuves;
- une capacité de détection, d’enquête et de révocation;
- des tests reproductibles démontrant l’absence de fuite entre municipalités.

## 4. Portée

Sont inclus :

- données structurées et géographiques;
- documents et pièces jointes;
- comptes, rôles, délégations et sessions;
- API, exports, recherches et tableaux de bord;
- files de messages, tâches planifiées et reprises;
- caches, index et données temporaires;
- journaux d’audit et preuves de publication;
- intégrations entrantes et sortantes;
- sauvegardes, restauration et environnements de test.

## 5. Hors portée

- certification réglementaire formelle;
- surveillance comportementale des employés;
- conservation illimitée des événements;
- centralisation de secrets municipaux non requis;
- remplacement des politiques municipales d’accès à l’information.

## 6. Principes non compensables

1. Toute ressource appartient à une municipalité ou à un domaine public explicitement défini.
2. L’identité municipale est déterminée par le serveur, jamais par un paramètre client non vérifié.
3. Une autorisation refusée ne peut être contournée par export, recherche, cache ou tâche asynchrone.
4. Les comptes de soutien et d’administration sont soumis à une élévation explicite, limitée et auditée.
5. Les journaux ne doivent pas devenir une seconde base de données contenant des renseignements inutiles.
6. Une preuve d’audit doit être horodatée, attribuée et liée à la version concernée.
7. Les suppressions et retraits doivent préserver uniquement les preuves légalement ou opérationnellement nécessaires.

## 7. Modèle d’autorisation à évaluer

Chaque décision d’accès doit considérer :

- l’identité authentifiée;
- la municipalité active;
- le rôle et les permissions accordées;
- la ressource visée;
- l’action demandée;
- l’état du dossier;
- la délégation ou l’élévation temporaire;
- le canal d’accès;
- les restrictions de sensibilité ou de publication.

Le refus est la valeur par défaut lorsque le contexte est absent, ambigu ou contradictoire.

## 8. Événements minimaux d’audit

Doivent être traçables :

- création et fermeture d’un compte;
- changement de rôle ou de délégation;
- ouverture d’une session sensible;
- consultation exceptionnelle d’un dossier protégé;
- création, modification et suppression logique;
- import, export et téléchargement significatif;
- validation, approbation, publication, correction et retrait;
- changement de configuration ou d’intégration;
- échec d’autorisation et détection d’une anomalie;
- déclenchement et résultat d’une restauration;
- accès de soutien ou d’administration à privilèges élevés.

## 9. Contenu d’une preuve

Une preuve d’audit doit contenir au minimum :

- identifiant unique;
- municipalité concernée;
- acteur ou système responsable;
- action normalisée;
- ressource et version visées;
- date et heure fiables;
- résultat réussi, refusé ou partiel;
- raison ou règle appliquée;
- corrélation avec la requête, le traitement ou la publication;
- canal et environnement;
- empreinte ou référence de contenu lorsque nécessaire.

Les secrets, jetons, mots de passe et contenus personnels non nécessaires sont exclus.

## 10. Traitements différés

Chaque tâche asynchrone doit transporter un contexte municipal signé ou reconstruit depuis une source de confiance. Elle doit :

- refuser l’exécution sans contexte valide;
- appliquer les mêmes règles que les requêtes synchrones;
- être idempotente;
- enregistrer le début, le résultat et la cause d’échec;
- empêcher qu’un lot mélange plusieurs municipalités sans séparation explicite;
- purger les données temporaires après la durée prévue.

## 11. Tests exigés

Les preuves minimales comprennent :

- tentative de lecture croisée par identifiant direct;
- recherche et pagination sans résultats étrangers;
- export limité à la municipalité active;
- cache sans collision de clés entre municipalités;
- tâche différée exécutée avec le bon contexte;
- pièce jointe inaccessible par URL devinée;
- compte de soutien sans accès implicite;
- restauration ne réintroduisant pas de permissions invalides;
- journal complet d’une publication puis d’un retrait;
- test de charge confirmant que l’isolation ne disparaît pas sous concurrence.

## 12. Vie privée et conservation

Un calendrier de conservation doit distinguer :

- données opérationnelles;
- données publiées;
- preuves de décision;
- journaux de sécurité;
- sauvegardes;
- données temporaires;
- données d’essai.

Chaque catégorie doit avoir une finalité, une durée, un responsable et une méthode de destruction ou d’anonymisation.

## 13. Gestion des incidents

Une suspicion de fuite impose :

1. suspension du canal ou de l’intégration concernée;
2. préservation contrôlée des preuves;
3. limitation des accès élevés;
4. identification des municipalités et données touchées;
5. correction reproductible;
6. validation indépendante de l’isolation restaurée;
7. décision humaine documentée avant reprise.

## 14. Dépendances

Cette initiative dépend :

- du modèle géographique officiel `CF2X-INIT-0001`;
- du cycle municipal de publication `CF2X-INIT-0002`;
- d’un registre fiable des identités, rôles et municipalités;
- d’une stratégie de sauvegarde et de restauration testée;
- d’un inventaire des intégrations et canaux.

## 15. Conditions d’admission

L’initiative pourra passer à **Admissible** lorsque :

- le modèle d’autorisation est approuvé;
- chaque catégorie de ressource a une règle de propriété;
- les traitements différés propagent correctement le contexte;
- les tests croisés sont automatisés et réussissent;
- le schéma d’audit et la conservation sont approuvés;
- l’accès de soutien est encadré et révocable;
- une simulation d’incident et de restauration est réussie;
- les risques résiduels sont explicitement acceptés.

## 16. Déclencheurs d’arrêt

L’évaluation s’arrête si :

- une ressource ne peut être attribuée de façon fiable;
- un traitement contourne l’autorisation centrale;
- les journaux exposent plus de renseignements que l’opération elle-même;
- une restauration ne préserve pas l’isolation;
- un accès privilégié demeure permanent ou invisible;
- les tests révèlent une fuite non contenue.

## 17. Retour arrière

Tout prototype doit permettre :

- la désactivation par municipalité;
- la révocation immédiate des délégations;
- l’arrêt des tâches différées;
- l’invalidation des sessions et caches;
- la restauration d’une configuration connue;
- la conservation des preuves nécessaires à l’enquête.

## 18. Preuves à joindre

- matrice ressources–rôles–actions;
- cartographie des flux synchrones et différés;
- schéma des événements d’audit;
- résultats des tests d’isolation;
- calendrier de conservation;
- procédure d’accès de soutien;
- rapport de simulation d’incident;
- décision d’admission signée.

## 19. Limite de la présente admission

Ce document autorise uniquement la conception, les essais avec données fictives et la collecte de preuves. Toute utilisation avec des données municipales réelles exige une décision d’admission ultérieure.