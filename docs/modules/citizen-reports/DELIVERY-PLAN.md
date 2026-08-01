# Signalements citoyens — Livraison complète

## Finalité
Recevoir, qualifier, affecter, suivre et fermer les signalements citoyens avec transparence, protection des renseignements et continuité jusqu’à la résolution.

## Cycle de vie
`RECEIVED → TRIAGED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`, avec `DUPLICATE`, `REJECTED` et `REOPENED` contrôlés.

## Données
CitizenReport, ReportCategory, ReportLocation, ReportAttachment, ReportStatusEvent, ReportAssignment, CitizenMessage, ServiceLevelTarget et ReportAuditEvent, toutes isolées par `municipalityId`.

## Capacités
- dépôt public guidé, anonyme ou authentifié;
- numéro de suivi et jeton limité;
- géolocalisation, photos et pièces;
- détection et fusion contrôlée des doublons;
- triage, priorité, affectation et niveaux de service;
- communication bidirectionnelle;
- création d’un ordre de travail;
- résolution, confirmation et réouverture;
- notifications et historique public filtré.

## Sécurité et tests
Minimisation des renseignements personnels, chiffrement des champs sensibles, anti-spam, quotas, antivirus, modération, isolation, accès public par jeton, audit et E2E dépôt → triage → intervention → résolution → notification.

## Exploitation
Volume, catégories, zones, doublons, délais de prise en charge et résolution, dossiers en dépassement et satisfaction.

## Barrière de production
Migrations, backend, frontend public et interne, OpenAPI, sécurité, observabilité et E2E verts en préproduction.
