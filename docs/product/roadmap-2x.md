# Feuille de route CityFlow 2.x

## Intention

La série 2.x transforme les fondations de CityFlow en capacités municipales utilisables à plus grande échelle, sans transférer automatiquement les priorités, hypothèses ou compromis de 1.x.

Elle ne constitue ni une récompense pour le travail déjà accompli ni une autorisation générale de développer. Chaque initiative doit être admise de nouveau à partir d’un problème actuel, de preuves suffisantes et d’une capacité réelle de livraison et d’exploitation.

## Point de départ

La série 2.x hérite de 1.x uniquement les éléments explicitement transférés :

- apprentissages confirmés;
- obligations réglementaires et contractuelles encore applicables;
- risques résiduels;
- dettes techniques, d’architecture, d’exploitation et de conformité;
- capacités stables dont la valeur et l’adoption ont été démontrées;
- décisions, preuves et historiques nécessaires à l’audit.

Une initiative non transférée n’est pas présumée abandonnée, prioritaire ou approuvée. Elle doit recevoir une nouvelle décision.

## Objectif de la série

CityFlow 2.x vise à rendre la gestion et la diffusion des entraves routières plus complète, plus interopérable et plus mesurable pour plusieurs municipalités, tout en maintenant une source officielle distincte par municipalité.

La série doit permettre de démontrer que CityFlow peut :

1. intégrer des données de voirie provenant de sources municipales hétérogènes;
2. produire une représentation géographique fiable, versionnée et vérifiable;
3. soutenir un cycle complet de préparation, validation, approbation, publication, correction et retrait;
4. diffuser l’information vers plusieurs canaux et partenaires sans perdre la traçabilité;
5. mesurer la qualité, la rapidité, l’adoption et les effets réels de la diffusion;
6. croître sans affaiblir l’isolation, la sécurité, l’accessibilité ni la capacité d’exploitation.

## Axes d’évolution

### 1. Modèle géographique officiel

Introduire une représentation géographique normalisée des entraves, segments, zones, directions, périodes et effets sur la circulation.

Les travaux doivent couvrir :

- validation géométrique;
- système de coordonnées explicite;
- versions et corrections traçables;
- contrôle des chevauchements et incohérences;
- export vers des formats ouverts approuvés;
- capacité de retrait sans perte de l’historique.

### 2. Cycle municipal de publication

Implanter un parcours complet et attribué : brouillon, validation, approbation, publication, correction, suspension, expiration et archivage.

Aucune publication officielle ne peut dépendre d’un état implicite, d’une approbation par silence ou d’une modification directe sans preuve.

### 3. Intégrations et échanges versionnés

Permettre l’entrée et la sortie de données par interfaces programmatiques, fichiers contrôlés et notifications signées.

Chaque intégration doit préciser :

- propriétaire;
- contrat de données;
- version;
- limites de débit;
- reprise et idempotence;
- supervision;
- plan de retrait;
- comportement en mode dégradé.

### 4. Expérience des équipes municipales

Réduire le temps et l’effort nécessaires pour comprendre, valider et publier une entrave.

Les améliorations doivent être évaluées dans les tâches réelles : préparation, détection d’erreur, comparaison de versions, approbation, correction urgente et suivi de diffusion.

### 5. Diffusion citoyenne et partenaires

Étendre la diffusion seulement lorsque la qualité, le consentement, l’accessibilité et la stabilité des formats sont démontrés.

Les canaux possibles comprennent les portails municipaux, données ouvertes, courriels, messages texte, notifications poussées et systèmes partenaires. Aucun canal n’est activé par défaut.

### 6. Exploitation multi-municipale

Démontrer que l’ajout de municipalités demeure soutenable sur les plans de la capacité, du soutien, de la supervision, des coûts et de la reprise.

La croissance doit être bloquée lorsque :

- l’isolation n’est pas prouvée;
- les seuils de capacité sont dépassés;
- les responsabilités de soutien sont incomplètes;
- la reprise n’a pas été testée;
- la dette d’exploitation augmente sans arbitrage.

### 7. Mesure et apprentissage

Relier chaque initiative à une situation de référence, des résultats attendus, des seuils, une période d’observation et une décision finale.

Les mesures doivent distinguer :

- livraison technique;
- utilisation réelle;
- réussite des tâches;
- qualité des données;
- délai de diffusion;
- incidents et corrections;
- coût d’exploitation;
- bénéfices municipaux et citoyens démontrés.

## Barrières non compensables

Aucune valeur fonctionnelle, pression de calendrier, économie attendue ou intérêt politique ne peut compenser un échec critique concernant :

- l’isolation entre municipalités;
- l’intégrité de la source officielle;
- la sécurité des accès et des échanges;
- la protection des renseignements personnels;
- la traçabilité des approbations et publications;
- l’accessibilité des parcours et communications essentiels;
- la capacité de suspendre, corriger ou retirer une diffusion;
- la conformité applicable.

## Admission des initiatives

Toute initiative 2.x doit être admise séparément. Son dossier minimal comprend :

- problème actuel et population touchée;
- preuves disponibles et niveau de confiance;
- résultat attendu et situation de référence;
- municipalités et systèmes concernés;
- données utilisées, produites et conservées;
- risques et barrières applicables;
- dépendances et fournisseur éventuel;
- effort de conception, livraison, validation et exploitation;
- responsable de la décision;
- conditions d’arrêt, de retour arrière et de retrait;
- méthode de mesure après livraison.

Les décisions possibles sont : admise, admise sous conditions, à préciser, reportée, refusée ou arrêtée.

## Séquence initiale proposée

La série commence par les fondations nécessaires aux autres capacités :

1. confirmer l’admission et le registre des initiatives 2.x;
2. établir le modèle géographique et ses règles de qualité;
3. formaliser le cycle de publication municipal;
4. démontrer l’isolation et l’audit de bout en bout;
5. ouvrir les premières intégrations versionnées;
6. conduire un pilote municipal limité;
7. mesurer les résultats et décider de l’élargissement.

Cette séquence peut être modifiée seulement par une décision versionnée qui expose les preuves, impacts, risques, dépendances et effets sur la capacité.

## Pilote municipal

Un pilote 2.x demeure limité tant que la preuve de soutenabilité n’est pas obtenue.

Le dossier de pilote doit définir :

- municipalité participante;
- territoire et types d’entraves couverts;
- utilisateurs et responsabilités;
- volume maximal;
- canaux de diffusion autorisés;
- environnement et données utilisés;
- durée;
- soutien et escalade;
- critères d’arrêt immédiat;
- mesures de réussite;
- décision attendue à la fin.

Le pilote ne crée aucun droit automatique à un déploiement général.

## Fermeture de la série

La série 2.x ne peut être déclarée accomplie sur la seule base du nombre de fonctions livrées.

Sa fermeture exige :

- comparaison aux objectifs et situations de référence;
- résultats d’adoption et de qualité;
- état des risques et dettes;
- preuve d’isolation, de reprise et d’auditabilité;
- capacité d’exploitation soutenable;
- bilan des pilotes;
- décisions explicites de confirmer, poursuivre, réduire, retirer, arrêter ou transférer vers un cycle suivant.

Toute limite ou obligation non résolue reste visible, attribuée et datée.