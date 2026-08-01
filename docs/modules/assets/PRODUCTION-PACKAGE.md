# Actifs municipaux — Paquet de production

## Sécurité

- isolation par municipalité sur actifs, évaluations, documents et imports;
- codes publics uniques dans une municipalité;
- validation des hiérarchies et refus des cycles parent/enfant;
- géométries validées et taille bornée;
- documents référencés avec empreinte SHA-256, format autorisé et analyse antivirus;
- quotas initiaux : 120 lectures/minute, 30 écritures/minute, import maximal de 5 000 lignes;
- transitions interdites après `DISPOSED`;
- aucune valeur financière détaillée dans les journaux techniques.

## Exploitation

Métriques : actifs par catégorie et état, actifs critiques, actifs hors service, évaluations en retard, imports réussis ou rejetés, temps de réponse et erreurs. Alertes : hausse des actifs critiques, évaluation critique sans ordre de travail, import rejeté, p95 supérieur à 1 seconde ou taux d’erreur supérieur à 5 %.

## Conservation et retour arrière

Les événements de cycle de vie et évaluations sont conservés selon la politique municipale; les journaux techniques sont conservés 90 jours. Un retour arrière désactive les routes, conserve les données et exige une sauvegarde avant toute migration descendante.

## Barrière de production

GO uniquement après migrations, isolation, imports, hiérarchies, évaluations, interface, OpenAPI et E2E verts. Tout cycle hiérarchique, fuite intermunicipale, perte d’évaluation ou disposition réversible entraîne NO-GO.
