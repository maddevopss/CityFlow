# Travaux publics — Secrets E2E

Secrets GitHub Actions requis :

- `CITYFLOW_STAGING_API_URL` : URL de l’API de préproduction, incluant `/api/v1`;
- `CITYFLOW_E2E_PUBLIC_WORKS_MANAGER_TOKEN` : jeton d’un gestionnaire autorisé à créer et affecter;
- `CITYFLOW_E2E_FIELD_WORKER_TOKEN` : jeton d’un travailleur terrain autorisé à démarrer, journaliser et terminer;
- `CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN` : jeton valide d’une autre municipalité pour la preuve d’isolation.

Les comptes doivent être réservés à la préproduction, avoir des permissions minimales et leurs jetons doivent être renouvelés selon la politique de sécurité. L’absence d’un secret provoque un échec explicite du workflow.
