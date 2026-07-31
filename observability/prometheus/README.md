# Règles Prometheus CityFlow

Charger `cityflow-alerts.yml` dans la section `rule_files` de Prometheus :

```yaml
rule_files:
  - /etc/prometheus/rules/cityflow-alerts.yml
```

Valider la configuration avec `promtool check rules` avant un déploiement.
