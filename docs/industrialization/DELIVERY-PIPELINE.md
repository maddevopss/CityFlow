# Bloc 4 — Livraison

## Objectif

Déployer CityFlow vers préproduction puis production avec approbations, vérifications post-déploiement, progression contrôlée et retour arrière documenté.

## Préproduction

- déclenchée après fusion sur `main` ou manuellement;
- migrations exécutées avec sauvegarde et journal;
- tests de santé, contrats API et parcours E2E obligatoires;
- artefact immuable identifié par SHA Git.

## Production

- déclenchement manuel uniquement;
- environnement GitHub protégé avec approbation;
- même artefact que celui validé en préproduction;
- déploiement progressif : canary ou blue-green;
- vérification automatique avant promotion complète.

## Vérifications post-déploiement

- santé applicative et base de données;
- authentification et isolation municipale;
- lecture d’un module principal;
- création non destructive dans un tenant de validation;
- métriques d’erreurs et latence;
- absence de migration bloquée.

## Retour arrière

Le rollback doit pouvoir restaurer l’application précédente sans supprimer les données nouvelles. Une migration irréversible impose un plan de compatibilité avant déploiement. Les critères automatiques de rollback incluent hausse des 5xx, santé rouge, erreur de migration ou échec du parcours sentinelle.

## GO / NO-GO

NO-GO si l’artefact diffère entre préproduction et production, si les preuves E2E manquent, si le rollback n’est pas documenté ou si les secrets/environnements protégés ne sont pas configurés.
