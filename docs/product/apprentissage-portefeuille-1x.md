# Apprentissage du portefeuille 1.x

## Statut

Document de gouvernance produit applicable aux initiatives du portefeuille CityFlow 1.x.

## Intention

CityFlow ne doit pas seulement livrer des initiatives. Le portefeuille doit apprendre de ce qui fonctionne, de ce qui échoue, de ce qui coûte plus cher que prévu et de ce qui produit des effets inattendus.

L’apprentissage n’est pas une justification rétrospective. Il sert à améliorer les prochaines décisions sans modifier après coup le problème, les objectifs, les seuils ou les risques qui avaient été approuvés.

## Principes

1. Une initiative produit des résultats et des connaissances.
2. Une absence de preuve n’est pas une preuve de réussite.
3. Un résultat négatif documenté peut être utile au portefeuille.
4. Les objectifs initiaux restent visibles après toute révision.
5. Les changements de compréhension sont datés, expliqués et attribués.
6. Les barrières de sécurité, d’isolation, d’intégrité et de conformité ne sont jamais compensées par un bénéfice global.
7. Une leçon n’est considérée acquise que lorsqu’elle modifie une décision, une pratique, un contrôle ou une hypothèse.

## Portée

Ce processus s’applique :

- aux initiatives confirmées;
- aux initiatives fermées avec suivi;
- aux initiatives réduites;
- aux initiatives suspendues;
- aux initiatives retirées;
- aux initiatives arrêtées;
- aux incidents ou régressions liés à une initiative;
- aux hypothèses invalidées ou insuffisamment prouvées.

## Sources d’apprentissage

Les sources admissibles comprennent :

- les mesures de résultats;
- les observations des utilisateurs;
- les demandes de soutien;
- les incidents et quasi-incidents;
- les écarts de coûts ou de capacité;
- les résultats de tests;
- les journaux d’exploitation;
- les difficultés d’adoption;
- les contournements manuels;
- les retours des équipes responsables;
- les effets sur la sécurité, l’isolation ou l’intégrité;
- les dépendances devenues fragiles;
- les décisions de fermeture ou de retrait.

Une opinion seule peut déclencher une vérification, mais elle ne devient pas automatiquement une conclusion.

## Fiche d’apprentissage

Chaque initiative fermée, retirée ou arrêtée doit produire une fiche d’apprentissage contenant au minimum :

- identifiant stable de l’initiative;
- propriétaire de la fiche;
- date de rédaction;
- problème initial;
- hypothèses initiales;
- objectifs et seuils initiaux;
- résultat observé;
- niveau de confiance;
- preuves utilisées;
- limites des preuves;
- écarts entre prévu et observé;
- effets inattendus;
- risques apparus ou disparus;
- coût réel comparé au coût prévu;
- leçons proposées;
- décisions recommandées;
- éléments à ne pas généraliser;
- date de la prochaine vérification, si nécessaire.

## Catégories de leçons

Les leçons doivent être classées pour éviter les conclusions vagues.

### Utilisateurs

- problème réel mieux compris;
- besoin surestimé ou sous-estimé;
- usage différent de celui prévu;
- friction ou charge cognitive inattendue;
- population touchée différente;
- avantage ou nuisance non anticipé.

### Produit

- proposition utile;
- proposition inutile;
- portée trop large ou trop étroite;
- séquence de livraison inadéquate;
- dépendance fonctionnelle manquante;
- règle métier à revoir.

### Exploitation

- coût de soutien supérieur au prévu;
- processus manuel persistant;
- observabilité insuffisante;
- responsabilité mal attribuée;
- procédure de reprise inadéquate;
- capacité ou disponibilité insuffisante.

### Technique

- architecture adaptée ou fragile;
- dette introduite;
- dépendance externe risquée;
- automatisation fiable ou trompeuse;
- test insuffisant;
- réversibilité réelle ou théorique.

### Gouvernance

- preuve insuffisante au moment de l’admission;
- seuil mal défini;
- décision trop tardive;
- conflit de responsabilité;
- coût ou risque sous-estimé;
- mécanisme de contrôle inefficace.

## Niveau de confiance

Chaque leçon reçoit un niveau de confiance :

- **faible** : signal initial, preuve limitée ou interprétation incertaine;
- **moyen** : plusieurs observations cohérentes, mais contexte encore limité;
- **élevé** : preuves convergentes, répétables et applicables au contexte décrit.

Le niveau de confiance doit expliquer :

- la quantité de preuves;
- leur qualité;
- leur diversité;
- leur représentativité;
- les biais connus;
- les conditions où la leçon pourrait ne plus être valide.

## Interdiction de réécriture rétrospective

Il est interdit de :

