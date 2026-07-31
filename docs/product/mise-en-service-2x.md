---
Projet: CityFlow
Document: Mise en service 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Mise en service CityFlow 2.x

## 1. Objet

Ce document définit les conditions permettant à un changement CityFlow 2.x validé d’être introduit dans un environnement réel, avec une exposition maîtrisée, une capacité de retour vérifiée et une surveillance suffisante pour protéger les personnes, les données, l’exploitation et la confiance publique.

La mise en service n’est pas une formalité technique. Elle constitue une décision opérationnelle distincte de la livraison du code et de la validation préalable.

## 2. Principes

1. Aucun changement ne passe en service sans propriétaire opérationnel identifié.
2. Une validation réussie ne remplace pas une décision explicite de mise en service.
3. Le niveau de contrôle est proportionnel au risque et à l’étendue de l’exposition.
4. La capacité de retour, de désactivation ou de confinement est vérifiée avant l’ouverture.
5. Les seuils d’arrêt sont définis avant le début de l’exposition.
6. Toute généralisation est précédée d’une observation suffisante.
7. Les signaux défavorables ne peuvent être masqués, reclassés ou différés pour préserver un calendrier.
8. Une automatisation peut exécuter une décision, mais ne devient jamais l’autorité finale.

## 3. Identifiant stable

Chaque dossier de mise en service reçoit un identifiant immuable :

`CF2X-RELEASE-xxxx`

Cet identifiant doit être relié à :

- l’initiative concernée;
- la décision autorisant la réalisation;
- le dossier de réalisation;
- le dossier de validation;
- les risques ouverts;
- les dépendances actives;
- les PR et versions livrées;
- les incidents ou retours éventuels;
- la décision finale de stabilisation ou de retrait.

## 4. États du dossier

Un dossier peut être :

- `préparé`;
- `en examen`;
- `autorisé`;
- `autorisé sous conditions`;
- `planifié`;
- `en exposition limitée`;
- `en généralisation`;
- `stabilisé`;
- `suspendu`;
- `retourné`;
- `retiré`;
- `fermé`.

Toute transition doit être datée, motivée et attribuée.

## 5. Contenu minimal du dossier

Le dossier doit contenir :

- identifiant de mise en service;
- portée exacte du changement;
- version, commit ou artefact concerné;
- environnements visés;
- population ou territoire exposé;
- propriétaire produit;
- propriétaire technique;
- responsable opérationnel;
- autorité de décision;
- niveau de risque;
- résumé de validation;
- écarts et réserves;
- dépendances encore actives;
- plan de déploiement;
- plan de surveillance;
- seuils d’alerte et d’arrêt;
- plan de retour ou de désactivation;
- fenêtre prévue;
- stratégie de communication;
- décision finale et preuves.

## 6. Conditions d’entrée

Une mise en service ne peut être examinée que si :

- le dossier de réalisation est autorisé;
- la validation applicable est terminée;
- aucun écart critique n’est ouvert;
- les risques résiduels sont acceptés par l’autorité compétente;
- les dépendances critiques sont disponibles et prouvées;
- l’exploitation possède les procédures nécessaires;
- la surveillance est prête;
- les seuils de décision sont définis;
- le retour ou la désactivation a été vérifié;
- les personnes responsables sont disponibles pendant la fenêtre.

Une date de livraison, un test vert ou une approbation informelle ne suffit pas.

## 7. Niveaux de mise en service

### 7.1 Courante

Applicable aux changements de faible exposition, réversibles et bien couverts par les mécanismes existants.

Exigences minimales :

- validation complète;
- surveillance standard;
- retour documenté;
- responsable disponible;
- observation après ouverture.

### 7.2 Renforcée

Applicable lorsqu’un changement touche des données importantes, plusieurs services, une zone géographique significative ou une capacité opérationnelle sensible.

Exigences supplémentaires :

- exposition progressive;
- validation indépendante;
- surveillance dédiée;
- répétition du retour;
- décision formelle à chaque palier;
- communication aux équipes affectées.

### 7.3 Critique

Applicable aux changements pouvant affecter la sécurité, l’intégrité des données, la continuité d’un service essentiel, des décisions publiques ou un grand nombre de personnes.

Exigences supplémentaires :

- autorité de décision distincte de l’équipe de réalisation;
- plan de confinement immédiat;
- présence opérationnelle renforcée;
- preuve d’observabilité complète;
- seuils d’arrêt non négociables;
- généralisation interdite sans décision humaine explicite;
- revue postérieure obligatoire.

