# Délivrance officielle des permis

## Objectif

La délivrance transforme un permis approuvé en autorisation municipale identifiable. Elle ne modifie pas l’état décisionnel du permis : elle ajoute une preuve immuable et un numéro municipal unique.

## Conditions obligatoires

Un permis peut être délivré uniquement lorsque :

- il appartient à la municipalité de l’utilisateur;
- son état est `APPROVED`;
- toutes les pièces obligatoires sont acceptées;
- ses frais sont `PAID` ou `WAIVED`.

## Contrats API

### Consulter la délivrance

`GET /api/v1/permits/:permitId/issuance`

Rôles : `ADMIN`, `MANAGER`, `MUNICIPAL_AGENT`, `VIEWER`.

### Délivrer le permis

`POST /api/v1/permits/:permitId/issuance`

Rôles : `ADMIN`, `MANAGER`.

Une répétition retourne la délivrance existante. Le numéro suit le format `CF-{municipalité}-{année}-{suffixe du permis}`.

## Sécurité et audit

- limiteur de lecture sur la consultation;
- limiteur d’écriture sur la délivrance;
- isolation par municipalité;
- écriture transactionnelle;
- journal `PERMIT_ISSUED` avec auteur, rôle, numéro et état financier;
- aucune donnée bancaire conservée.

## Erreurs métier

- `404 PERMIT_NOT_FOUND`;
- `409 PERMIT_NOT_APPROVED`;
- `409 PERMIT_DOCUMENTS_INCOMPLETE`;
- `409 PERMIT_FEE_UNSETTLED`.

## Limites

- aucun document PDF signé;
- aucune signature électronique;
- aucune révocation de délivrance;
- aucun envoi automatique au demandeur;
- le numéro utilise un suffixe déterministe du permis plutôt qu’une séquence municipale configurable.
