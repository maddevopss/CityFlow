# Sauvegardes PostgreSQL de CityFlow

## Objectif

Produire une sauvegarde chiffrable, vérifiée et restaurable de la base CityFlow sans exposer de secret dans le dépôt.

## Exécution

```bash
DATABASE_URL='postgresql://...' \
BACKUP_DIRECTORY=/var/backups/cityflow \
BACKUP_RETENTION_DAYS=14 \
bash ops/postgresql/backup.sh
```

Le script :

1. crée une archive PostgreSQL au format personnalisé;
2. applique des permissions privées avec `umask 077`;
3. calcule une somme SHA-256;
4. vérifie que `pg_restore` peut lire le catalogue;
5. supprime les archives plus vieilles que la rétention configurée.

## Règles d’exploitation

- exécuter la sauvegarde au moins une fois par jour;
- conserver une copie hors de l’hôte applicatif;
- chiffrer les archives au repos et pendant leur transfert;
- restreindre le compte de sauvegarde aux permissions nécessaires;
- surveiller l’âge de la dernière sauvegarde réussie;
- effectuer un test de restauration au moins chaque trimestre.

## Vérification d’intégrité

```bash
sha256sum --check /var/backups/cityflow/cityflow-YYYYMMDDTHHMMSSZ.dump.sha256
pg_restore --list /var/backups/cityflow/cityflow-YYYYMMDDTHHMMSSZ.dump >/dev/null
```

## Critères de réussite

Une sauvegarde n’est considérée valide que si l’archive existe, que sa somme correspond, que son catalogue est lisible et qu’une restauration contrôlée a déjà été démontrée dans un environnement isolé.
