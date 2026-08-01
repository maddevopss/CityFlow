# Module Inspections — CityFlow

## Statut

Version 1 clôturée fonctionnellement après les PR #399 à #404.

## Objectif

Permettre aux équipes municipales de planifier, affecter, exécuter et documenter des inspections terrain dans un cadre isolé par municipalité et contrôlé par rôles.

## Capacités livrées

- planification, consultation et clôture d’une inspection;
- interface de suivi terrain;
- affectation contrôlée des inspecteurs;
- preuves terrain avec empreinte SHA-256;
- rappels internes idempotents;
- calendrier hebdomadaire, détection simple des conflits et export iCalendar.

## Acteurs

- **ADMIN** : administration et supervision;
- **MUNICIPAL_AGENT** : planification, affectation et génération des rappels;
- **INSPECTOR** : accès à ses inspections, preuves et rappels.

## Documents

- [Architecture](./ARCHITECTURE.md)
- [Traçabilité](./TRACEABILITY.md)
- [Validation](./VALIDATION.md)
- [Sécurité](./SECURITY.md)
- [Exploitation](./OPERATIONS.md)
- [Limites](./LIMITATIONS.md)
- [Historique](./CHANGELOG.md)
- [Acceptation](./ACCEPTANCE.md)
- [Archivage](./ARCHIVE.md)
