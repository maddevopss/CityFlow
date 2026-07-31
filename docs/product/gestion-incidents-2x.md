# Gestion des incidents — CityFlow 2.x

## Objet

Ce cadre définit comment CityFlow 2.x détecte, qualifie, contient, résout et apprend des événements qui dégradent un service, compromettent des données ou causent un effet réel indésirable.

## Principes

1. La protection des personnes et la limitation du dommage priment sur la recherche immédiate d’une cause complète.
2. Un incident peut être technique, fonctionnel, lié aux données, à la sécurité, à l’accessibilité, à la géographie, à un fournisseur ou à une décision automatisée.
3. L’absence d’erreur technique n’exclut pas un incident réel.
4. Toute décision importante doit être horodatée et attribuée.
5. Les faits, hypothèses et interprétations doivent rester distincts.
6. Le rétablissement du service ne ferme pas automatiquement l’incident.
7. La communication doit être exacte, proportionnée et mise à jour.

## Identifiant et dossier

Chaque incident reçoit un identifiant stable :

`CF2X-INC-xxxx`

Le dossier contient :

- service et initiative liés;
- date et mode de détection;
- commandement de l’incident;
- gravité;
- portée connue et potentielle;
- territoires et populations touchés;
- données concernées;
- chronologie;
- faits confirmés;
- hypothèses;
- mesures de confinement;
- décisions;
- communications;
- preuve de rétablissement;
- risques et problèmes créés;
- obligations résiduelles.

## Gravité

### SEV-1 — Critique

Dommage majeur, fonction essentielle indisponible, compromission grave, large portée ou incapacité de contrôler l’effet.

### SEV-2 — Élevée

Dégradation importante, plusieurs organisations ou territoires touchés, données significativement affectées ou solution de contournement limitée.

### SEV-3 — Modérée

Impact circonscrit, solution de contournement disponible, effet réversible et capacité d’intervention normale.

### SEV-4 — Faible

Effet limité, sans conséquence importante immédiate, mais nécessitant une correction et une trace.

La gravité est révisable à la hausse ou à la baisse avec justification.

## Déclenchement

La gestion d’incident est activée lorsqu’un seuil critique est franchi ou lorsqu’un doute raisonnable existe concernant :

- la sécurité des personnes;
- la confidentialité ou l’intégrité des données;
- une fonction essentielle;
- une décision à fort impact;
- une disparité géographique importante;
- une erreur silencieuse étendue;
- une dépendance critique;
- une perte de contrôle opérationnel.

## Rôles

- commandant d’incident : coordonne et décide;
- responsable technique : diagnostic et actions techniques;
- responsable produit : effets fonctionnels et utilisateurs;
- responsable données ou sécurité : analyse spécialisée;
- responsable communication : messages internes et externes;
- secrétaire de chronologie : conservation des faits et décisions;
- autorité métier : décisions de maintien, limitation ou retrait.

Une même personne peut cumuler des rôles pour un incident faible, jamais au détriment d’une validation indépendante nécessaire.

## Cycle de réponse

1. détecter;
2. accuser réception;
3. qualifier;
4. contenir;
5. protéger les personnes et les données;
6. rétablir ou fournir un mode dégradé;
7. vérifier le rétablissement;
8. surveiller;
9. communiquer;
10. analyser;
11. décider des suites;
12. fermer.

## Confinement

Les options comprennent :

- désactivation ciblée;
- retour à une version antérieure;
- suspension d’une intégration;
- limitation territoriale;
- passage en lecture seule;
- traitement manuel contrôlé;
- blocage d’une décision automatisée;
- isolement de données;
- réduction de capacité ou de portée.

Toute mesure doit préciser ses effets secondaires et sa durée prévue.

## Communication

Chaque communication indique :

- ce qui est confirmé;
- ce qui reste inconnu;
- qui est touché;
- les actions en cours;
- les mesures à prendre;
- la prochaine mise à jour;
- le canal officiel.

Il est interdit de minimiser artificiellement un incident, de spéculer publiquement ou d’annoncer un rétablissement sans preuve.

## Données et sécurité

Un incident impliquant des données déclenche l’évaluation de :

- confidentialité;
- intégrité;
- disponibilité;
- provenance;
- étendue;
- durée d’exposition;
- obligations de notification;
- conservation de preuve;
- nécessité de rotation, révocation ou restauration.

## Fournisseurs

Le dossier conserve :

- heure de l’escalade;
- engagements contractuels;
- réponses reçues;
- dépendances touchées;
- solutions de repli;
- décisions prises indépendamment du fournisseur;
- preuve du rétablissement externe.

## Vérification du rétablissement

Le rétablissement exige :

- indicateurs revenus dans les limites;
- parcours essentiels testés;
- qualité des données vérifiée;
- erreurs silencieuses recherchées;
- populations et territoires critiques vérifiés;
- surveillance renforcée active;
- décision humaine explicite.

## Revue après incident

La revue est sans blâme personnel et examine :

- conditions initiales;
- chronologie;
- détection;
- décisions;
- barrières efficaces ou absentes;
- causes contributives;
- facteurs organisationnels;
- qualité des procédures;
- communication;
- effets réels;
- coûts;
- mesures correctives.

## Actions correctives

Chaque action possède :

- identifiant;
- propriétaire;
- échéance;
- priorité;
- preuve attendue;
- risque traité;
- état;
- règle d’escalade.

Les actions critiques non terminées empêchent la fermeture définitive, sauf acceptation formelle du risque résiduel.

## Liens avec les risques et problèmes

Un incident réalisé :

- met à jour le risque correspondant;
- peut créer un nouveau risque;
- crée un problème lorsque la cause nécessite une analyse durable;
- peut déclencher une réévaluation de valeur, validation, mise en service ou transfert;
- peut suspendre une initiative ou un déploiement.

## Fermeture

La fermeture exige :

- service rétabli ou retrait décidé;
- portée évaluée;
- communications finales effectuées;
- preuves conservées;
- risques mis à jour;
- problèmes et actions créés;
- obligations réglementaires traitées;
- propriétaire du suivi nommé;
- décision enregistrée.

## Interdictions

Il est interdit de :

- fermer sur la seule disparition d’une alerte;
- effacer une chronologie défavorable;
- confondre hypothèse et fait;
- retarder une protection pour préserver une date ou une image;
- modifier rétroactivement la gravité sans justification;
- cacher un impact territorial ou humain;
- attribuer une faute individuelle sans analyser le système;
- considérer le correctif immédiat comme apprentissage complet.

## Traçabilité

Le dossier relie les services, initiatives, décisions, risques, dépendances, validations, mises en service, observations, changements, problèmes, communications, actions correctives et PR concernées.
