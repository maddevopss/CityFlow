# Procédure PostgreSQL — sauvegarde et restauration

## Objectif

Fournir une sauvegarde PostgreSQL restaurable et une procédure vérifiable pour le pilote municipal CityFlow.

## Préconditions

- pg_dump, pg_restore et sha256sum disponibles sur l’hôte d’exploitation;
- DATABASE_URL injectée par le gestionnaire de secrets;
- répertoire de sauvegarde hors du dépôt, avec permissions restreintes;
- rétention approuvée par le responsable municipal;
- restauration exécutée d’abord sur une base isolée de validation.

Les fichiers .dump contiennent des données potentiellement sensibles. Ils ne doivent jamais être commités, publiés dans les artefacts CI ou copiés dans un stockage non approuvé.

## Sauvegarde

Depuis la racine du dépôt:

~~~bash
DATABASE_URL='postgresql://...' BACKUP_DIR='/var/backups/cityflow' \
  BACKUP_RETENTION_DAYS=7 bash scripts/backup-postgres.sh
~~~

Le script produit:

- un dump PostgreSQL au format custom;
- un inventaire pg_restore --list;
- une empreinte SHA-256;
- le nettoyage des dumps dépassant la rétention configurée.

Le stockage distant, son chiffrement, sa réplication et sa surveillance doivent être configurés par l’environnement d’hébergement selon la politique municipale.

## Vérification et restauration

Une restauration de validation doit être réalisée sur une base distincte:

~~~bash
DATABASE_URL='postgresql://...' BACKUP_FILE='/var/backups/cityflow/cityflow-UTC.dump' \
  CONFIRM_RESTORE=YES bash scripts/restore-postgres.sh
~~~

La confirmation YES est obligatoire, car pg_restore --clean --if-exists remplace les objets présents dans la base cible. Après restauration, exécuter les migrations compatibles, /health, puis les parcours minimaux de la checklist de livraison.

## Preuves à conserver

- nom et empreinte SHA-256 du dump;
- horodatage UTC et durée;
- cible de restauration;
- résultat de pg_restore;
- validation de /health et des parcours minimaux;
- identité du responsable ayant autorisé la restauration.

## Limites

Cette PR ne configure pas un ordonnanceur, un fournisseur de stockage, un chiffrement géré par clé, un RPO/RTO municipal ni une restauration automatique. Ces paramètres dépendent de l’environnement d’hébergement et doivent être approuvés avant production.
~~~