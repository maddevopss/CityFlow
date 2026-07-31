# Validation CityFlow 2.x

## Statut

Proposition de gouvernance produit.

## Objet

Ce document définit comment CityFlow 2.x démontre qu’un changement réalisé répond réellement au problème admis, respecte les décisions prises, maîtrise ses risques, satisfait ses obligations d’exploitation et produit les résultats attendus.

La validation ne se limite pas à constater qu’un développement est terminé ou qu’un test automatisé passe. Elle établit, avec des preuves vérifiables, si le changement peut être accepté, limité, corrigé, suspendu, retiré ou soumis à une nouvelle décision.

## Principes

1. Une livraison n’est pas une validation.
2. Une validation repose sur des critères définis avant l’observation des résultats.
3. Les preuves doivent être traçables, datées, reproductibles lorsque possible et accompagnées de leurs limites.
4. Les validations critiques exigent une indépendance proportionnée au risque.
5. Une absence de preuve n’est pas une preuve d’absence de problème.
6. Les résultats défavorables, ambigus ou incomplets ne peuvent être masqués.
7. Les seuils d’acceptation ne sont pas modifiés rétroactivement pour faire paraître un résultat conforme.
8. Toute décision finale demeure humaine et explicite.

## Identifiant du dossier

Chaque dossier de validation reçoit un identifiant stable :

`CF2X-VAL-xxxx`

Il référence au minimum :

- l’initiative concernée;
- le dossier de réalisation;
- les décisions applicables;
- les risques et dépendances associés;
- les résultats de valeur attendus;
- les PR et versions observées;
- les incidents ou écarts connus.

## Portées de validation

La validation couvre, selon la nature du changement :

- la conformité fonctionnelle;
- la cohérence des données;
- la sécurité et la protection des accès;
- la confidentialité et la minimisation des données;
- la performance et la capacité;
- la résilience et le retour arrière;
- l’observabilité;
- l’accessibilité;
- l’expérience réelle des personnes;
- la qualité géographique et cartographique;
- l’exploitation, le support et la maintenance;
- l’intégration avec les services externes;
- la valeur produite et les effets négatifs éventuels.

## États du dossier

Un dossier peut être :

- `préparé`;
- `en observation`;
- `preuves incomplètes`;
- `écart détecté`;
- `validation conditionnelle`;
- `validé`;
- `refusé`;
- `suspendu`;
- `fermé`.

Chaque changement d’état est daté, justifié et attribué.

## Critères préalables

Avant le début de la validation, le dossier doit contenir :

- le problème confirmé;
- la portée exacte du changement;
- les critères d’acceptation;
- les critères de refus;
- les indicateurs de protection;
- les seuils d’alerte et d’arrêt;
- la population ou le territoire observé;
- la période d’observation;
- les méthodes de collecte;
- les risques de biais;
- les propriétaires des preuves;
- l’autorité de décision;
- le plan de retour, de correction ou de retrait.

Une validation ne commence pas sur une portée implicite.

## Catégories de preuves

### Preuves automatisées

Exemples :

- tests unitaires;
- tests d’intégration;
- tests de contrat;
- tests de sécurité;
- tests de migration;
- tests de performance;
- contrôles de qualité de données;
- vérifications d’accessibilité automatisées.

Ces preuves démontrent un comportement précis, mais ne remplacent pas l’observation réelle.

### Preuves humaines

Exemples :

- revue fonctionnelle;
- test exploratoire;
- validation d’accessibilité manuelle;
- revue opérationnelle;
- vérification cartographique;
- observation d’un flux de travail réel;
- retour structuré des personnes concernées.

### Preuves d’exploitation

Exemples :

- tableaux de bord actifs;
- alertes testées;
- journaux exploitables;
- procédures d’incident;
- restauration vérifiée;
- capacité de désactivation;
- transfert au support;
- propriétaire d’exploitation confirmé.

### Preuves de valeur

Exemples :

- mesure avant et après;
- adoption réelle;
- réduction d’un délai ou d’une charge;
- amélioration de qualité;
- diminution des erreurs;
- amélioration de la compréhension ou de la décision;
- absence d’effet négatif au-delà des seuils permis.

## Qualité d’une preuve

Chaque preuve doit préciser :

- sa source;
- sa date;
- sa version ou son contexte;
- la méthode utilisée;
- le propriétaire;
- la portée couverte;
- les limites connues;
- le niveau de confiance;
- le lien vers l’artefact vérifiable.

Une capture isolée, une affirmation orale ou un résultat sans contexte ne suffit pas pour une décision importante.

## Matrice de validation

Le dossier maintient une matrice reliant :

- exigence ou hypothèse;
- critère attendu;
- méthode de validation;
- preuve produite;
- résultat observé;
- écart;
- décision;
- action résiduelle.

Aucune exigence critique ne peut rester sans méthode ni propriétaire.

## Niveaux de validation

### Niveau courant

Pour les changements limités, réversibles et à faible exposition.

Exige :

