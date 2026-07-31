# Gestion des problèmes CityFlow 2.x

## 1. Objet

Ce cadre définit comment CityFlow identifie, analyse et traite les causes durables derrière les incidents, dégradations répétées, erreurs silencieuses et fragilités connues.

Un incident vise le rétablissement. Un problème vise la compréhension et la réduction de la probabilité ou de l’impact futur.

## 2. Identifiant stable

Chaque problème reçoit un identifiant `CF2X-PRB-xxxx`.

## 3. Déclencheurs

Un dossier est ouvert lorsqu’au moins une condition est présente :

- incidents répétés ou apparentés;
- incident grave sans cause suffisamment comprise;
- tendance défavorable persistante;
- contournement devenu permanent;
- dépendance fragile ou point unique de défaillance;
- erreur de données silencieuse;
- dette connue augmentant le risque;
- alerte récurrente sans traitement durable.

## 4. Fiche minimale

La fiche contient :

- symptômes et effets observés;
- services, données, territoires et personnes touchés;
- incidents liés;
- propriétaire;
- hypothèses de cause;
- niveau de confiance;
- contournements en place;
- risques associés;
- plan d’investigation;
- critères de résolution.

## 5. Analyse des causes

L’analyse distingue explicitement :

- cause immédiate;
- facteurs contributifs;
- conditions latentes;
- barrières absentes ou inefficaces;
- décisions ou contraintes organisationnelles;
- dépendances techniques et fournisseurs.

L’objectif n’est pas de trouver un coupable, mais d’expliquer pourquoi le système a permis l’événement.

## 6. Preuves

Toute conclusion précise sa provenance, sa date, sa portée et ses limites. Une hypothèse ne devient pas une cause confirmée par répétition ou autorité.

## 7. Erreur connue

Une erreur connue documente :

- le comportement reconnu;
- le contournement;
- ses risques et limites;
- les personnes responsables;
- sa durée maximale;
- les conditions d’escalade.

## 8. Options de traitement

Les décisions possibles sont :

- éliminer la cause;
- réduire la probabilité;
- réduire l’impact;
- renforcer la détection;
- améliorer le confinement;
- remplacer une dépendance;
- accepter temporairement le risque;
- retirer la capacité concernée.

## 9. Priorisation

La priorité tient compte de :

- gravité potentielle;
- fréquence et tendance;
- détectabilité;
- exposition géographique;
- données ou sécurité touchées;
- coût cumulé des incidents;
- charge du contournement;
- risque de propagation.

## 10. Actions correctives

Chaque action possède un propriétaire, une échéance, une preuve attendue et un critère de succès. Une PR fusionnée n’est pas, à elle seule, une preuve de résolution.

## 11. Validation

La résolution est vérifiée sur une période et une population suffisantes. Elle inclut les indicateurs principaux, de protection et les erreurs silencieuses.

## 12. Réouverture

Le dossier est rouvert lors d’une récidive, d’une nouvelle preuve, d’une dépendance modifiée ou d’un contournement qui dépasse sa durée autorisée.

## 13. Fermeture

La fermeture exige :

- cause suffisamment établie ou incertitude explicitement acceptée;
- actions validées;
- contournements retirés ou transférés;
- risques résiduels attribués;
- documentation et apprentissages mis à jour;
- incidents liés réconciliés.

## 14. Interdictions

Il est interdit de :

- fermer un problème parce que les incidents ont cessé momentanément;
- présenter une corrélation comme une cause certaine;
- laisser un contournement permanent sans décision;
- effacer les hypothèses réfutées;
- attribuer une cause humaine sans analyser le système.

## 15. Liens obligatoires

Le dossier relie les incidents, risques, changements, dépendances, décisions, fournisseurs, apprentissages et PR pertinents.