## 8. Stratégies d’exposition

La stratégie doit être choisie selon le risque, la réversibilité et la capacité d’observation.

Les stratégies admises comprennent :

- activation interne;
- environnement parallèle;
- fonctionnalité désactivée par défaut;
- activation par territoire;
- activation par organisation;
- activation par groupe contrôlé;
- pourcentage progressif;
- fonctionnement en lecture seule;
- fonctionnement en observation sans effet;
- remplacement progressif d’un ancien chemin;
- bascule complète lorsque le risque le justifie.

Une bascule complète immédiate doit être explicitement justifiée.

## 9. Paliers de généralisation

Chaque palier doit préciser :

- population exposée;
- durée minimale d’observation;
- signaux attendus;
- seuils de protection;
- critères de passage;
- critères de maintien;
- critères de retour;
- autorité autorisant le palier suivant.

Le passage au palier suivant n’est jamais automatique pour un changement renforcé ou critique.

## 10. Fenêtre de mise en service

La fenêtre doit tenir compte :

- des périodes de forte utilisation;
- des événements municipaux ou territoriaux;
- des périodes de maintenance externes;
- de la disponibilité des équipes;
- du temps nécessaire pour observer;
- de la capacité de retour avant la fin de la présence opérationnelle;
- des dépendances fournisseurs;
- des obligations de communication.

Un changement ne doit pas être ouvert lorsqu’il ne reste pas assez de temps pour le surveiller et revenir de manière sûre.

## 11. Plan de retour

Le plan doit indiquer :

- le déclencheur;
- l’autorité pouvant ordonner le retour;
- les commandes ou procédures;
- le délai estimé;
- les effets sur les données;
- les opérations compensatoires;
- les validations après retour;
- la communication nécessaire;
- les limites connues.

Le retour doit être testé lorsque cela est techniquement possible.

Lorsque le retour complet est impossible, un plan de désactivation, confinement ou réduction d’impact est obligatoire.

## 12. Protection des données

Avant l’ouverture, le dossier doit confirmer :

- la compatibilité des schémas;
- les règles de migration;
- les sauvegardes nécessaires;
- les mécanismes de reprise;
- la conservation des traces;
- la séparation des organisations ou territoires;
- la minimisation des données;
- les contrôles d’accès;
- la capacité à corriger ou compenser une écriture erronée.

Une migration irréversible exige une autorisation renforcée et une preuve de restauration ou de compensation.

## 13. Surveillance initiale

La surveillance doit couvrir au minimum :

- disponibilité;
- erreurs;
- latence;
- saturation;
- intégrité des données;
- sécurité;
- activité inhabituelle;
- disparités géographiques;
- impacts sur les personnes;
- charge opérationnelle;
- dépendances externes;
- indicateurs de valeur et de protection applicables.

Chaque signal doit avoir un propriétaire et une action associée.

## 14. Seuils

Trois niveaux sont requis :

### 14.1 Avertissement

Le changement reste actif, mais une analyse immédiate est exigée.

### 14.2 Gel

La généralisation s’arrête. Aucune nouvelle population n’est exposée avant décision.

### 14.3 Arrêt ou retour

Le changement est désactivé, confiné ou retourné selon le plan approuvé.

Les seuils doivent être définis avant l’exposition et ne peuvent être modifiés rétroactivement pour éviter une décision défavorable.

## 15. Événements bloquants

La mise en service est bloquée notamment lorsque :

- un écart critique est ouvert;
- le responsable opérationnel est absent;
- la surveillance n’est pas fonctionnelle;
- le retour n’est pas disponible;
- une dépendance critique est incertaine;
- les sauvegardes requises ne sont pas vérifiées;
- les règles d’accès sont inconnues;
- les seuils ne sont pas définis;
- la portée réelle dépasse la portée validée;
- un incident actif compromet la capacité d’observation ou de réaction.

## 16. Communication

Le plan de communication doit préciser :

- les équipes informées avant l’ouverture;
- les personnes responsables pendant la fenêtre;
- les canaux de signalement;
- les messages aux organisations ou utilisateurs concernés;
- les changements visibles;
- les limitations temporaires;
- les procédures de soutien;
- les communications en cas de retour ou d’incident.

La communication doit utiliser un langage concret et compréhensible avant tout terme technique.

## 17. Responsabilités

### Propriétaire produit

Confirme la portée, les résultats attendus et les populations concernées.

### Propriétaire technique

