# Observabilité — CityFlow 2.x

## 1. Objet

Ce cadre définit comment CityFlow 2.x rend visibles l’état réel d’un service, ses effets, ses dégradations et ses limites afin de permettre une décision humaine rapide et fondée sur des preuves.

L’observabilité ne se réduit pas à accumuler des journaux. Elle doit permettre de répondre à trois questions : que se passe-t-il, qui est touché et quelle action est requise.

## 2. Principes

1. Toute capacité exploitée doit posséder un propriétaire d’observabilité.
2. Une métrique sans seuil ni action associée est informative, mais non opérationnelle.
3. Les signaux techniques doivent être reliés aux parcours réels et aux effets sur les personnes.
4. Les erreurs silencieuses, la dérive des données et les disparités géographiques doivent être détectables.
5. Les seuils ne peuvent être modifiés rétroactivement pour masquer une dégradation.
6. La collecte doit respecter la minimisation des données et les règles de confidentialité.
7. Les tableaux de bord ne remplacent pas une procédure d’intervention.

## 3. Identifiant et dossier

Chaque dispositif reçoit un identifiant stable :

`CF2X-OBS-xxxx`

Le dossier contient :

- service ou capacité;
- propriétaire;
- population et territoires couverts;
- niveau de criticité;
- objectifs de service;
- signaux essentiels;
- sources de données;
- seuils;
- actions;
- dépendances;
- limites connues;
- durée de conservation;
- accès;
- date de dernière vérification.

## 4. Dimensions obligatoires

L’observabilité couvre proportionnellement :

- disponibilité;
- latence;
- erreurs;
- saturation;
- qualité et fraîcheur des données;
- sécurité;
- adoption et usage;
- parcours essentiels;
- effets géographiques;
- accessibilité;
- coûts;
- dépendances externes;
- capacité de retour ou de confinement.

## 5. Signaux essentiels

Chaque signal précise :

- sa définition;
- son unité;
- sa source;
- sa fréquence;
- sa population;
- son territoire;
- sa valeur de référence;
- ses seuils d’avertissement, d’alerte et d’arrêt;
- la personne ou équipe responsable;
- l’action attendue;
- ses limites et angles morts.

## 6. Indicateurs de service

Les indicateurs doivent représenter une expérience réelle, par exemple :

- proportion de parcours complétés;
- délai de réponse utile;
- taux de données valides;
- disponibilité d’une fonction essentielle;
- fréquence de recours au mode dégradé;
- proportion d’utilisateurs touchés;
- temps de détection et de rétablissement.

Les moyennes seules sont insuffisantes lorsqu’elles cachent des écarts importants.

## 7. Segmentation

Les signaux sont segmentés lorsque pertinent par :

- territoire;
- organisation;
- type d’utilisateur;
- canal;
- version;
- fournisseur;
- période;
- niveau de service;
- contexte d’accessibilité.

Toute segmentation doit prévenir la réidentification indue.

## 8. Qualité des données d’observation

Le dispositif vérifie :

- complétude;
- fraîcheur;
- cohérence;
- provenance;
- stabilité des définitions;
- retards de collecte;
- changements de schéma;
- valeurs manquantes;
- doublons;
- biais d’échantillonnage.

Un indicateur dont la qualité est insuffisante doit afficher son niveau de confiance et ne peut soutenir seul une décision critique.

## 9. Journaux et traces

Les journaux doivent :

- être horodatés de manière cohérente;
- contenir un identifiant de corrélation;
- éviter les secrets et données personnelles inutiles;
- distinguer erreur, avertissement et information;
- permettre la reconstruction d’un parcours critique;
- être protégés contre l’altération;
- avoir une durée de conservation explicite.

## 10. Alertes

Une alerte exploitable précise :

- le symptôme;
- la portée probable;
- le niveau de gravité;
- le propriétaire;
- la procédure associée;
- le délai attendu;
- le chemin d’escalade;
- les conditions de fermeture.

Les alertes répétitives sans action doivent être corrigées, regroupées ou retirées.

## 11. Seuils

Les seuils sont définis avant observation et reliés à des décisions :

- avertissement : analyse requise;
- alerte : intervention requise;
- gel : aucune extension supplémentaire;
- arrêt : retour, désactivation ou confinement;
- critique : activation de la gestion d’incident.

## 12. Détection des erreurs silencieuses

Le dispositif couvre notamment :

- données périmées présentées comme actuelles;
- calculs valides techniquement mais faux fonctionnellement;
- résultats absents sans erreur visible;
- files bloquées;
- synchronisations partielles;
- disparités entre territoires;
- dérive d’un modèle ou d’une règle;
- parcours abandonnés sans exception technique.

## 13. Dépendances externes

Chaque dépendance externe possède :

- des signaux de disponibilité;
- des délais observés;
- des limites de capacité;
- des erreurs propres;
- un propriétaire de relation;
- un mode dégradé;
- une stratégie de sortie;
- un mécanisme d’escalade.

## 14. Coûts

L’observabilité couvre les coûts significatifs :

- calcul;
- stockage;
- transfert;
- fournisseurs;
- soutien;
- alertes;
- opérations manuelles;
- croissance prévisible.

Une hausse de coût sans hausse correspondante de valeur déclenche une réévaluation.

## 15. Tableaux de bord

Chaque tableau de bord indique :

- son objectif;
- son public;
- la période;
- la fraîcheur;
- les définitions;
- les seuils;
- les limites;
- le lien vers les procédures;
- la date de dernière revue.

Il est interdit d’utiliser des couleurs seules pour communiquer un état critique.

## 16. Vérification du dispositif

Le dispositif est vérifié par :

- injection d’un événement connu;
- simulation d’une dépendance indisponible;
- test d’un seuil;
- vérification du routage d’alerte;
- exercice de lecture des signaux;
- contrôle de la confidentialité;
- validation du retour à l’état normal.

## 17. Niveaux

### Courant

Signaux essentiels, seuils, alertes et procédures standards.

### Renforcé

Segmentation, tests synthétiques, qualité des données, dépendances et exercices réguliers.

### Critique

Surveillance continue, redondance des signaux, validation indépendante, accès d’urgence, exercices de défaillance et conservation renforcée des preuves.

## 18. Révision

Le dispositif est révisé lors de :

- changement de portée;
- incident;
- nouvelle dépendance;
- changement de données;
- dérive de coût;
- modification réglementaire;
- changement de propriétaire;
- découverte d’un angle mort.

## 19. Fermeture ou retrait

Un signal peut être retiré seulement si :

- sa fonction n’est plus requise;
- aucun risque ou engagement ne dépend de lui;
- son remplacement est actif, le cas échéant;
- la décision est enregistrée;
- l’historique utile est conservé.

## 20. Traçabilité

Le dossier relie :

- initiative;
- résultats de valeur;
- risques;
- dépendances;
- validation;
- mise en service;
- transfert d’exploitation;
- incidents;
- problèmes;
- décisions;
- changements;
- PR.

## 21. Interdictions

Il est interdit de :

- déclarer un service sain uniquement parce qu’il répond;
- masquer les données défavorables;
- modifier rétroactivement un seuil;
- collecter des données sans finalité;
- créer une alerte sans propriétaire;
- fermer une alerte sans preuve de rétablissement;
- utiliser une moyenne pour cacher une disparité critique;
- confondre absence d’alerte et absence de problème.
