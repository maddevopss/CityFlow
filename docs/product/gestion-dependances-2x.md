# Gestion des dépendances — CityFlow 2.x

## 1. Objet

Ce document définit comment CityFlow 2.x identifie, qualifie, accepte, surveille, modifie et ferme les dépendances qui conditionnent une initiative, une décision, une mise en production ou une capacité d’exploitation.

Une dépendance n’est pas une simple note de planification. Elle représente un élément externe ou interne dont l’absence, le retard, la dégradation ou le retrait peut empêcher CityFlow de produire la valeur attendue, augmenter le risque, compromettre la sécurité ou rendre l’exploitation non soutenable.

## 2. Principes

1. Toute dépendance significative doit être visible avant l’admission d’une initiative.
2. Une date prévue ne constitue pas une preuve de disponibilité.
3. Une dépendance critique sans propriétaire, sans preuve ou sans solution de repli bloque le passage à la réalisation.
4. Les dépendances implicites sont traitées comme des risques non maîtrisés.
5. Les dépendances fournisseurs, données et exploitation sont évaluées avec la même rigueur que les dépendances techniques.
6. La suppression d’une dépendance ne doit pas déplacer silencieusement la charge vers une équipe, un opérateur ou un citoyen.
7. La fermeture d’une dépendance exige une preuve vérifiable.

## 3. Identifiant stable

Chaque dépendance reçoit un identifiant immuable :

`CF2X-DEP-xxxx`

Cet identifiant doit être repris dans :

- la fiche d’initiative;
- les décisions associées;
- le registre des risques;
- les plans de réalisation;
- les pull requests concernées;
- les rapports d’incident lorsqu’une dépendance se matérialise;
- les dossiers de validation et de fermeture.

## 4. Catégories de dépendances

### 4.1 Produit

Exemples :

- une capacité doit exister avant une autre;
- un parcours utilisateur dépend d’un rôle ou d’une politique;
- une fonction dépend d’un modèle de données déjà stabilisé;
- un indicateur dépend d’un événement produit encore absent.

### 4.2 Architecture et technique

Exemples :

- service interne;
- interface de programmation;
- bibliothèque;
- infrastructure;
- mécanisme d’identité;
- composant cartographique;
- file de traitement;
- capacité de stockage;
- système de cache.

### 4.3 Données

Exemples :

- source de données disponible;
- qualité minimale;
- provenance connue;
- fréquence de mise à jour;
- couverture géographique;
- droit d’utilisation;
- rétention;
- classification;
- mécanisme de correction.

### 4.4 Sécurité et conformité

Exemples :

- analyse de menace;
- contrôle d’accès;
- journalisation;
- chiffrement;
- politique de conservation;
- validation juridique;
- exigence contractuelle;
- évaluation des renseignements sensibles.

### 4.5 Exploitation

Exemples :

- supervision;
- procédures d’urgence;
- équipe de garde;
- capacité de soutien;
- seuils d’alerte;
- sauvegarde;
- reprise;
- documentation opératoire;
- formation.

### 4.6 Fournisseur ou partenaire

Exemples :

- service infonuagique;
- fournisseur cartographique;
- partenaire municipal;
- source de données externe;
- service de messagerie;
- service d’authentification;
- engagement contractuel.

### 4.7 Organisation et capacité humaine

Exemples :

- disponibilité d’un expert;
- décision d’une autorité;
- capacité d’une équipe;
- formation d’opérateurs;
- approbation budgétaire;
- responsabilité de soutien.

### 4.8 Calendrier et événement externe

Exemples :

- échéance réglementaire;
- saison hivernale;
- travaux routiers;
- période électorale;
- fenêtre de déploiement;
- migration planifiée;
- fin de contrat.

## 5. Types de relation

Une dépendance doit préciser sa relation exacte :

- **prérequis** : doit être satisfaite avant le début;
- **séquentielle** : une étape doit précéder une autre;
- **simultanée** : deux éléments doivent progresser ensemble;
- **fonctionnelle** : la capacité dépend du comportement d’un autre composant;
- **de données** : la valeur dépend de données externes ou internes;
- **opérationnelle** : l’exploitation dépend d’un moyen ou d’une équipe;
- **contractuelle** : l’usage dépend d’un engagement formel;
- **temporelle** : la dépendance n’est valide que pendant une fenêtre;
- **inverse** : le retrait d’un élément impose le retrait d’un autre;
- **conditionnelle** : la dépendance ne s’active que si une condition apparaît.

## 6. Fiche obligatoire

Chaque fiche de dépendance contient au minimum :

- identifiant;
- titre;
- description;
- catégorie;
- relation;
- initiative ou capacité dépendante;
- élément dont elle dépend;
- propriétaire CityFlow;
- propriétaire externe, s’il y a lieu;
- état;
- criticité;
- date requise;
- preuve attendue;
- niveau de confiance;
- conséquence en cas d’échec;
- risques associés;
- solution de repli;
- seuil d’escalade;
- prochaine revue;
- décision d’acceptation;
- historique des changements.

