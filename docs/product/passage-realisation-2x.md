# Passage à la réalisation — CityFlow 2.x

## Statut

Document de gouvernance produit applicable aux initiatives CityFlow 2.x.

## Objet

Ce document définit les conditions minimales permettant à une initiative admise de passer de la préparation à la réalisation.

Le passage à la réalisation n’est pas une formalité administrative. Il constitue une décision explicite selon laquelle le problème, la portée, les risques, la valeur attendue, les dépendances et les conditions d’exploitation sont suffisamment compris pour autoriser des changements concrets.

Une initiative ne peut pas entrer en réalisation uniquement parce qu’une équipe est disponible, qu’une date approche ou qu’une solution paraît évidente.

## Principes

1. Une initiative doit être admise avant toute réalisation.
2. L’entrée en réalisation doit être autorisée par une décision enregistrée.
3. Les preuves doivent précéder les engagements irréversibles.
4. Les risques critiques non traités demeurent bloquants.
5. Une dépendance critique non prouvée demeure bloquante.
6. La valeur attendue doit être mesurable.
7. Les conditions d’exploitation et de retrait doivent être envisagées avant la livraison.
8. Les responsabilités doivent être explicites.
9. Une autorisation peut être suspendue ou retirée.
10. La pression de calendrier ne remplace jamais une preuve.

## Identifiant du dossier de réalisation

Chaque passage à la réalisation reçoit un identifiant stable :

`CF2X-DELIVERY-xxxx`

Cet identifiant doit être relié à :

- l’initiative concernée;
- la décision d’autorisation;
- les risques ouverts;
- les dépendances;
- les résultats de valeur attendus;
- les PR de réalisation;
- les validations et décisions de fermeture.

## États du dossier

Un dossier de passage à la réalisation peut être :

- `préparation`;
- `à examiner`;
- `autorisé sous conditions`;
- `autorisé`;
- `suspendu`;
- `refusé`;
- `retiré`;
- `clos`.

Aucune initiative ne doit être considérée en réalisation tant que le dossier n’est pas `autorisé` ou `autorisé sous conditions`.

## Conditions d’entrée obligatoires

### Initiative admise

L’initiative doit :

- posséder un identifiant stable;
- être inscrite au registre des initiatives;
- avoir franchi le processus d’admission;
- ne pas être suspendue, refusée ou fermée.

### Problème confirmé

Le dossier doit décrire :

- le problème observé;
- les personnes, territoires ou opérations touchés;
- les preuves disponibles;
- les limites de ces preuves;
- la conséquence de ne rien faire.

Une demande de fonctionnalité seule ne constitue pas une définition de problème suffisante.

### Portée explicite

La portée doit préciser :

- ce qui sera réalisé;
- ce qui ne sera pas réalisé;
- les acteurs concernés;
- les territoires concernés;
- les données touchées;
- les interfaces touchées;
- les comportements existants qui pourraient changer.

Toute ambiguïté significative doit être traitée ou déclarée comme condition.

### Résultat de valeur défini

Le dossier doit référencer au moins un résultat de valeur comprenant :

- une valeur de référence;
- une cible;
- un seuil minimal;
- un indicateur principal;
- un ou plusieurs indicateurs de protection;
- une période de mesure;
- un propriétaire.

Une livraison technique ne constitue pas, à elle seule, une preuve de valeur.

### Risques évalués

Tous les risques connus doivent être enregistrés.

Avant autorisation :

- les risques critiques doivent être évités ou réduits sous le seuil acceptable;
- les risques élevés doivent avoir un traitement, un propriétaire et une autorité d’acceptation;
- les risques résiduels doivent être explicites;
- les seuils d’arrêt doivent être définis lorsque requis.

Un risque critique non compensable bloque l’entrée en réalisation.

### Dépendances qualifiées

Chaque dépendance importante doit avoir :

- un propriétaire;
- un état réel;
- une preuve de disponibilité ou d’engagement;
- une date de vérification;
- une conséquence en cas d’échec;
- une solution de repli lorsque nécessaire.

Une date planifiée ne prouve pas qu’une dépendance sera disponible.

### Architecture et données

Le dossier doit préciser :

