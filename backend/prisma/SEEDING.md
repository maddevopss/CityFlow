# Initialisation sécurisée de la base de données

Le seed crée ou met à jour les municipalités de démonstration et le premier compte administrateur.

## Variables requises

```bash
SEED_ADMIN_PASSWORD="un-mot-de-passe-unique-d-au-moins-12-caracteres"
SEED_ADMIN_EMAIL="admin@votre-domaine.ca"
```

`SEED_ADMIN_EMAIL` est facultative et utilise `admin@cityflow.local` par défaut. Le mot de passe est obligatoire et n'est jamais enregistré dans le dépôt ni affiché dans les journaux.

## Exécution

Depuis `backend` :

```bash
npm run seed
```

Le seed est réexécutable : les municipalités et le compte administrateur sont mis à jour avec `upsert` plutôt que créés en double.

## Production

Ne réutilisez pas le même mot de passe entre les environnements. Injectez les variables par le gestionnaire de secrets de la plateforme de déploiement et retirez-les de la session après l'initialisation lorsque la plateforme le permet.
