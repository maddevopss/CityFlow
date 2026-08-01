# Permis et autorisations — Plan complet

## Finalité

Gérer de bout en bout les demandes, pièces, examens, décisions, conditions, paiements, délivrance, renouvellement, suspension et fermeture des permis municipaux.

## Acteurs

- citoyen ou entreprise demanderesse;
- agent municipal;
- réviseur spécialisé;
- administrateur;
- inspecteur en lecture des permis liés.

## Cycle de vie

`DRAFT → SUBMITTED → UNDER_REVIEW → INFORMATION_REQUIRED → APPROVED | REJECTED → ISSUED → SUSPENDED | EXPIRED | CLOSED`.

Toute transition exige un acteur, une date, un motif et une trace d’audit.

## Données

- PermitApplication;
- PermitDocument;
- PermitReview;
- PermitCondition;
- PermitDecision;
- PermitFee;
- PermitPaymentReference;
- PermitAuditEvent.

Toutes les entités portent `municipalityId`. Les identifiants publics sont distincts des UUID internes.

## API

- création et brouillon;
- soumission;
- liste paginée et recherche;
- demande d’information;
- ajout et validation des pièces;
- affectation à un réviseur;
- approbation ou refus motivé;
- délivrance et numéro public;
- suspension, renouvellement et fermeture;
- consultation des événements et preuves.

## Interface

- portail de demande guidé;
- file de traitement municipale;
- fiche complète avec chronologie;
- comparaison des versions de pièces;
- écran de décision;
- suivi public par numéro et jeton limité.

## Sécurité

- isolation municipale systématique;
- rôles et séparation demandeur/décideur;
- pièces référencées par stockage objet, empreinte SHA-256 et analyse antivirus;
- idempotence des soumissions et paiements;
- journal append-only des décisions;
- quotas et limites de taille.

## Tests

- transitions nominales et interdites;
- isolation intermunicipale;
- pièces invalides et doublons;
- séparation des rôles;
- idempotence;
- E2E demande → révision → décision → délivrance → inspection liée.

## Exploitation

- temps de traitement;
- dossiers en attente;
- demandes d’information;
- taux d’approbation/refus;
- erreurs de pièces et intégrations;
- alertes de dossiers bloqués.

## Fermeture

Le module est prêt lorsque backend, frontend, migrations, OpenAPI, observabilité, sécurité et E2E sont verts en préproduction.