- preuves automatisées pertinentes;
- revue fonctionnelle;
- vérification d’exploitation minimale;
- absence d’écart critique.

### Niveau renforcé

Pour les changements à exposition modérée ou élevée.

Exige en plus :

- validation indépendante;
- scénario de dégradation;
- preuve de retour;
- observation en conditions représentatives;
- revue des indicateurs de protection.

### Niveau critique

Pour les changements touchant notamment la sécurité, les données sensibles, les décisions importantes, la continuité, les interventions terrain ou un grand nombre de personnes.

Exige en plus :

- séparation claire entre auteur, réviseur et décideur;
- preuves de restauration ou de désactivation;
- scénarios d’incident;
- revue explicite des risques résiduels;
- autorisation humaine nominative;
- fenêtre d’observation suffisante;
- décision de sortie documentée.

## Validation indépendante

La validation est considérée indépendante lorsque la personne ou l’équipe :

- n’est pas l’unique auteur du changement;
- n’est pas directement évaluée uniquement sur la livraison rapide;
- dispose des informations nécessaires;
- peut refuser ou suspendre sans conflit d’autorité;
- documente ses conclusions et ses réserves.

L’indépendance doit être proportionnée à la criticité.

## Écarts

Un écart précise :

- le critère non satisfait;
- le résultat observé;
- la gravité;
- la population ou le territoire touché;
- la reproductibilité;
- la cause connue ou supposée;
- l’action immédiate;
- le propriétaire;
- l’échéance;
- la décision associée.

Les écarts sont classés :

- mineurs;
- modérés;
- majeurs;
- critiques.

Un écart critique bloque la validation et déclenche l’arrêt, le retour ou la suspension selon le plan prévu.

## Validation conditionnelle

Une validation conditionnelle est permise seulement lorsque :

- aucun obstacle critique n’est présent;
- les écarts résiduels sont compris;
- chaque condition est explicite;
- un propriétaire et une échéance existent;
- la surveillance est active;
- le retrait demeure possible;
- l’autorité compétente accepte formellement le risque résiduel.

Elle expire automatiquement à la date fixée si les conditions ne sont pas levées.

## Décisions possibles

À la fin de l’examen, l’autorité décide :

- `accepter`;
- `accepter sous conditions`;
- `prolonger l’observation`;
- `corriger puis représenter`;
- `limiter la portée`;
- `suspendre`;
- `retourner à la version précédente`;
- `retirer`;
- `refuser`.

La décision mentionne les preuves consultées, les réserves, les risques résiduels et la prochaine revue.

## Réévaluation obligatoire

Une nouvelle validation est requise lorsque :

- la portée change significativement;
- une hypothèse importante devient fausse;
- une dépendance critique change;
- un incident survient;
- une vulnérabilité importante est découverte;
- les données ou le territoire changent;
- un seuil de protection est dépassé;
- le comportement réel diverge des essais;
- une condition de validation expire;
- une décision antérieure est remplacée.

## Validation en production

Certaines propriétés ne peuvent être confirmées qu’en conditions réelles. Dans ce cas :

- l’exposition est limitée;
- les personnes touchées sont identifiables;
- les indicateurs sont actifs avant l’ouverture;
- les seuils d’arrêt sont automatiques lorsque possible;
- un propriétaire observe la période;
- le retour est testé;
- la durée est définie;
- la décision finale est prise après observation.

Une expérimentation en production n’est jamais présentée comme une validation complète avant la fin de l’observation.

## Traçabilité des PR

Toute PR liée à une initiative en réalisation doit indiquer :

- l’identifiant de l’initiative;
- l’identifiant du dossier de réalisation;
- les critères couverts;
- les preuves ajoutées ou modifiées;
- les risques affectés;
- les dépendances affectées;
- les limites connues;
- le plan de validation restant.

La fusion d’une PR ne vaut pas acceptation finale de l’initiative.

## Fermeture du dossier

Un dossier de validation peut être fermé lorsque :

- une décision finale est enregistrée;
- les preuves sont conservées;
- les écarts résiduels ont un traitement explicite;
- les risques résiduels sont acceptés par l’autorité compétente;
- les obligations d’exploitation sont transférées;
- les conditions futures ont un propriétaire;
- les liens vers l’initiative, les décisions et les versions sont complets.

La fermeture ne supprime ni les échecs, ni les réserves, ni les obligations résiduelles.

## Interdictions

Il est interdit de :

- déclarer valide un changement uniquement parce qu’il est livré;
- réduire la portée après coup sans enregistrer la décision;
- supprimer un résultat défavorable;
- remplacer une preuve manquante par une opinion;
- confondre absence d’alerte et bon fonctionnement;
- accepter un risque critique sans autorité explicite;
- laisser une validation conditionnelle sans échéance;
- utiliser une recommandation automatisée comme autorité finale.

## Résultat attendu

Ce cadre doit permettre à CityFlow 2.x de démontrer, avant généralisation ou fermeture, que chaque changement est non seulement construit, mais réellement compris, observable, exploitable, réversible et conforme aux résultats attendus.