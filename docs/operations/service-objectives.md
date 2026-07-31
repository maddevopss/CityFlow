# Objectifs historiques de diffusion

## Indicateurs enregistrés

Les règles d’enregistrement conservent des vues calculées sur 5 minutes, 1 heure et 24 heures afin d’éviter de recalculer les mêmes fenêtres dans chaque tableau de bord.

## Objectifs initiaux

- santé `healthy` au moins 99,5 % sur 24 heures;
- 95e percentile de livraison inférieur à 15 minutes;
- aucune diffusion en file morte non traitée;
- aucune alerte critique ouverte durablement.

Ces valeurs sont des objectifs d’exploitation initiaux et non des garanties contractuelles.

## Vérification

```bash
promtool check rules observability/prometheus/cityflow-recording-rules.yml
```

Après chargement, vérifier que les séries préfixées par `cityflow:` sont présentes dans Prometheus.

## Utilisation

Les vues historiques servent aux revues hebdomadaires, à la détection des dérives et à la préparation d’un futur budget d’erreur.
