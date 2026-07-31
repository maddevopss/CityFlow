# Gouvernance des métriques CityFlow 2.x

## Intention

Une métrique ne constitue pas une vérité par sa seule présence dans un tableau de bord. Ce cadre définit comment CityFlow 2.x crée, approuve, calcule, interprète, surveille, révise et retire les indicateurs utilisés pour décider.

## Référence stable

Chaque métrique gouvernée reçoit un identifiant `CF2X-MET-xxxx` qui demeure stable malgré les changements de nom, de formule ou de source.

## Fiche minimale

La fiche d’une métrique précise au minimum :

- la question à laquelle elle répond;
- son propriétaire métier et son responsable technique;
- la population, le territoire et la période couverts;
- les sources, transformations et exclusions;
- la formule versionnée et l’unité;
- la fréquence de mise à jour;
- les seuils d’alerte, d’action et d’arrêt;
- les limites, biais connus et niveau de confiance;
- les indicateurs de protection associés;
- les décisions qu’elle peut éclairer et celles qu’elle ne peut pas autoriser seule.

## Catégories

CityFlow distingue les métriques de résultat, d’adoption, de qualité, d’exploitation, de protection, de coût et de contexte. Un volume produit ne peut être présenté comme une preuve de valeur sans relation démontrée avec un résultat réel.

## Qualité et provenance

Chaque valeur doit pouvoir être reliée à des sources identifiables, à une transformation reproductible et à une version de définition. Les données manquantes, tardives ou corrigées demeurent visibles. Une absence de données n’est jamais interprétée automatiquement comme un résultat nul ou favorable.

## Segmentation

Les résultats sont segmentés lorsque les moyennes pourraient masquer des écarts importants entre territoires, parcours, appareils, conditions d’accès ou groupes concernés. La segmentation respecte la minimisation et la protection de la vie privée.

## Dérive

La dérive peut toucher la définition, les sources, la population, l’instrumentation ou le comportement observé. Toute dérive significative déclenche une réévaluation des comparaisons historiques, seuils et décisions dépendantes.

## Révision et retrait

Une métrique peut être confirmée, corrigée, remplacée, suspendue ou retirée. Le retrait conserve la définition, les motifs, les dates, les effets sur les décisions antérieures et la référence vers la métrique de remplacement.

## Interdictions

Il est interdit :

- de modifier rétroactivement une cible pour rendre un résultat favorable;
- de supprimer silencieusement une période défavorable;
- de présenter une corrélation comme une causalité démontrée;
- d’agréger des populations incompatibles sans avertissement;
- de laisser un indicateur sans propriétaire, source ou définition;
- de permettre à une métrique ou à un score automatisé de devenir l’autorité finale.

## Traçabilité

La métrique est reliée aux initiatives, décisions, hypothèses, expérimentations, risques, incidents, coûts, niveaux de service et revues de valeur qui l’utilisent.