# Tableau exécutif — Paquet de production

## Sécurité et confidentialité

- accès limité aux rôles exécutifs et gestionnaires autorisés;
- isolation municipale sur toutes les agrégations;
- aucun détail personnel dans les KPI;
- forage soumis aux permissions du module source;
- journalisation des consultations et exports sensibles.

## Qualité et exploitation

Chaque indicateur expose sa période, sa fraîcheur, sa source et son état de calcul. Les métriques couvrent inspections, permis, actifs, travaux publics et signalements. Alertes : source indisponible, donnée trop ancienne, divergence d’agrégation, temps de réponse p95 supérieur à 2 secondes.

## Retour arrière

Désactiver le tableau transversal sans désactiver les modules sources. Revenir au calcul précédent, conserver les définitions versionnées et ne jamais corriger les données sources depuis le tableau.

## Barrière GO/NO-GO

GO seulement après validation des cinq sources, permissions, fraîcheur, période, valeurs nulles, isolation et E2E. Toute fuite intermunicipale, KPI sans définition ou donnée périmée présentée comme actuelle entraîne NO-GO.
