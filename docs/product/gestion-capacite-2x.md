# Gestion de la capacité CityFlow 2.x

## 1. Objet

Ce document définit comment CityFlow 2.x mesure, réserve, affecte et réévalue la capacité nécessaire pour préparer, réaliser, valider, mettre en service, exploiter et retirer ses capacités.

La capacité ne correspond pas seulement au nombre de personnes disponibles. Elle inclut le temps, les compétences, les environnements, les données, les fournisseurs, les fenêtres opérationnelles, la capacité de décision et la capacité d’absorber les changements.

## 2. Principes

1. Une date n’est pas une preuve de capacité.
2. Une personne affectée à plusieurs engagements ne compte pas comme disponible à temps plein pour chacun.
3. L’exploitation, la sécurité, la validation et le retrait consomment de la capacité réelle.
4. Une marge doit rester disponible pour les incidents et obligations imprévues.
5. Les compétences rares et dépendances communes doivent être traitées comme des contraintes explicites.
6. La surcharge durable est un risque institutionnel, pas un effort héroïque normal.
7. Toute estimation doit indiquer son niveau de confiance.

## 3. Identifiant stable

Chaque analyse de capacité reçoit un identifiant :

`CF2X-CAP-AAAA-NNNN`

## 4. Dimensions de capacité

La capacité doit être évaluée selon :

- produit et analyse;
- conception et accessibilité;
- développement;
- données et géomatique;
- sécurité et protection des renseignements;
- validation et assurance qualité;
- infrastructure et déploiement;
- exploitation et soutien;
- architecture;
- gestion du changement et formation;
- fournisseurs;
- décision et gouvernance.

## 5. Capacité brute, réservée et nette

### 5.1 Capacité brute

Temps théoriquement disponible avant engagements et contraintes.

### 5.2 Capacité réservée

Temps destiné au maintien, aux incidents, à la sécurité, à la dette, aux obligations récurrentes et aux absences connues.

### 5.3 Capacité nette

Capacité réellement affectable à de nouveaux engagements après retranchement des réserves et engagements existants.

La capacité nette doit être utilisée pour les décisions de portefeuille.

## 6. Fiche de capacité

Chaque fiche contient :

- période couverte;
- équipe ou ressource;
- capacité brute;
- engagements existants;
- réserves;
- capacité nette;
- compétences critiques;
- dépendances externes;
- niveau de confiance;
- saturation observée;
- risques;
- décisions associées;
- date de prochaine révision.

## 7. Charges à inclure

Toute initiative doit inclure :

- préparation;
- réalisation;
- revues;
- validation;
- documentation;
- migration;
- mise en service;
- surveillance initiale;
- soutien renforcé;
- exploitation récurrente;
- traitement des réserves;
- retrait éventuel.

Les charges invisibles ne doivent pas être reportées automatiquement sur l’exploitation.

## 8. Réserves minimales

Le portefeuille doit réserver explicitement de la capacité pour :

- incidents;
- sécurité;
- maintien opérationnel;
- dette technique et opérationnelle;
- petites corrections;
- obligations imprévues;
- apprentissage et amélioration des contrôles.

La réduction temporaire d’une réserve exige une décision, une durée et une mesure compensatoire.

## 9. Saturation

Une ressource est considérée comme saturée lorsque :

- sa capacité nette est entièrement engagée;
- les interruptions compromettent les travaux essentiels;
- les délais d’attente dépassent les seuils;
- les heures supplémentaires deviennent récurrentes;
- la qualité ou la sécurité se dégrade;
- une compétence unique bloque plusieurs initiatives.

La saturation doit déclencher un arbitrage, pas une simple pression supplémentaire.

## 10. Points uniques de capacité

Toute compétence, personne, fournisseur ou environnement indispensable sans remplacement crédible est un point unique de capacité.

Pour chacun, CityFlow doit documenter :

- la dépendance;
- les initiatives exposées;
- le délai de remplacement;
- le plan de relève;
- les connaissances à transférer;
- le seuil de blocage.

## 11. Capacité des fournisseurs

Un engagement fournisseur doit distinguer :

- capacité contractuelle;
- capacité réellement confirmée;
- délai de mobilisation;
- limitations;
- dépendances du fournisseur;
- stratégie de sortie;
- capacité interne minimale de contrôle.

Un contrat ne constitue pas à lui seul une preuve de disponibilité.

## 12. Capacité d’exploitation

Aucune nouvelle capacité ne doit être généralisée sans démontrer :

- un propriétaire d’exploitation;
- une charge récurrente estimée;
- une capacité de soutien;
- des procédures;
- une surveillance;
- une capacité d’incident;
- un mécanisme de retrait ou de confinement.

## 13. Incertitude

Toute estimation doit préciser :

- hypothèses;
- plage probable;
- éléments inconnus;
- dépendances;
- niveau de confiance;
- événement déclenchant une réestimation.

Une estimation ponctuelle sans incertitude ne doit pas être présentée comme un engagement certain.

## 14. Seuils

Les seuils suivants doivent être définis :

- alerte de saturation;
- gel de nouvel engagement;
- réduction de portée;
- suspension;
- besoin de renfort;
- déclenchement d’un plan de relève.

## 15. Décisions possibles

Une revue de capacité peut :

- confirmer l’engagement;
- réduire la portée;
- séquencer les travaux;
- différer;
- renforcer une équipe;
- réserver une compétence;
- retirer un engagement;
- suspendre une initiative;
- augmenter les réserves;
- exiger un transfert de connaissances.

## 16. Indicateurs

Les indicateurs utiles comprennent :

- capacité nette disponible;
- ratio engagements/capacité;
- temps consacré aux incidents;
- charge non planifiée;
- délai d’attente par compétence;
- nombre de points uniques;
- taux de réaffectation;
- charge d’exploitation créée;
- dette reportée;
- stabilité des prévisions.

Ces indicateurs doivent être interprétés avec contexte et non comme des objectifs isolés.

## 17. Réévaluation

La capacité est réévaluée lors de :

- nouvelle initiative prioritaire;
- incident majeur;
- absence prolongée;
- changement fournisseur;
- dérive de portée;
- dette critique;
- nouvelle obligation;
- mise en service créant une charge inattendue.

## 18. Interdictions

Il est interdit de :

- compter deux fois la même capacité;
- planifier à 100 % sans réserve;
- masquer le soutien et l’exploitation;
- utiliser les heures supplémentaires comme capacité normale;
- affecter une compétence critique sans solution de relève;
- promettre une date sans analyse de capacité;
- considérer une ressource externe comme disponible sans confirmation.

## 19. Fermeture

Une analyse est fermée lorsque les engagements, réserves, risques, propriétaires et décisions sont enregistrés et que la prochaine révision est planifiée.

La fermeture ne supprime pas les alertes de saturation ni les obligations de relève.