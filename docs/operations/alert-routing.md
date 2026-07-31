# Routage des alertes d’exploitation

## Niveaux

- `warning` : intervention planifiée pendant les heures de service;
- `critical` : prise en charge immédiate selon le protocole d’incident.

Les alertes critiques sont regroupées après 10 secondes et répétées toutes les 30 minutes. Les avertissements sont regroupés après 30 secondes et répétés toutes les 4 heures.

## Secrets

Alertmanager lit les destinations depuis des fichiers montés :

- `/run/secrets/cityflow_warning_webhook_url`;
- `/run/secrets/cityflow_critical_webhook_url`.

Ces fichiers ne doivent jamais être committés ni inscrits dans les journaux.

## Vérification

```bash
amtool check-config observability/alertmanager/alertmanager.yml
```

Tester chaque canal avec une alerte contrôlée avant un déploiement. Une alerte critique inhibe l’avertissement correspondant afin d’éviter les doubles notifications.
