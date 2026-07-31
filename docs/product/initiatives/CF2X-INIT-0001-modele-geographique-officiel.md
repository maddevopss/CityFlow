# CF2X-INIT-0001 — Modèle géographique officiel

## État de la fiche

| Champ | Valeur |
| --- | --- |
| Identifiant | `CF2X-INIT-0001` |
| Titre | Modèle géographique officiel |
| État | En évaluation |
| Version | 1.0 |
| Responsable | À désigner avant admission |
| Décideur | Autorité produit CityFlow à désigner |
| Date de création | 2026-07-31 |
| Dernière révision | 2026-07-31 |
| Prochaine revue | Après production des preuves géographiques minimales |

## Problème

CityFlow ne possède pas encore un modèle géographique officiel, versionné et suffisamment précis pour représenter de manière uniforme une entrave, sa portée réelle, sa période d’effet et les voies touchées.

Sans ce socle, deux municipalités, deux intégrations ou deux versions du service peuvent interpréter différemment le même événement. Cette ambiguïté peut produire des conflits de données, des publications inexactes, des validations impossibles à reproduire et des décisions opérationnelles non fiables.

## Population touchée

- équipes municipales qui créent, valident et publient les entraves;
- entrepreneurs qui confirment les travaux;
- équipes d’exploitation et de soutien;
- citoyens et partenaires qui consomment l’information routière;
- systèmes tiers qui reçoivent les flux géographiques.

## Situation de référence

Le dépôt contient un prototype backend et une feuille de route qui prévoit l’introduction de PostGIS et de la validation géographique, mais aucun contrat géographique officiel 2.x n’est encore admis.

La situation de référence doit être complétée par :

- l’inventaire des objets géographiques déjà présents dans le schéma;
- les formats actuellement acceptés par les routes et services;
- les cas d’entraves impossibles ou ambiguës à représenter;
- les règles municipales ou partenaires déjà connues;
- les erreurs observées dans les données de développement et les tests.

## Résultat attendu

CityFlow possède un contrat géographique unique, versionné et vérifiable qui permet :

- de représenter les entraves ponctuelles, linéaires et surfaciques;
- d’indiquer les voies, directions, segments et intersections concernés;
- de distinguer géométrie déclarée, géométrie validée et géométrie publiée;
- de vérifier la validité structurelle et territoriale;
- de conserver la provenance, la version et les corrections;
- d’empêcher la publication d’une géométrie invalide ou hors territoire autorisé;
- de produire des flux compatibles avec les intégrations approuvées.

## Mesures proposées

| Mesure | Cible initiale | Seuil d’arrêt ou de refus |
| --- | --- | --- |
| Géométries structurellement valides | 100 % des objets publiables | Toute géométrie invalide pouvant atteindre la publication |
| Objets reliés à une municipalité autorisée | 100 % | Toute possibilité de publier hors du territoire autorisé |
| Cas de test représentatifs | Parcours ponctuel, ligne, surface, intersection, multi-segment et cas invalide | Absence d’un cas critique connu |
| Transformations reproductibles | 100 % des conversions documentées et testées | Conversion silencieuse ou non déterministe |
| Provenance et version | 100 % des objets publiables | Perte de la source ou de la version d’origine |
| Temps de validation | À établir par mesure de référence | Dégradation empêchant le parcours municipal prévu |

Les cibles définitives doivent être confirmées après établissement de la situation de référence.

## Portée

Cette initiative couvre :

- le contrat de données géographiques;
- les types d’objets autorisés;
- le système de coordonnées officiel et les conversions permises;
- les règles de validité;
- les limites municipales et territoriales;
- la provenance et le versionnement;
- les erreurs explicites;
- les migrations nécessaires;
- les tests automatisés et représentatifs;
- les interfaces internes nécessaires à la validation.

## Hors portée

Cette initiative ne couvre pas encore :

- l’interface complète de dessin cartographique;
- la publication municipale de bout en bout;
- les intégrations externes finales;
- l’optimisation avancée des itinéraires;
- la prédiction automatisée des impacts routiers;
- le pilote municipal en production.

Ces capacités dépendent du modèle admis et validé.

## Municipalités

Aucune municipalité n’est admise par défaut. Le modèle doit permettre une configuration territoriale distincte et vérifiable par municipalité.

Toute règle locale ajoutée au modèle commun doit être :

- explicitement identifiée;
- versionnée;
- limitée au territoire concerné;
- testée séparément;
- incapable d’affaiblir une barrière commune de sécurité ou d’isolation.

## Données

Les données envisagées comprennent :

- géométries déclarées, validées et publiées;
- identifiants municipaux et territoriaux;
- système de coordonnées et précision;
- provenance, auteur, date et méthode de création;
- résultats de validation;
- corrections et versions antérieures;
- références vers permis, arrêtés, chantiers et événements.

La conservation doit préserver l’historique utile sans dupliquer inutilement des données personnelles ou sensibles.

## Géographie