- les composants touchés;
- les flux de données touchés;
- les nouvelles données collectées;
- les changements de schéma;
- les exigences de migration;
- les règles de conservation;
- les besoins d’audit;
- les impacts sur la confidentialité et la sécurité.

Toute migration irréversible doit être accompagnée d’un plan spécifique de retour ou de compensation.

### Sécurité et contrôle d’accès

Le dossier doit démontrer que :

- les rôles concernés sont identifiés;
- les autorisations minimales sont définies;
- les frontières entre organisations sont préservées;
- les actions sensibles sont traçables;
- les secrets ne sont pas exposés;
- les nouvelles surfaces d’attaque sont évaluées.

### Exploitation

Avant réalisation, les besoins d’exploitation doivent être connus :

- supervision;
- alertes;
- journaux;
- support;
- reprise;
- maintenance;
- capacité;
- coûts;
- procédures d’incident;
- responsabilités après mise en service.

Une fonctionnalité sans propriétaire d’exploitation ne doit pas être autorisée en production.

### Validation prévue

Le dossier doit définir avant le développement :

- les critères d’acceptation;
- les preuves attendues;
- les tests requis;
- les environnements utilisés;
- les scénarios négatifs;
- les contrôles de sécurité;
- les validations opérationnelles;
- l’autorité de validation finale.

## Dossier obligatoire

Le dossier de passage à la réalisation doit contenir au minimum :

| Champ | Exigence |
|---|---|
| Identifiant | `CF2X-DELIVERY-xxxx` |
| Initiative | identifiant de l’initiative admise |
| Propriétaire | responsable du dossier |
| Décideur | autorité d’entrée en réalisation |
| Problème | problème confirmé et preuves |
| Portée | inclusions et exclusions |
| Valeur | résultats et indicateurs |
| Risques | risques ouverts et résiduels |
| Dépendances | état, preuves et replis |
| Architecture | composants et flux touchés |
| Données | collecte, migration, conservation |
| Sécurité | accès, audit, surfaces d’attaque |
| Exploitation | supervision, support et reprise |
| Validation | critères et preuves attendues |
| Déploiement | stratégie de mise en service |
| Retour | rollback, désactivation ou compensation |
| Conditions | obligations avant ou pendant la réalisation |
| Date de revue | prochaine vérification obligatoire |

## Niveaux d’autorisation

### Autorisation standard

Applicable lorsque :

- les risques sont maîtrisés;
- les dépendances sont disponibles;
- le changement est réversible;
- l’impact demeure limité;
- les critères de validation sont complets.

### Autorisation sous conditions

Applicable lorsque certaines obligations non critiques restent ouvertes.

Chaque condition doit préciser :

- son propriétaire;
- son échéance;
- la preuve attendue;
- l’effet d’un non-respect;
- l’autorité pouvant lever la condition.

Une condition ne peut pas masquer une barrière critique.

### Autorisation renforcée

Requise pour les changements qui :

- touchent des données sensibles;
- modifient des frontières d’autorisation;
- ont un effet géographique important;
- sont difficiles à inverser;
- créent une dépendance externe structurante;
- peuvent affecter la confiance publique;
- introduisent une automatisation décisionnelle sensible.

L’autorisation renforcée exige une validation indépendante.

## Décisions possibles

À l’issue de l’examen, le décideur peut :

- autoriser;
- autoriser sous conditions;
- demander des preuves supplémentaires;
- réduire la portée;
- suspendre;
- refuser;
- renvoyer l’initiative à l’admission;
- exiger une expérimentation limitée.

La décision et sa justification doivent être enregistrées.

## Réalisation progressive

Une initiative peut être divisée en incréments lorsque cela réduit :

- l’exposition au risque;
- la taille des migrations;
- l’incertitude;
- la dépendance à une livraison unique;
- la difficulté de retour.

Chaque incrément doit avoir :

- une portée propre;
- des critères de validation;
- une stratégie de déploiement;
- un mécanisme de désactivation;
- une mesure de valeur ou d’apprentissage.

## Expérimentation contrôlée

Une expérimentation ne permet pas de contourner les barrières critiques.

Elle doit préciser :

