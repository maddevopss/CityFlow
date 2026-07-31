---
Projet: CityFlow
Document: Protocole d’incident et de retour arrière 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Protocole d’incident et de retour arrière 2.x

## Objet

Définir une réponse commune lorsqu’une initiative 2.x présente une fuite, une publication incorrecte, une perte de provenance, une défaillance d’intégration ou toute autre condition compromettant les barrières approuvées.

## Principe

La protection des personnes, des municipalités et de l’intégrité des décisions prime sur la continuité de service. En cas de doute sérieux, le flux concerné est suspendu.

## Niveaux

- **N0 — Anomalie** : écart sans impact confirmé, suivi normal.
- **N1 — Incident limité** : fonction ou municipalité restreinte, correction locale possible.
- **N2 — Incident majeur** : publication, isolation, données ou intégration compromises.
- **N3 — Incident critique** : propagation, exposition sensible, perte de contrôle ou incapacité de retrait.

## Déclencheurs immédiats

- accès intermunicipal;
- publication d’une version non approuvée;
- corruption ou perte de provenance;
- secret compromis;
- intégration rejouant ou mélangeant des données;
- impossibilité de retirer une publication;
- journal d’audit indisponible;
- restauration réintroduisant des accès invalides;
- obstacle critique empêchant l’usage accessible d’un service essentiel.

## Réponse initiale

1. confirmer l’incident sans modifier inutilement les preuves;
2. nommer un responsable d’incident;
3. suspendre le canal, l’intégration ou la municipalité concernée;
4. révoquer les accès et secrets à risque;
5. préserver les journaux, versions et corrélations;
6. déterminer le périmètre touché;
7. informer les autorités internes prévues;
8. choisir entre correction, retour arrière ou fermeture.

## Autorité de suspension

La personne de garde, le responsable d’incident ou l’autorité municipale désignée peut suspendre immédiatement un flux. La reprise exige une décision documentée distincte.

## Préservation des preuves

- horodatage fiable;
- copie contrôlée des journaux pertinents;
- versions approuvée, transformée et publiée;
- identifiants de requête et de traitement;
- comptes et permissions impliqués;
- contrats d’intégration et secrets concernés;
- actions manuelles exécutées;
- limites connues de la collecte.

Les secrets et renseignements non nécessaires ne sont pas copiés dans les rapports.

## Stratégies de retour arrière

Selon le cas :

- désactivation d’une fonctionnalité;
- retour à une version logicielle ou contractuelle approuvée;
- suspension d’un canal de publication;
- retrait ou correction d’un contenu;
- invalidation des sessions et caches;
- arrêt des tâches différées;
- mise en quarantaine des messages;
- restauration de données;
- révocation et rotation des secrets;
- fermeture complète du pilote.

## Conditions de restauration

Une restauration n’est acceptable que si :

- la sauvegarde et son origine sont connues;
- le périmètre municipal est préservé;
- les permissions sont recalculées ou vérifiées;
- les événements postérieurs sont réconciliés;
- les doublons sont empêchés;
- les preuves de l’incident demeurent disponibles;
- un essai de validation est réussi avant reprise.

## Vérification avant reprise

- cause contenue;
- portée confirmée;
- correctif ou configuration revu;
- tests de non-régression réussis;
- isolation intermunicipale vérifiée;
- version publiée vérifiée;
- intégrations réconciliées;
- accessibilité essentielle confirmée;
- surveillance renforcée prête;
- autorité humaine ayant approuvé la reprise.

## Communication

Toute communication doit distinguer :

- faits confirmés;
- hypothèses;
- données ou municipalités touchées;
- mesures prises;
- services suspendus;
- prochaine décision prévue;
- obligations de notification applicables.

Aucune minimisation ni affirmation non vérifiée n’est permise.

## Rapport d’incident

Le rapport contient :

- identifiant, niveau et chronologie;
- détection et source du signal;
- périmètre et impacts;
- décisions et responsables;
- preuves utilisées;
- cause directe et facteurs contributifs;
- actions de confinement;
- retour arrière effectué;
- validation de reprise;
- notifications;
- correctifs et échéances;
- décision de maintien, suspension ou retrait.

## Revue après incident

La revue recherche les causes systémiques sans blâme individuel. Elle met à jour :

- les barrières;
- les tests;
- les seuils;
- les responsabilités;
- les contrats d’intégration;
- la matrice de preuves;
- la décision d’autorisation;
- le plan de fermeture.

## Exercices

Avant un pilote réel, au moins les scénarios suivants sont simulés :

- publication incorrecte;
- fuite intermunicipale;
- secret compromis;
- panne d’intégration avec rejeu;
- restauration d’une sauvegarde;
- fermeture complète du pilote.

## Limite

Ce protocole prépare la réponse. Il ne remplace pas les obligations municipales, contractuelles ou légales de notification et d’enquête.