Les décisions suivantes doivent être prises avant admission complète :

- système de coordonnées de stockage;
- formats d’entrée et de sortie autorisés;
- types de géométrie supportés;
- règles de fermeture, auto-intersection, orientation et précision;
- gestion des géométries multiples;
- relation entre géométrie et réseau routier;
- stratégie pour les frontières municipales;
- tolérances de validation;
- comportement lors d’une conversion ou correction.

PostGIS est une option technique probable, mais son adoption doit être justifiée par les preuves, contraintes et besoins du modèle plutôt que considérée comme une décision déjà prise.

## Barrières

### Isolation municipale

Une municipalité ne peut lire, modifier, valider ou publier que les objets autorisés dans son périmètre. Les contrôles doivent être appliqués côté serveur et testés de bout en bout.

### Intégrité

Une géométrie invalide, incomplète, non attribuée ou non versionnée ne peut atteindre l’état publiable.

### Audit

Chaque création, correction, validation, rejet et publication doit pouvoir être relié à un acteur, une date, une version et une justification.

### Vie privée

Le modèle géographique ne doit pas introduire de collecte de localisation individuelle non nécessaire. Toute donnée concernant une personne doit posséder une finalité distincte et une durée de conservation justifiée.

### Accessibilité

Les erreurs et états de validation doivent être compréhensibles sans dépendre uniquement d’une carte, d’une couleur ou d’un repère visuel.

### Sécurité

Les entrées géographiques doivent être limitées, validées et protégées contre les charges excessives, formats malformés et transformations non autorisées.

## Dépendances

- inventaire du schéma Prisma et des routes existantes;
- règles de qualité géographique;
- modèle municipal et contrôle d’accès;
- choix de stockage et de migration;
- contrats de diffusion visés;
- capacité de test avec PostgreSQL et, si retenu, PostGIS;
- décisions sur les formats et systèmes de coordonnées.

## Exploitation

Avant admission, le dossier doit préciser :

- la supervision des erreurs de validation;
- les métriques de géométries rejetées ou corrigées;
- la procédure de reprise après migration;
- la sauvegarde et la restauration des données géographiques;
- le coût de stockage et d’indexation;
- les procédures de soutien pour les cas impossibles à représenter;
- la stratégie de compatibilité lors d’une nouvelle version du contrat.

## Conditions proposées pour une admission sous conditions

L’initiative pourrait être admise sous conditions seulement si :

1. le responsable et le décideur sont désignés;
2. l’inventaire de l’existant est produit;
3. un contrat géographique minimal est proposé;
4. les barrières d’isolation et d’intégrité sont testables;
5. une stratégie de migration et de retour arrière existe;
6. les cas représentatifs et les seuils de refus sont définis;
7. aucune dépendance critique sans propriétaire ne demeure;
8. la portée reste limitée au socle géographique, sans activation de publication réelle.

## Déclencheurs d’arrêt

- possibilité de contourner l’isolation municipale;
- corruption ou perte de provenance pendant une migration;
- conversion non déterministe;
- incapacité à restaurer l’état précédent;
- géométrie invalide pouvant être considérée comme publiable;
- dépendance externe critique non maîtrisée;
- coût ou complexité disproportionnés au besoin démontré.

## Retour arrière

Le retour doit permettre :

- de désactiver le nouveau contrat géographique;
- de restaurer le schéma et les données compatibles avec la version précédente;
- de conserver les données produites pendant l’évaluation dans un espace non publiable;
- d’annuler les migrations sans perte silencieuse;
- de maintenir l’API existante ou de refuser explicitement les opérations incompatibles.

La méthode exacte doit être éprouvée sur une copie représentative avant toute migration irréversible.

## Retrait

Si le modèle est remplacé ou abandonné :

- les formats et versions concernés restent identifiables;
- les consommateurs sont recensés;
- les données sont migrées, archivées ou supprimées selon décision;
- les accès, index, configurations et dépendances sont retirés;
- une période d’observation confirme l’absence de consommation résiduelle;
- les apprentissages et échecs restent conservés.

## Preuves nécessaires à la décision

- inventaire du schéma et des usages actuels;
- exemples municipaux représentatifs;
- matrice des formats et transformations;
- prototype réversible du contrat minimal;
- tests de validité, isolation, migration et restauration;
- mesure de performance de référence;
- analyse des risques et dépendances;
- estimation du coût d’exploitation;
- décision architecturale versionnée.

## Décision actuelle

**En évaluation.**

La documentation de gouvernance autorise la collecte de preuves, l’exploration réversible et la préparation du dossier. Elle n’autorise pas encore une migration de production, une publication réelle ni l’activation d’une capacité municipale.

## Obligations résiduelles

- désigner les responsabilités;
- établir la situation de référence;
- produire le contrat minimal;
- définir les règles de qualité géographique;
- confirmer ou rejeter l’usage de PostGIS;
- préparer les tests de migration et de retour;
- relier les décisions, risques, métriques et preuves aux références `CF2X-*` applicables.