## 7. États autorisés

- **repérée** : existence constatée, analyse incomplète;
- **à qualifier** : propriétaire et effets à confirmer;
- **confirmée** : nature, portée et propriétaire établis;
- **engagée** : engagement explicite obtenu;
- **en réalisation** : travail nécessaire en cours;
- **disponible sous conditions** : utilisable avec limites documentées;
- **satisfaite** : preuve obtenue et critères respectés;
- **dégradée** : disponibilité ou qualité inférieure aux attentes;
- **bloquante** : empêche la progression autorisée;
- **abandonnée** : ne sera pas satisfaite;
- **remplacée** : solution alternative approuvée;
- **fermée** : obligations résiduelles traitées et dossier archivé.

Les transitions doivent être enregistrées. Une dépendance ne peut pas passer directement de « repérée » à « satisfaite » sans qualification et preuve.

## 8. Criticité

### Faible

L’échec cause un inconfort limité sans compromettre la valeur principale.

### Modérée

L’échec réduit la portée, augmente le coût ou retarde une partie du résultat.

### Élevée

L’échec compromet une capacité importante, un engagement externe ou une partie substantielle de la valeur.

### Critique

L’échec peut entraîner :

- une atteinte à la sécurité;
- une fuite ou une corruption de données;
- une décision incorrecte à grande échelle;
- une incapacité d’exploiter;
- une violation légale ou contractuelle;
- une perte majeure de confiance publique;
- une absence complète de solution de repli.

Une dépendance critique doit posséder une preuve formelle, un propriétaire, une date, une surveillance et un scénario de repli ou d’arrêt.

## 9. Niveau de confiance

Le niveau de confiance est distinct de l’état :

- **faible** : dépendance supposée ou engagement non vérifié;
- **moyen** : informations partielles ou engagement informel;
- **élevé** : engagement explicite et preuve en cours;
- **confirmé** : preuve technique, contractuelle ou opérationnelle obtenue.

Une dépendance déclarée « engagée » avec une confiance faible doit être traitée comme instable.

## 10. Preuves acceptables

Selon la nature de la dépendance :

- contrat signé;
- décision enregistrée;
- test automatisé;
- résultat de validation;
- démonstration en environnement représentatif;
- journal d’exécution;
- procédure approuvée;
- preuve de formation;
- échantillon de données qualifié;
- mesure de performance;
- engagement daté d’un responsable autorisé;
- exercice de reprise réussi.

Une promesse verbale, une date dans un tableau ou un message non autorisé ne suffisent pas pour une dépendance élevée ou critique.

## 11. Dépendances croisées et graphe

Les dépendances doivent être représentées comme un graphe permettant d’identifier :

- les chaînes longues;
- les dépendances communes à plusieurs initiatives;
- les points uniques de défaillance;
- les boucles;
- les concentrations chez un fournisseur;
- les éléments critiques sans repli;
- les dates impossibles;
- les conflits de priorité.

Toute boucle doit être résolue ou explicitement acceptée avant la réalisation.

## 12. Dépendance commune

Lorsqu’un même élément conditionne plusieurs initiatives :

- un propriétaire commun est nommé;
- la capacité requise est consolidée;
- les priorités concurrentes sont arbitrées;
- les coûts sont rendus visibles;
- un incident unique doit pouvoir révéler toutes les initiatives touchées;
- la dépendance ne doit pas être dupliquée comme si elle était indépendante.

## 13. Dépendances externes

Une dépendance externe exige :

- un interlocuteur identifié;
- un engagement daté;
- les conditions de service;
- les limites connues;
- les droits d’usage;
- les délais d’avis de changement;
- une procédure d’escalade;
- une stratégie de sortie;
- l’évaluation du verrouillage fournisseur;
- la localisation et la protection des données, si applicable.

## 14. Solutions de repli

Une solution de repli doit préciser :

- le déclencheur;
- le responsable;
- le comportement dégradé autorisé;
- la durée maximale;
- l’effet sur les personnes et les opérations;
- les communications requises;
- les données perdues ou reportées;
- les conditions de retour à la normale;
- le seuil d’arrêt complet.

Un mode dégradé qui produit des décisions trompeuses ou compromet la sécurité n’est pas une solution de repli acceptable.

## 15. Admission d’une initiative

Avant l’admission, les dépendances élevées et critiques doivent être :

- recensées;
- qualifiées;
- reliées aux risques;
- attribuées à un propriétaire;
- accompagnées d’une preuve ou d’un plan de preuve;
- datées;
- dotées d’une solution de repli ou d’une règle de blocage.

