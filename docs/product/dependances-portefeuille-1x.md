# Dépendances du portefeuille 1.x

## Objet

Ce document définit comment CityFlow identifie, attribue, suit et ferme les dépendances entre initiatives, services, données, équipes et fournisseurs.

## Principe

Une dépendance n’est pas une note secondaire. Elle peut modifier la priorité, la date, le risque, le coût et la possibilité même de livrer une initiative.

Toute dépendance doit avoir un propriétaire, un état, une preuve, une prochaine action et une date de décision.

## Types

Les dépendances sont classées au minimum comme :

- produit ou parcours utilisateur;
- données et qualité de l’information;
- architecture ou plateforme;
- sécurité, identité ou isolation;
- exploitation et soutien;
- conformité ou engagement contractuel;
- équipe, compétence ou disponibilité;
- fournisseur ou service externe;
- migration, retrait ou compatibilité.

## Fiche obligatoire

Chaque dépendance consigne :

- un identifiant stable;
- les initiatives touchées;
- le fournisseur et le consommateur;
- la capacité ou décision attendue;
- le propriétaire de résolution;
- l’état réel;
- la date nécessaire;
- les preuves disponibles;
- le risque en cas de retard ou d’échec;
- la solution de rechange;
- la condition de fermeture.

## États

Les états autorisés sont : découverte, à confirmer, acceptée, en traitement, bloquante, satisfaite, contournée, retirée et fermée.

Une dépendance « satisfaite » n’est fermée qu’après vérification par son consommateur.

## Chemin critique

Le portefeuille maintient une vue du chemin critique. Toute modification doit indiquer :

- les initiatives nouvellement bloquées;
- les dates ou engagements touchés;
- la capacité déplacée;
- le risque résiduel;
- la décision d’arbitrage.

## Dépendances externes

Une promesse de fournisseur ne vaut pas preuve de disponibilité. Les dépendances externes exigent, selon le risque :

- un accord ou une version vérifiable;
- des limites et niveaux de service connus;
- une stratégie de panne ou de retrait;
- un responsable interne;
- une date de réévaluation.

## Contournement

Un contournement est temporaire, documenté et réversible. Il précise son coût, ses risques, sa durée, son propriétaire et sa condition de retrait.

Un contournement devenu permanent doit être admis comme une nouvelle décision, pas oublié dans l’exploitation.

## Escalade

Une dépendance est escaladée lorsqu’elle :

- bloque une priorité autorisée;
- menace une barrière de sécurité ou d’intégrité;
- dépasse sa date de décision;
- repose sur une hypothèse non vérifiée;
- crée une concentration excessive sur une personne ou un fournisseur.

## Revue et fermeture

Les dépendances bloquantes sont revues au moins chaque semaine. Les autres suivent la revue du portefeuille.

La fermeture exige :

- la preuve que la capacité attendue existe;
- la validation du consommateur;
- la mise à jour des risques et dates;
- le retrait des contournements devenus inutiles;
- la conservation de l’historique.

Aucune initiative ne peut être déclarée prête si une dépendance critique reste seulement supposée.