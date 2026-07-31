# Restauration PostgreSQL de CityFlow

## Principe

Une restauration doit toujours viser une base isolée ou une base explicitement déclarée hors service. Le script refuse de démarrer sans une confirmation volontaire.

## Préparation

1. choisir l’archive et vérifier sa provenance;
2. confirmer la somme SHA-256 lorsqu’elle existe;
3. créer une base de restauration vide et isolée;
4. suspendre tout worker ou service qui pourrait écrire dans cette base;
5. conserver l’URL de la base de production hors de la commande.

## Exécution

```bash
RESTORE_DATABASE_URL='postgresql://.../cityflow_restore' \
BACKUP_ARCHIVE='/var/backups/cityflow/cityflow-YYYYMMDDTHHMMSSZ.dump' \
RESTORE_CONFIRMATION='RESTORE_CITYFLOW' \
bash ops/postgresql/restore.sh
```

## Vérifications après restauration

- les migrations attendues sont présentes;
- les comptes et municipalités attendus existent;
- les événements et journaux d’audit sont cohérents;
- les sorties transactionnelles ne sont pas relancées automatiquement;
- aucune donnée d’une municipalité n’est visible depuis une autre;
- les endpoints de santé répondent;
- les métriques ne révèlent aucune donnée municipale.

## Décision de bascule

La base restaurée ne doit devenir active qu’après validation conjointe de l’intégrité, de l’isolation municipale, de l’audit et du plan de retour arrière.

## Preuves à conserver

- archive utilisée et somme SHA-256;
- heure de début et de fin;
- version de PostgreSQL;
- résultat des vérifications;
- personne ayant autorisé la bascule;
- anomalies et mesures correctives.
