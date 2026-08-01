# Secrets E2E — Actifs municipaux

Le workflow `.github/workflows/assets-e2e-production.yml` exige les secrets GitHub Actions suivants :

- `CITYFLOW_STAGING_API_URL` : URL de base de l’API de préproduction, incluant `/api/v1`;
- `CITYFLOW_E2E_ASSET_MANAGER_TOKEN` : jeton d’un gestionnaire d’actifs autorisé à créer, évaluer et changer l’état d’un actif;
- `CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN` : jeton valide appartenant à une autre municipalité pour prouver l’isolation.

L’absence d’un secret fait échouer explicitement le workflow. Les traces et le rapport Playwright sont conservés pendant 14 jours lorsqu’ils existent.
