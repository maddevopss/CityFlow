# Gestion des risques CityFlow 2.x

## 1. Objet

Ce document définit la manière dont CityFlow 2.x identifie, décrit, évalue, traite, accepte, surveille et ferme les risques liés aux initiatives, aux décisions, aux réalisations et à l’exploitation.

Il complète :

- `docs/product/roadmap-2x.md`;
- `docs/product/admission-initiatives-2x.md`;
- `docs/product/registre-initiatives-2x.md`;
- `docs/product/gouvernance-decisions-2x.md`.

Aucune initiative 2.x ne peut être admise, réalisée ou exploitée sans une compréhension explicite de ses risques significatifs.

## 2. Principes

### 2.1 Un risque n’est pas une justification abstraite

Un risque doit décrire :

- un événement ou une condition possible;
- une cause identifiable;
- une conséquence concrète;
- une population, un service, une donnée ou une capacité exposée;
- les preuves disponibles;
- l’incertitude restante.

### 2.2 Les barrières critiques ne sont pas compensables

Une valeur attendue élevée, un délai politique, un coût déjà engagé ou une pression opérationnelle ne peuvent compenser une barrière critique non satisfaite.

Une initiative doit être suspendue, refusée ou limitée lorsque la barrière demeure ouverte.

### 2.3 Le risque résiduel doit être assumé explicitement

Une mesure de réduction ne supprime pas automatiquement le risque.

Après traitement, le risque résiduel doit être :

- recalculé;
- documenté;
- accepté par l’autorité compétente;
- assorti d’une date de révision;
- lié à des indicateurs observables.

### 2.4 L’absence de preuve n’est pas une preuve d’absence

Lorsque les données sont insuffisantes, le niveau de confiance doit être déclaré.

L’incertitude peut justifier :

- une expérimentation limitée;
- une collecte de preuves supplémentaire;
- une portée réduite;
- une décision conditionnelle;
- un refus temporaire.

## 3. Identifiants et registre

Chaque risque reçoit un identifiant stable :

`CF2X-RISK-0001`

L’identifiant ne change jamais, même lorsque le risque est reclassé, transféré, remplacé ou fermé.

Le registre des risques constitue la source de vérité. Il doit conserver :

- la version courante;
- l’historique des changements;
- les décisions d’acceptation;
- les mesures prévues et réalisées;
- les preuves de fermeture;
- les liens vers les initiatives et décisions concernées.

## 4. Catégories de risques

Chaque risque peut appartenir à une ou plusieurs catégories.

### 4.1 Produit et usage

- mauvaise compréhension du besoin;
- usage non prévu;
- adoption insuffisante;
- exclusion d’un groupe d’utilisateurs;
- effets négatifs sur les pratiques de travail;
- dépendance excessive à une fonctionnalité.

### 4.2 Données et confidentialité

- collecte excessive;
- qualité insuffisante;
- perte d’intégrité;
- exposition non autorisée;
- conservation injustifiée;
- réidentification;
- utilisation secondaire non autorisée.

### 4.3 Sécurité

- accès illégitime;
- élévation de privilège;
- abus d’API;
- vulnérabilité de dépendance;
- compromission de secrets;
- déni de service;
- défaut de journalisation ou de détection.

### 4.4 Géographie et territoire

- géocodage erroné;
- limites territoriales incorrectes;
- données cartographiques désuètes;
- confusion entre territoire administratif et territoire opérationnel;
- décisions fondées sur une précision géographique insuffisante.

### 4.5 Exploitation

- service non surveillé;
- absence de procédure de retour arrière;
- dépendance à une seule personne;
- capacité insuffisante;
- support non défini;
- récupération impossible dans les délais attendus.

### 4.6 Technique et architecture

- complexité excessive;
- verrouillage technologique;
- dette structurelle;
- incompatibilité;
- faible testabilité;
- performance non maîtrisée;
- impossibilité de retrait propre.

### 4.7 Fournisseurs et dépendances externes

- indisponibilité;
- modification contractuelle;
- changement d’API;
- localisation des données;
- fin de service;
- dépendance financière ou opérationnelle excessive.

### 4.8 Juridique, réglementaire et contractuel

- obligation non respectée;
- base légale insuffisante;
- engagement contractuel incompatible;
- conservation ou communication non conforme;
- absence de consentement ou d’autorité appropriée.

### 4.9 Accessibilité et équité

- obstacle d’accès;
- discrimination directe ou indirecte;
- dépendance à une capacité sensorielle, motrice ou cognitive;
- résultat inégal selon le territoire ou le profil;
- absence d’alternative raisonnable.

### 4.10 Réputation et confiance publique

