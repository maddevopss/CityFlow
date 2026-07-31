# Pile locale de supervision

## Préparation

1. Créer `observability/secrets/metrics-token` avec exactement la valeur de `METRICS_TOKEN` du backend.
2. Définir `GRAFANA_ADMIN_PASSWORD` dans l’environnement du terminal.
3. Démarrer le backend CityFlow sur le port 3000.

## Démarrage

```bash
cd observability
docker compose -f compose.yml up -d
```

Prometheus écoute uniquement sur `127.0.0.1:9090` et Grafana sur `127.0.0.1:3001`.

## Vérification

```bash
docker compose -f compose.yml ps
curl -fsS http://127.0.0.1:9090/-/ready
```

Dans Prometheus, la cible `cityflow-backend` doit être `UP`. Le tableau de bord CityFlow est provisionné automatiquement dans Grafana.

## Arrêt

```bash
docker compose -f compose.yml down
```

Ajouter `-v` uniquement pour supprimer volontairement l’historique local.

## Sécurité

Le fichier de secret ne doit jamais être commité. Les ports sont liés à l’interface locale seulement et l’accès anonyme Grafana est désactivé.