L’initiative demeure proposée lorsque sa valeur dépend d’un élément critique purement hypothétique.

## 16. Passage à la réalisation

Le passage à la réalisation exige :

- aucune dépendance critique inconnue;
- aucun prérequis critique non engagé;
- une séquence réaliste;
- une capacité d’équipe confirmée;
- des environnements disponibles;
- les données minimales accessibles;
- les obligations de sécurité planifiées;
- une stratégie d’exploitation et de retrait.

## 17. Surveillance

Chaque dépendance élevée ou critique possède au moins :

- un indicateur de santé;
- une fréquence de revue;
- un seuil d’alerte;
- un seuil de blocage;
- une date de péremption de la preuve;
- une personne responsable de l’escalade.

Exemples d’indicateurs :

- disponibilité;
- retard;
- taux d’erreur;
- qualité de données;
- capacité restante;
- validité contractuelle;
- couverture géographique;
- délai de soutien;
- progression de migration.

## 18. Réévaluation obligatoire

Une dépendance doit être réévaluée lorsque :

- son propriétaire change;
- la date requise change;
- un fournisseur annonce une modification;
- une preuve expire;
- un incident survient;
- la portée d’une initiative évolue;
- une nouvelle population ou région est ajoutée;
- le niveau de risque augmente;
- le coût ou la capacité change significativement;
- la solution de repli échoue;
- une dépendance commune devient saturée.

## 19. Dépendance réalisée en incident

Lorsqu’une dépendance échoue réellement :

1. son état passe à « dégradée » ou « bloquante »;
2. un incident est ouvert si les opérations sont touchées;
3. les initiatives dépendantes sont identifiées;
4. les risques associés sont réévalués;
5. la solution de repli est activée ou l’arrêt est déclenché;
6. la décision de poursuite est enregistrée;
7. le retour d’expérience met à jour les preuves et le graphe.

## 20. Arbitrage

Lorsqu’une dépendance ne peut satisfaire toutes les initiatives :

- l’arbitrage est explicite;
- les critères sont documentés;
- la valeur attendue, le risque, l’urgence et l’équité sont considérés;
- les effets sur les initiatives retardées sont visibles;
- aucune équipe ne peut s’auto-attribuer silencieusement la priorité;
- la décision est enregistrée sous un identifiant de gouvernance.

## 21. Interdictions

Il est interdit de :

- déclarer une dépendance satisfaite sans preuve;
- masquer une dépendance pour préserver une date;
- remplacer un engagement par une hypothèse;
- créer une dépendance critique sur une personne unique sans relève;
- utiliser un mode dégradé non testé comme garantie;
- considérer un fournisseur comme infaillible;
- supprimer l’historique après remplacement;
- transférer une dépendance à l’exploitation sans acceptation explicite;
- poursuivre malgré un seuil de blocage sans décision enregistrée.

## 22. Fermeture

Une dépendance peut être fermée lorsque :

- elle est satisfaite, remplacée ou rendue inutile;
- la preuve finale est jointe;
- les initiatives touchées sont mises à jour;
- les risques résiduels sont acceptés ou fermés;
- les obligations contractuelles et de données sont traitées;
- la surveillance résiduelle est transférée;
- l’historique demeure accessible.

La fermeture d’une initiative n’entraîne pas automatiquement la fermeture d’une dépendance commune.

## 23. Registre minimal

Le registre synthétique doit permettre de voir au minimum :

| Identifiant | Titre | Catégorie | Initiative | Criticité | État | Confiance | Propriétaire | Date requise | Prochaine revue |
|---|---|---|---|---|---|---|---|---|---|
| CF2X-DEP-0001 | À qualifier | Données | À relier | Élevée | Repérée | Faible | À nommer | À définir | À définir |

Aucune entrée initiale n’est considérée satisfaite par défaut.

## 24. Liens avec les autres documents

Ce cadre complète :

- `docs/product/roadmap-2x.md`;
- `docs/product/admission-initiatives-2x.md`;
- `docs/product/registre-initiatives-2x.md`;
- `docs/product/gouvernance-decisions-2x.md`;
- `docs/product/gestion-risques-2x.md`;
- `docs/product/mesure-valeur-2x.md`.

Il prépare le passage à la réalisation, la validation et la fermeture des initiatives CityFlow 2.x.

## 25. Critères de conformité

Une initiative respecte ce cadre lorsque :

- ses dépendances significatives sont identifiées;
- les relations sont explicites;
- les dépendances élevées et critiques ont un propriétaire;
- les preuves et leur péremption sont connues;
- les solutions de repli sont testables;
- les seuils de blocage sont définis;
- les dépendances externes ont une stratégie de sortie;
- le graphe ne contient pas de boucle non traitée;
- les décisions et risques associés sont reliés;
- la fermeture ne masque aucune obligation résiduelle.