- perte de confiance;
- communication trompeuse;
- promesse non tenue;
- manque de transparence;
- incapacité à expliquer une décision ou un résultat.

## 5. Fiche obligatoire d’un risque

Chaque fiche doit contenir au minimum :

### 5.1 Identification

- identifiant;
- titre court;
- catégorie ou catégories;
- date de création;
- auteur;
- propriétaire;
- initiative liée;
- décision liée;
- services ou composants concernés.

### 5.2 Formulation

Le risque doit être formulé ainsi :

> En raison de [cause], il est possible que [événement], ce qui pourrait entraîner [conséquence] pour [population, service, donnée ou capacité].

### 5.3 Évaluation initiale

- probabilité;
- impact;
- exposition;
- vitesse d’apparition;
- détectabilité;
- niveau de confiance;
- niveau initial.

### 5.4 Traitement

- stratégie choisie;
- mesures;
- responsable de chaque mesure;
- échéance;
- preuve attendue;
- dépendances;
- coût estimé;
- indicateur de suivi.

### 5.5 Évaluation résiduelle

- probabilité résiduelle;
- impact résiduel;
- niveau résiduel;
- incertitude restante;
- autorité d’acceptation;
- date d’acceptation;
- prochaine révision.

### 5.6 Fermeture

- condition de fermeture;
- preuve observée;
- date;
- personne ayant validé;
- obligations résiduelles;
- risque de réapparition.

## 6. Échelles d’évaluation

### 6.1 Probabilité

1. Rare — situation exceptionnelle et peu plausible.
2. Peu probable — possible, mais peu attendue.
3. Possible — peut survenir dans des conditions réalistes.
4. Probable — devrait survenir dans plusieurs scénarios normaux.
5. Presque certaine — attendue sans mesure supplémentaire.

### 6.2 Impact

1. Mineur — gêne limitée, réversible sans effort important.
2. Modéré — dégradation locale ou correction requise.
3. Important — interruption significative, exposition ou perte notable.
4. Majeur — atteinte grave, durable ou touchant plusieurs services.
5. Critique — danger, violation majeure, perte systémique ou impossibilité d’assurer le service essentiel.

### 6.3 Vitesse d’apparition

- lente;
- progressive;
- rapide;
- immédiate.

Un risque rapide ou immédiat exige des mécanismes de détection et de réaction proportionnés.

### 6.4 Détectabilité

- élevée : le risque est normalement détecté avant l’impact;
- moyenne : détection possible, mais non garantie;
- faible : l’impact peut précéder la détection;
- inconnue : aucun mécanisme démontré.

### 6.5 Confiance

- forte : preuves directes et récentes;
- moyenne : preuves partielles ou analogues;
- faible : hypothèses dominantes;
- inconnue : information insuffisante.

## 7. Niveaux de risque

Le niveau n’est pas une simple multiplication mécanique. La probabilité et l’impact orientent l’analyse, mais les barrières critiques, la vitesse, la détectabilité et l’incertitude peuvent relever le classement.

### Faible

Traitement local possible. Suivi dans le cycle normal.

### Modéré

Plan de traitement obligatoire et revue régulière.

### Élevé

Décision explicite obligatoire avant réalisation ou poursuite.

### Critique

Barrière de passage. La réalisation, le déploiement ou l’exploitation sont interdits tant que le risque n’est pas réduit, éliminé, transféré de manière démontrable ou accepté par l’autorité critique compétente lorsque l’acceptation est permise.

Certains risques critiques ne sont jamais acceptables, notamment lorsqu’ils impliquent :

- une atteinte prévisible à la sécurité des personnes;
- une violation manifeste d’une obligation légale;
- une exposition incontrôlée de données sensibles;
- l’absence totale de retour arrière pour un changement irréversible;
- une autorité automatisée non autorisée sur une décision humaine critique.

## 8. Stratégies de traitement

### 8.1 Éviter

Modifier ou abandonner l’initiative pour supprimer la source du risque.

### 8.2 Réduire

Diminuer la probabilité, l’impact, la vitesse ou l’exposition.

### 8.3 Transférer ou partager

Attribuer une partie du traitement à un tiers sans transférer la responsabilité finale de CityFlow.

### 8.4 Accepter

Conserver le risque résiduel après décision explicite et documentée.

### 8.5 Expérimenter sous contrôle

Limiter la portée, la durée, les données et les utilisateurs afin de produire des preuves avant une décision plus large.

## 9. Autorité d’acceptation

- risque faible : propriétaire de l’initiative;
- risque modéré : responsable produit ou exploitation compétent;
- risque élevé : décideur de niveau correspondant selon la gouvernance 2.x;
- risque critique : autorité critique avec validation indépendante.

