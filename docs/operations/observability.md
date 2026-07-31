# Supervision de la diffusion CityFlow

Ce guide décrit l’intégration de l’endpoint `/metrics` avec Prometheus et Grafana.

## Prérequis

- définir `METRICS_TOKEN` dans le service CityFlow;
- configurer Prometheus pour interroger `/metrics` avec le même jeton;
- charger `observability/prometheus/cityflow-alerts.yml` dans Prometheus;
- monter les fichiers de provisionnement Grafana;
- définir `PROMETHEUS_URL` dans Grafana.

## Exemple de cible Prometheus

```yaml
scrape_configs:
  - job_name: cityflow
    metrics_path: /metrics
    authorization:
      type: Bearer
      credentials: ${CITYFLOW_METRICS_TOKEN}
    static_configs:
      - targets:
          - cityflow-backend:3000
```

Le secret ne doit pas être ajouté au dépôt. Selon le mode de déploiement, utiliser un gestionnaire de secrets ou un fichier monté hors du contrôle de version.

## Règles d’alerte

Le fichier `observability/prometheus/cityflow-alerts.yml` couvre les situations suivantes :

- état global critique ou dégradé;
- présence d’éléments en file morte;
- traitement bloqué;
- dépassement du délai critique;
- 95e percentile supérieur à quinze minutes;
- alertes opérationnelles critiques non acquittées.

Les délais `for` évitent de déclencher une alerte sur une variation très brève.

## Tableau de bord Grafana

Le tableau de bord `CityFlow — Santé de la diffusion` présente :

- les diffusions en attente;
- les diffusions bloquées;
- la file morte;
- les alertes critiques ouvertes;
- le délai moyen et le 95e percentile;
- les volumes en attente, en traitement, traités et morts.

Le tableau de bord ne contient aucune dimension par municipalité. Cette restriction évite l’exposition indirecte de données municipales et limite la cardinalité des métriques.

## Provisionnement Grafana

Monter les chemins suivants dans le conteneur Grafana :

```text
observability/grafana/provisioning/datasources/prometheus.yml
  -> /etc/grafana/provisioning/datasources/prometheus.yml

observability/grafana/provisioning/dashboards/cityflow.yml
  -> /etc/grafana/provisioning/dashboards/cityflow.yml

observability/grafana/dashboards/cityflow-diffusion.json
  -> /var/lib/grafana/dashboards/cityflow-diffusion.json
```

Définir ensuite :

```text
PROMETHEUS_URL=http://prometheus:9090
```

## Vérification minimale

1. appeler `/metrics` avec un jeton valide;
2. vérifier que la cible Prometheus est `UP`;
3. vérifier que les règles apparaissent dans Prometheus;
4. ouvrir le dossier Grafana `CityFlow`;
5. provoquer uniquement dans un environnement de test une condition d’avertissement;
6. confirmer que l’alerte se résout lorsque l’état redevient normal.

## Sécurité

- ne jamais réutiliser un jeton municipal comme `METRICS_TOKEN`;
- limiter l’accès réseau à `/metrics` aux outils de supervision;
- renouveler le jeton après toute exposition suspectée;
- ne pas ajouter d’étiquette contenant un identifiant municipal;
- ne pas inclure de message d’erreur métier ou de charge utile dans une métrique.