- remplacer les objectifs initiaux par les résultats obtenus;
- modifier rétroactivement les seuils de réussite;
- retirer une hypothèse invalidée du dossier;
- présenter un retrait comme une réussite sans préciser les motifs;
- cacher un coût ou un risque derrière une note globale;
- attribuer un résultat à l’initiative sans preuve raisonnable;
- généraliser une observation locale à tout le portefeuille sans justification.

Toute correction documentaire après décision doit conserver l’ancienne valeur, la nouvelle valeur, la date, l’auteur et la raison.

## Transformation des leçons en actions

Une leçon doit conduire à au moins une décision explicite parmi les suivantes :

- conserver la pratique actuelle;
- modifier un critère d’admission;
- modifier une mesure ou un seuil futur;
- ajouter un contrôle;
- renforcer un test;
- réduire une portée;
- retirer une dépendance;
- modifier une procédure d’exploitation;
- créer une nouvelle initiative;
- interdire temporairement une approche;
- documenter une exception;
- ne rien changer, avec justification.

Chaque action comporte :

- un propriétaire;
- une échéance;
- une portée;
- une preuve de réalisation attendue;
- un lien vers la leçon d’origine.

## Revue d’apprentissage

### Revue mensuelle

La revue mensuelle du portefeuille examine :

- les nouvelles fiches;
- les leçons à confiance élevée;
- les leçons contradictoires;
- les actions en retard;
- les hypothèses répétées sans preuve;
- les risques récurrents;
- les coûts systématiquement sous-estimés;
- les décisions qui doivent modifier la feuille de route.

### Revue trimestrielle

La revue trimestrielle cherche les tendances transversales :

- types d’initiatives qui réussissent ou échouent;
- causes de retard récurrentes;
- écarts entre valeur attendue et valeur réelle;
- dette opérationnelle accumulée;
- contrôles inefficaces;
- dépendances trop concentrées;
- apprentissages restés sans effet.

## Mise à jour de la feuille de route

Une leçon ne modifie pas silencieusement la feuille de route.

Toute mise à jour doit préciser :

- la décision modifiée;
- la preuve ayant motivé le changement;
- les initiatives touchées;
- les conséquences sur coûts, délais et risques;
- les éléments qui restent inchangés;
- l’autorité ayant approuvé le changement;
- la date d’entrée en vigueur.

Les versions précédentes restent consultables.

## Leçons contradictoires

Lorsque deux initiatives produisent des conclusions différentes :

1. conserver les deux conclusions;
2. comparer les contextes;
3. identifier les variables différentes;
4. réduire la portée de chaque leçon;
5. demander une nouvelle vérification si la décision demeure importante;
6. éviter de choisir seulement la conclusion la plus pratique.

## Apprentissage après incident

Une initiative liée à un incident doit documenter :

- ce qui s’est produit;
- pourquoi les contrôles n’ont pas suffi;
- les signaux disponibles avant l’incident;
- les décisions qui ont retardé la détection ou la réponse;
- les effets sur les utilisateurs et l’exploitation;
- les mesures correctives;
- les vérifications empêchant une répétition silencieuse.

L’analyse cherche les conditions du système, pas un coupable commode.

## Conservation et traçabilité

Les fiches, preuves et décisions doivent être :

- liées au registre des initiatives;
- versionnées;
- datées;
- attribuées;
- accessibles aux responsables concernés;
- conservées selon les exigences de sécurité et de conformité;
- protégées contre la modification silencieuse.

Les données sensibles ne doivent pas être copiées inutilement dans les fiches. Les références contrôlées sont préférées lorsque possible.

## Critères de fermeture de l’apprentissage

Le travail d’apprentissage d’une initiative peut être considéré terminé lorsque :

- la fiche est complète;
- les preuves sont référencées;
- les limites sont explicites;
- les décisions sont enregistrées;
- les actions ont un propriétaire;
- la feuille de route a été mise à jour lorsque nécessaire;
- les contradictions importantes sont traitées;
- aucune barrière critique n’est dissimulée;
- la prochaine vérification est planifiée lorsqu’un doute demeure.

## Indicateurs du processus

Le portefeuille peut suivre :

- proportion d’initiatives avec fiche complète;
- délai entre fermeture et fiche d’apprentissage;
- proportion de leçons transformées en action;
- actions d’apprentissage en retard;
- hypothèses répétées malgré leur invalidation;
- erreurs de coût récurrentes;
- incidents liés à une leçon non appliquée;
- décisions de feuille de route appuyées par des preuves.

Ces indicateurs évaluent la discipline du processus. Ils ne prouvent pas à eux seuls la qualité des décisions.

## Règle finale

CityFlow apprend seulement lorsque les preuves changent une décision ou une pratique. Accumuler des comptes rendus sans conséquence ne constitue pas un apprentissage du portefeuille.
