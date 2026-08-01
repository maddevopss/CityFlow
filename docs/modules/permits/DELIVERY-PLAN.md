# Permis et autorisations — Livraison complète

## Finalité
Gérer les demandes, pièces, examens, décisions, conditions, délivrance, renouvellement, suspension et fermeture.

## Cycle de vie
`DRAFT → SUBMITTED → UNDER_REVIEW → INFORMATION_REQUIRED → APPROVED | REJECTED → ISSUED → SUSPENDED | EXPIRED | CLOSED`.

## Données
PermitApplication, PermitDocument, PermitReview, PermitCondition, PermitDecision, PermitFee, PermitPaymentReference et PermitAuditEvent, toutes isolées par `municipalityId`.

## Capacités
- portail guidé de demande;
- reprise de brouillon et soumission idempotente;
- file municipale paginée et recherchable;
- affectation à un réviseur;
- demande d’information et gestion des versions de pièces;
- approbation ou refus motivé;
- délivrance d’un numéro public;
- renouvellement, suspension et fermeture;
- suivi public limité par jeton;
- lien avec les inspections.

## Sécurité
Séparation demandeur/décideur, contrôle des rôles, journal append-only, empreinte SHA-256 des pièces, quotas, antivirus, réponses uniformes hors municipalité.

## Interface
Portail demandeur, file de traitement, fiche chronologique, écran de décision, pièces et conditions, suivi public.

## Tests
Transitions, isolation, pièces invalides, idempotence, séparation des rôles et E2E demande → décision → délivrance → inspection.

## Exploitation
Temps de traitement, dossiers bloqués, demandes d’information, taux d’approbation, erreurs de pièces et alertes de dépassement.

## Barrière de production
Migrations, backend, frontend, OpenAPI, sécurité, observabilité et E2E verts en préproduction.
