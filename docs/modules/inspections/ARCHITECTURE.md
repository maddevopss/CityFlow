# Architecture du module Inspections

## Vue d’ensemble

Le module repose sur un backend Express, Prisma et PostgreSQL, ainsi que sur une interface React protégée par rôles.

## Composants

- `Inspection` : cycle principal, municipalité, horaire, résultat et acteurs;
- `InspectionEvidence` : métadonnées de preuve, clé de stockage et SHA-256;
- `InspectionReminder` : rappels internes idempotents;
- routes `/api/v1/inspections`, `/inspection-reminders` et `/inspection-calendar`;
- pages frontend de liste, détail et calendrier.

## Flux

1. un agent planifie l’inspection;
2. un agent ou administrateur affecte un inspecteur actif de la même municipalité;
3. l’inspecteur consulte uniquement ses dossiers;
4. les preuves sont référencées avec une empreinte d’intégrité;
5. les rappels J-1 sont générés sans doublon;
6. l’inspection est terminée avec résultat, constats et acteur;
7. le calendrier expose la plage autorisée et les conflits simples.

## Principes

- la municipalité provient du jeton authentifié;
- les accès sont filtrés côté serveur;
- les fichiers binaires ne sont pas stockés dans PostgreSQL;
- la preuve conserve les informations permettant une vérification ultérieure;
- les fonctions avancées restent séparées de ce socle v1.
