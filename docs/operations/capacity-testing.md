# Tests de capacité CityFlow

## But

Mesurer la stabilité de l’endpoint de supervision sous une charge contrôlée sans utiliser de données municipales ni frapper la production par défaut.

## Exécution

```bash
CITYFLOW_BASE_URL='http://127.0.0.1:3000' \
CITYFLOW_METRICS_TOKEN='...' \
CITYFLOW_REQUEST_RATE=10 \
CITYFLOW_TEST_DURATION='2m' \
k6 run tests/load/metrics.js
```

## Seuils initiaux

- moins de 1 % de requêtes en échec;
- 95e percentile inférieur à 500 ms;
- 99e percentile inférieur à 1 seconde;
- plus de 99 % des contrôles réussis.

## Progression recommandée

1. exécuter 10 requêtes par seconde pendant 2 minutes;
2. doubler graduellement le débit;
3. surveiller CPU, mémoire, connexions PostgreSQL et latence;
4. arrêter dès qu’un seuil de sécurité est franchi;
5. conserver le débit maximal stable et les conditions du test.

## Garde-fous

- utiliser un environnement isolé;
- ne jamais lancer contre la production sans autorisation explicite;
- ne pas ajouter d’identifiant municipal aux métriques;
- ne pas utiliser un jeton utilisateur;
- limiter la durée et le débit;
- vérifier la récupération après le test.

## Preuves à conserver

- version du code et de k6;
- configuration du test;
- résultats bruts;
- graphiques de ressources;
- anomalies observées;
- décision de capacité et marge retenue.
