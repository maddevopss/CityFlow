# Exploitation — Inspections v1

## Cycle opérationnel

1. planifier l’inspection avec une date, une adresse et un type;
2. affecter un inspecteur actif de la municipalité;
3. consulter le calendrier et traiter les conflits signalés;
4. générer les rappels J-1;
5. déposer les métadonnées de preuves terrain;
6. terminer l’inspection avec résultat et constats;
7. conserver la traçabilité de l’acteur et des dates.

## Surveillance

- surveiller les échecs de génération des rappels;
- vérifier les migrations avant déploiement;
- contrôler les erreurs 401, 403, 404 et 409;
- suivre les doublons de clés de stockage;
- vérifier régulièrement l’accès aux données d’une seule municipalité.

## Reprise

Les rappels peuvent être régénérés grâce à leur clé d’unicité. Une preuve rejetée doit être corrigée à la source avant nouvel enregistrement. Les corrections de données en production doivent passer par une procédure administrée et auditée.
