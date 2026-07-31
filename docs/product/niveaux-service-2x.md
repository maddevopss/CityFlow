# Niveaux de service — CityFlow 2.x

## Objet

Ce cadre définit les engagements mesurables de disponibilité, performance, qualité, soutien et rétablissement des services CityFlow 2.x.

## Identifiant

Chaque engagement reçoit un identifiant `CF2X-SLO-xxxx`.

## Contenu minimal

Chaque niveau de service précise :

- service et parcours couverts;
- population et territoire;
- indicateur et méthode de calcul;
- cible, seuil d’alerte et seuil de rupture;
- fenêtre de mesure;
- exclusions justifiées;
- propriétaire;
- actions prévues en cas d’écart.

## Catégories

Les engagements peuvent couvrir disponibilité, latence, exactitude, fraîcheur des données, temps de réponse du soutien, rétablissement, accessibilité et continuité.

## Budgets d’erreur

Pour les services appropriés, un budget d’erreur rend visible la marge de dégradation acceptable. Son épuisement déclenche gel, réduction d’exposition ou action corrective.

## Segmentation

Les résultats globaux ne doivent pas masquer les écarts par territoire, organisation, appareil, mode d’accès ou groupe d’utilisateurs.

## Révision

Les objectifs sont réévalués après incident majeur, changement d’architecture, nouvelle dépendance, évolution de la demande ou changement d’obligation.

## Interdictions

Il est interdit de modifier rétroactivement une cible, d’exclure une période défavorable sans justification ou d’annoncer un engagement sans capacité de mesure.

## Fermeture

Un engagement retiré conserve son historique, ses écarts, ses décisions et les obligations transférées.
