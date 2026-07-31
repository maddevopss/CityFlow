# Registre des initiatives CityFlow 2.x

## Intention

Ce registre constitue la source de vérité des initiatives CityFlow 2.x. Il rend visibles leur admission, leur état, leurs responsabilités, leurs dépendances, leurs barrières, leurs preuves et leur décision finale.

Aucune initiative 2.x ne peut être considérée comme autorisée, prioritaire ou en cours simplement parce qu’elle apparaît dans une discussion, une issue, une branche, une maquette ou une pull request.

## Principes

Le registre applique les règles suivantes :

- une initiative possède un identifiant stable;
- une seule fiche officielle existe par initiative;
- chaque état est explicite et daté;
- toute décision est attribuée;
- les barrières critiques restent non compensables;
- les changements de portée sont versionnés;
- les preuves sont liées plutôt que résumées sans trace;
- une initiative arrêtée ou refusée demeure visible;
- la livraison technique ne suffit pas à déclarer une initiative réussie;
- l’absence de mise à jour ne vaut jamais approbation ni poursuite automatique.

## Identifiant

L’identifiant suit le format :

`CF2X-INIT-0001`

Il ne doit jamais être réutilisé, même après refus, fusion, retrait ou arrêt de l’initiative.

## États autorisés

### Proposition

L’initiative est décrite, mais son dossier d’admission n’est pas complet.

### À préciser

Des informations, preuves, responsabilités ou conditions importantes manquent avant décision.

### En évaluation

Le dossier est suffisamment complet pour être évalué, mais aucune décision finale d’admission n’a encore été prise.

### Admise sous conditions

L’initiative peut avancer uniquement dans les limites et conditions inscrites au registre.

### Admise

L’initiative peut entrer en planification et en réalisation dans sa portée approuvée.

### En réalisation

Les travaux autorisés sont en cours.

### En validation

La réalisation est terminée pour la portée observée et les preuves de validation sont en collecte ou en revue.

### En pilote

La capacité est utilisée dans un périmètre municipal limité, avec critères d’arrêt et mesures explicites.

### En observation

La capacité est livrée, mais la décision sur sa réussite, son élargissement ou son retrait dépend encore d’une période d’observation.

### Confirmée

Les résultats, l’adoption, la qualité et la soutenabilité justifient le maintien de la capacité.

### Reportée

L’initiative reste pertinente, mais ne peut pas avancer actuellement. La raison et la condition de réévaluation sont inscrites.

### Refusée

L’initiative ne satisfait pas aux critères d’admission ou contredit une barrière non compensable.

### Arrêtée

Une initiative précédemment admise est stoppée en raison de nouvelles preuves, d’un échec, d’un risque, d’un changement de contexte ou d’une capacité insuffisante.

### Retirée

La capacité livrée est volontairement retirée. Le plan de retrait, les impacts et la conservation des preuves sont documentés.

### Fermée

La décision finale est prise, les obligations résiduelles sont attribuées et aucune action active ne demeure dans l’initiative.

## Fiche obligatoire

Chaque initiative doit contenir au minimum :

| Champ | Contenu attendu |
| --- | --- |
| Identifiant | Identifiant stable CityFlow 2.x |
| Titre | Formulation courte orientée problème ou résultat |
| État | Un état autorisé du registre |
| Version | Version courante de la fiche |
| Responsable | Personne responsable de maintenir la fiche |
| Décideur | Personne ou groupe autorisé à prendre la décision |
| Date de création | Date d’ouverture de la fiche |
| Dernière révision | Date de la dernière décision ou modification substantielle |
| Prochaine revue | Date ou condition de la prochaine revue |
| Problème | Situation actuelle à corriger |
| Population touchée | Équipes, municipalités, partenaires ou citoyens concernés |
| Situation de référence | Mesures ou constats avant intervention |
| Résultat attendu | Effet observable recherché |
| Mesures | Indicateurs, seuils et période d’observation |
| Portée | Ce qui est inclus |
| Hors portée | Ce qui est explicitement exclu |
| Municipalités | Municipalités concernées |
| Données | Données utilisées, produites, diffusées et conservées |
| Géographie | Objets, formats, coordonnées et règles géographiques concernés |
| Barrières | Sécurité, isolation, vie privée, accessibilité, conformité, audit |
| Dépendances | Systèmes, fournisseurs, contrats, équipes et décisions préalables |
| Exploitation | Soutien, supervision, capacité, reprise et coût récurrent |
| Conditions | Conditions imposées à l’admission ou au pilote |
| Arrêt | Déclencheurs d’arrêt immédiat ou planifié |
| Retour arrière | Méthode de retour à l’état sûr précédent |
| Retrait | Méthode de retrait après livraison |
| Preuves | Liens vers études, tests, incidents, mesures et décisions |
| Décision | Décision officielle et justification |
| Obligations résiduelles | Risques, dettes, suivis ou actions restant après fermeture |