- l’hypothèse;
- la population ou le territoire limité;
- la durée;
- les données utilisées;
- les indicateurs;
- les seuils d’arrêt;
- le mécanisme de retrait;
- l’autorité responsable.

## Exigences pour les PR de réalisation

Toute PR de réalisation doit référencer :

- l’initiative;
- le dossier `CF2X-DELIVERY-xxxx`;
- la décision d’autorisation;
- les risques traités;
- les dépendances concernées;
- les critères de validation applicables.

La PR doit également préciser :

- la portée du changement;
- les tests exécutés;
- les impacts de données;
- les impacts de sécurité;
- le plan de déploiement;
- le plan de retour;
- les limites connues.

## Changements de portée

Une modification significative de portée exige une réévaluation lorsque :

- de nouvelles données sont collectées;
- un nouveau territoire est ajouté;
- une nouvelle catégorie d’utilisateur est touchée;
- les autorisations changent;
- le coût ou la durée augmente fortement;
- une dépendance critique change;
- un risque devient plus élevé;
- la solution devient moins réversible.

Le dossier ne doit pas être modifié rétroactivement pour faire paraître le changement déjà autorisé.

## Suspension automatique

L’autorisation doit être réexaminée lorsque :

- une condition arrive à échéance sans preuve;
- un risque critique apparaît;
- une dépendance critique devient indisponible;
- un incident révèle une hypothèse fausse;
- les coûts dépassent le seuil autorisé;
- la valeur attendue devient non mesurable;
- une exigence de sécurité ou de conformité change;
- le mécanisme de retour n’est plus viable.

Selon la gravité, la réalisation peut être suspendue immédiatement.

## Dérogations

Une dérogation doit être exceptionnelle, limitée et enregistrée.

Elle doit contenir :

- la règle concernée;
- la justification;
- la durée;
- le risque créé;
- les mesures compensatoires;
- le propriétaire;
- l’autorité d’approbation;
- la date d’expiration.

Aucune dérogation ne peut autoriser une violation d’une barrière critique non compensable.

## Séparation des responsabilités

Pour les changements élevés ou critiques :

- le propriétaire de réalisation ne doit pas être l’unique décideur;
- la validation finale doit être indépendante;
- l’acceptation des risques doit être attribuée à une autorité explicite;
- l’exploitation doit confirmer sa capacité à prendre en charge le changement.

## Preuves acceptables

Les preuves peuvent inclure :

- tests automatisés;
- revues techniques;
- prototypes;
- résultats d’expérimentation;
- analyses de données;
- simulations;
- exercices de reprise;
- validations de sécurité;
- confirmations contractuelles;
- démonstrations opérationnelles.

Une affirmation, une date ou une intention ne constitue pas une preuve suffisante.

## Traçabilité

Le dossier doit permettre de retracer :

- pourquoi la réalisation a été autorisée;
- quelles preuves étaient disponibles;
- quelles conditions restaient ouvertes;
- quels risques ont été acceptés;
- quelles dépendances étaient supposées disponibles;
- quelles PR ont réalisé l’initiative;
- pourquoi une suspension ou une modification a été décidée.

## Fermeture du dossier

Le dossier peut être clos lorsque :

- la réalisation prévue est terminée ou officiellement arrêtée;
- les PR concernées sont identifiées;
- les validations sont enregistrées;
- les conditions sont levées ou transférées;
- les risques résiduels sont enregistrés;
- les obligations d’exploitation sont transférées;
- la décision de clôture est enregistrée.

La fermeture du dossier de réalisation ne ferme pas automatiquement l’initiative.

## Interdictions

Il est interdit de :

- commencer une réalisation significative sans initiative admise;
- présenter une date comme preuve de disponibilité;
- masquer un risque critique dans une condition;
- modifier rétroactivement les critères d’autorisation;
- considérer le déploiement comme une preuve de valeur;
- livrer sans propriétaire d’exploitation;
- rendre un changement irréversible sans justification et autorisation;
- supprimer l’historique d’une décision refusée ou suspendue.

## Résultat attendu

Ce cadre doit permettre à CityFlow de passer de l’intention à la réalisation sans perdre la cohérence entre problème, valeur, risque, dépendances, architecture, sécurité, exploitation et validation.
