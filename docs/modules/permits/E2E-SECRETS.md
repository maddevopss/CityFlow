# Secrets E2E — Permis

Le workflow `.github/workflows/permits-e2e-production.yml` exige les secrets GitHub Actions suivants :

- `CITYFLOW_STAGING_API_URL` : URL de base de l’API de préproduction, incluant `/api/v1`;
- `CITYFLOW_E2E_AGENT_TOKEN` : jeton d’un agent municipal autorisé à créer, soumettre et délivrer une demande;
- `CITYFLOW_E2E_PERMIT_REVIEWER_TOKEN` : jeton d’un réviseur autorisé à rendre une décision;
- `CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN` : jeton valide appartenant à une autre municipalité pour prouver l’isolation.

L’absence d’un secret fait échouer explicitement le workflow. Les traces et le rapport Playwright sont conservés pendant 14 jours lorsqu’ils existent.