Le propriétaire du risque ne peut pas accepter seul un risque élevé ou critique qu’il est également chargé de traiter.

## 10. États du risque

- Identifié;
- En analyse;
- Traitement planifié;
- Traitement en cours;
- En observation;
- Accepté;
- Transféré;
- Suspendu;
- Réalisé;
- Fermé;
- Réouvert.

Un risque n’est pas fermé simplement parce que l’initiative est terminée.

## 11. Déclencheurs de réévaluation

Une réévaluation est obligatoire lorsque :

- la portée change;
- une nouvelle population est touchée;
- une source de données est ajoutée;
- le territoire change;
- une dépendance critique évolue;
- une mesure échoue;
- un incident survient;
- un indicateur dépasse son seuil;
- une obligation légale ou contractuelle change;
- la preuve devient désuète;
- une initiative passe vers la réalisation, le déploiement ou l’exploitation;
- une décision est révisée, suspendue ou remplacée.

## 12. Lien avec les initiatives et les PR

Chaque initiative admise doit référencer :

- ses risques ouverts;
- ses risques acceptés;
- ses barrières critiques;
- ses mesures obligatoires avant réalisation;
- ses mesures obligatoires avant déploiement;
- ses risques résiduels en exploitation.

Toute PR de réalisation qui modifie le profil de risque doit :

- nommer les risques concernés;
- expliquer l’effet attendu;
- fournir les tests ou preuves pertinents;
- signaler tout nouveau risque;
- mettre à jour les conditions de retour arrière.

## 13. Surveillance

Chaque risque modéré, élevé ou critique doit disposer d’au moins un indicateur observable.

L’indicateur précise :

- la source;
- la fréquence;
- le seuil d’avertissement;
- le seuil d’arrêt;
- le responsable;
- l’action attendue.

Un indicateur sans action associée ne constitue pas un contrôle suffisant.

## 14. Risques émergents

Les signaux faibles doivent être inscrits même lorsqu’ils ne permettent pas encore une évaluation complète.

Ils peuvent provenir :

- d’incidents;
- de plaintes;
- d’anomalies;
- de changements de comportement;
- de résultats de tests;
- de fournisseurs;
- de modifications réglementaires;
- d’observations terrain.

Un risque émergent doit recevoir un propriétaire et une date limite d’analyse.

## 15. Incidents et risques réalisés

Lorsqu’un risque se matérialise :

- son état devient `Réalisé`;
- l’incident correspondant est référencé;
- les mesures prévues sont comparées aux actions réellement prises;
- l’évaluation est mise à jour;
- les risques connexes sont revus;
- une décision de poursuite, suspension ou retrait est prise si nécessaire.

## 16. Fermeture

Un risque peut être fermé seulement lorsque :

- la source a disparu durablement;
- l’activité exposée a été retirée;
- les mesures ont démontré que le risque n’est plus significatif;
- les obligations résiduelles sont transférées et suivies ailleurs;
- une preuve de fermeture existe.

La fermeture ne supprime jamais l’historique.

## 17. Revue périodique

- risques critiques : au moins à chaque jalon et à fréquence rapprochée en exploitation;
- risques élevés : à chaque changement majeur et selon une cadence définie;
- risques modérés : dans les revues normales de l’initiative;
- risques faibles : lors des jalons pertinents.

Les risques sans révision à l’échéance deviennent non conformes et bloquent les passages nécessitant une évaluation à jour.

## 18. Modèle synthétique de registre

| Identifiant | Titre | Initiative | Niveau initial | Niveau résiduel | État | Propriétaire | Prochaine revue |
|---|---|---|---|---|---|---|---|
| CF2X-RISK-0001 | Exemple à remplacer | CF2X-INIT-0001 | À évaluer | À évaluer | Identifié | À nommer | À définir |

Cette ligne est un modèle et ne constitue pas une acceptation réelle.

## 19. Contrôle de conformité

Une initiative n’est pas conforme lorsque :

- un risque significatif n’a pas de propriétaire;
- une barrière critique est ouverte;
- un risque élevé ou critique n’a pas de décision d’acceptation valide;
- une mesure obligatoire est échue sans preuve;
- une révision est dépassée;
- le risque résiduel n’est pas documenté;
- un changement important n’a pas déclenché de réévaluation;
- l’historique a été supprimé ou réécrit.

## 20. Résultat attendu

La gestion des risques 2.x doit permettre de savoir, à tout moment :

- ce qui peut mal tourner;
- pourquoi;
- qui ou quoi serait touché;
- quelles preuves soutiennent l’évaluation;
- quelles mesures sont engagées;
- qui accepte le risque résiduel;
- quels seuils imposent une réaction;
- dans quelles conditions l’initiative doit être suspendue, limitée ou retirée.