Confirme l’artefact, les procédures, les dépendances et la capacité de retour.

### Responsable opérationnel

Confirme la surveillance, les procédures, la disponibilité des équipes et la réponse aux alertes.

### Autorité de mise en service

Décide d’autoriser, limiter, suspendre, retourner ou retirer.

### Validation indépendante

Examine les éléments critiques sans dépendre de l’équipe ayant réalisé le changement.

## 18. Décisions possibles

L’autorité peut décider :

- autorisation complète;
- autorisation sous conditions;
- exposition limitée;
- report;
- suspension;
- retour;
- retrait;
- généralisation;
- stabilisation.

Une décision sous conditions doit préciser les conditions, l’échéance, le responsable et la conséquence d’un non-respect.

## 19. Mise en service urgente

Une procédure urgente peut être utilisée pour réduire un incident ou une menace active.

Elle exige :

- une justification explicite;
- une portée minimale;
- une autorité humaine identifiée;
- un plan de retour ou de confinement;
- une surveillance immédiate;
- une durée limitée;
- une revue après action;
- la régularisation documentaire dès que la situation est stabilisée.

L’urgence ne supprime pas les barrières critiques.

## 20. Stabilisation

Un changement peut être déclaré stabilisé lorsque :

- la période minimale d’observation est terminée;
- les seuils de protection sont respectés;
- aucun incident significatif non résolu n’est lié à l’ouverture;
- les écarts acceptés sont suivis;
- les procédures opérationnelles sont à jour;
- les propriétaires ont confirmé la capacité courante;
- une décision de stabilisation est enregistrée.

La stabilisation ne constitue pas encore une preuve de valeur à long terme.

## 21. Retour d’expérience

Une revue est obligatoire pour :

- toute mise en service critique;
- tout retour;
- toute suspension;
- tout incident significatif;
- tout dépassement d’un seuil de protection;
- toute dépendance ayant échoué;
- toute généralisation ayant produit un effet inattendu.

La revue doit distinguer :

- ce qui était prévu;
- ce qui a été observé;
- ce qui a permis la détection;
- ce qui a ralenti la réaction;
- les corrections immédiates;
- les apprentissages réutilisables;
- les risques ou décisions à mettre à jour.

## 22. Fermeture

Le dossier peut être fermé lorsque :

- la décision finale est enregistrée;
- les preuves sont conservées;
- les incidents et écarts sont reliés;
- les obligations résiduelles ont un propriétaire;
- les procédures sont intégrées à l’exploitation courante;
- le suivi de valeur est transféré au mécanisme approprié.

La fermeture n’efface ni les réserves, ni les retours, ni les décisions défavorables.

## 23. Matrice minimale de traçabilité

| Élément | Référence obligatoire |
|---|---|
| Initiative | `CF2X-INIT-xxxx` |
| Décision | `CF2X-DEC-xxxx` |
| Risque | `CF2X-RISK-xxxx` |
| Dépendance | `CF2X-DEP-xxxx` |
| Résultat de valeur | `CF2X-VALUE-xxxx` |
| Dossier de réalisation | `CF2X-DELIVERY-xxxx` |
| Validation | `CF2X-VAL-xxxx` |
| Mise en service | `CF2X-RELEASE-xxxx` |
| PR ou version | lien immuable |
| Incident | identifiant du registre d’incidents |

## 24. Règles non négociables

- aucune mise en service critique sans retour, confinement ou justification approuvée;
- aucun élargissement lorsque les seuils de protection sont dépassés;
- aucune modification rétroactive des seuils;
- aucune dépendance critique présumée disponible sans preuve;
- aucune fermeture sans propriétaire pour les obligations résiduelles;
- aucune automatisation comme autorité finale;
- aucun calendrier ne prime sur une barrière critique.

## 25. Critères de conformité du dossier

Un dossier est conforme lorsqu’il permet à une personne indépendante de répondre clairement :

1. Qu’est-ce qui est mis en service?
2. Qui et quoi seront exposés?
3. Pourquoi l’ouverture est-elle autorisée?
4. Quels risques restent présents?
5. Quels signaux seront observés?
6. Quels seuils déclencheront une action?
7. Comment le changement sera-t-il désactivé ou retourné?
8. Qui peut prendre chaque décision?
9. Quelle preuve permettra de déclarer la stabilisation?
10. Où sont conservées les décisions et les preuves?

Si une de ces réponses manque pour un changement renforcé ou critique, la mise en service reste bloquée.
