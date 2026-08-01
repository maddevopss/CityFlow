# Validation CI E2E — Actifs municipaux

Cette livraison ajoute une barrière GitHub Actions dédiée au parcours de préproduction du module Actifs municipaux.

## Déclenchement

Le workflow s’exécute sur les pull requests qui modifient le projet E2E, le contrat OpenAPI, la documentation de production ou le workflow lui-même. Il peut aussi être lancé manuellement.

## Barrière

Le contrôle échoue lorsque les secrets de préproduction ne sont pas configurés. Lorsqu’ils sont présents, Chromium est installé et le scénario `test:assets` est exécuté. Les rapports et traces disponibles sont publiés comme artefacts pour 14 jours.
