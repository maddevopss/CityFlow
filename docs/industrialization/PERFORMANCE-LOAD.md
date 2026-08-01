# Performance et tests de charge

## Budgets

- API lecture p95 ≤ 500 ms;
- API écriture p95 ≤ 800 ms;
- erreurs HTTP 5xx < 1 %;
- aucune fuite mémoire durable après le test;
- interface principale : LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms.

## Scénarios

- consultation simultanée des inspections, permis et signalements;
- création et mise à jour d’ordres de travail;
- téléversement contrôlé de preuves;
- consultation du tableau exécutif;
- pointe de notifications et tâches planifiées.

## Profils

- fumée : 5 utilisateurs pendant 1 minute;
- nominal : 50 utilisateurs pendant 10 minutes;
- pointe : montée à 200 utilisateurs pendant 5 minutes;
- endurance : 25 utilisateurs pendant 60 minutes.

## Sécurité

Les tests ne visent jamais la production sans autorisation explicite. Les identifiants de test sont dédiés et les données générées sont supprimables.

## GO / NO-GO

NO-GO si un budget critique est dépassé, si le taux d’erreur atteint 1 %, si l’isolation municipale échoue ou si une saturation ne produit aucune alerte.