## Règles de mouvement

Un changement d’état exige une trace versionnée comprenant :

- ancien état;
- nouvel état;
- date;
- auteur de la modification;
- décideur;
- justification;
- preuves considérées;
- conditions ajoutées ou levées;
- impacts sur la portée, le calendrier, les risques et l’exploitation;
- prochaine décision attendue.

Les mouvements suivants sont interdits :

- `Proposition` directement vers `En réalisation`;
- `À préciser` directement vers `En réalisation`;
- `En évaluation` directement vers `Confirmée`;
- `En réalisation` directement vers `Confirmée` sans validation;
- `En pilote` vers `Confirmée` sans bilan de pilote;
- `Refusée`, `Arrêtée`, `Retirée` ou `Fermée` vers un état actif sans nouvelle décision versionnée.

## Conditions d’admission

Une initiative ne peut passer à `Admise` ou `Admise sous conditions` que si :

- le problème actuel est démontré;
- une situation de référence existe ou son absence est justifiée;
- le résultat attendu est mesurable;
- la portée et le hors portée sont explicites;
- les données et responsabilités sont identifiées;
- les barrières applicables sont évaluées;
- aucune barrière critique ne demeure sans résolution acceptable;
- les dépendances sont connues;
- la capacité de conception, livraison, validation et exploitation est réaliste;
- les conditions d’arrêt, de retour arrière et de retrait sont définies;
- le décideur est identifié;
- la prochaine revue est planifiée.

## Conditions d’ouverture d’une PR de réalisation

Une pull request de réalisation 2.x doit référencer un identifiant du registre et préciser :

- l’état d’admission courant;
- la portée autorisée couverte;
- les conditions applicables;
- les preuves de validation prévues;
- les risques ou obligations non résolus;
- le comportement de retour arrière;
- l’effet attendu sur l’exploitation.

Une PR sans initiative admise peut uniquement contenir de l’exploration réversible, de la documentation ou des preuves nécessaires à l’évaluation. Elle ne peut introduire une capacité de production active.

## Revue périodique

Le registre doit être revu au minimum :

- avant le début d’un nouveau bloc de réalisation;
- à chaque changement substantiel de portée;
- lors de l’apparition d’un risque critique;
- avant et après un pilote;
- après un incident significatif;
- à la fin d’une période d’observation;
- avant la fermeture d’une initiative;
- lors de la revue globale de la série 2.x.

Toute initiative active sans responsable, prochaine revue ou preuve récente doit être placée `À préciser`, `Reportée` ou `Arrêtée` selon le risque.

## Vue synthétique initiale

| Identifiant | Initiative | État initial | Dépendance principale | Décision suivante |
| --- | --- | --- | --- | --- |
| CF2X-INIT-0001 | Modèle géographique officiel | Proposition | Règles de qualité géographique | Compléter le dossier d’admission |
| CF2X-INIT-0002 | Cycle municipal de publication | Proposition | États, rôles et preuves d’approbation | Compléter le dossier d’admission |
| CF2X-INIT-0003 | Isolation et audit de bout en bout | Proposition | Modèle municipal et contrôle d’accès | Compléter le dossier d’admission |
| CF2X-INIT-0004 | Intégrations versionnées | Proposition | Contrats de données et reprise | Attendre les fondations précédentes |
| CF2X-INIT-0005 | Pilote municipal limité | Proposition | Initiatives 0001 à 0004 suffisamment validées | Définir le dossier de pilote |

Cette vue n’accorde aucune admission. Elle rend seulement visibles les initiatives envisagées par la séquence initiale de la feuille de route 2.x.

## Fermeture d’une initiative

Une initiative peut être placée `Fermée` seulement lorsque :

- la décision finale est explicite;
- les preuves principales sont liées;
- les résultats sont comparés à la situation de référence;
- les risques, dettes et limites sont consignés;
- les obligations résiduelles sont attribuées et datées;
- le maintien, l’élargissement, la réduction, le retrait ou l’arrêt est décidé;
- les documents, configurations et capacités temporaires sont retirés ou transférés;
- la prochaine destination des apprentissages est connue.

La fermeture administrative ne doit jamais masquer une capacité encore active, une dette sans propriétaire ou un risque non traité.
