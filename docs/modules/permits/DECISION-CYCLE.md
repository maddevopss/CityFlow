# Cycle décisionnel des permis municipaux

## Finalité

Le cycle encadre les décisions municipales prises sur un permis reçu dans CityFlow. Chaque transition est isolée par municipalité, exécutée dans une transaction et inscrite dans le journal d’audit des événements.

## États et transitions

```text
DRAFT ──submit──> SUBMITTED ──approve──> APPROVED ──close──> CLOSED
  ▲                    │
  │                    └──reject(reason)──> REJECTED
  └────────────────────────submit──────────────┘

ACTIVE ──close(reason)──> CLOSED
```

- `submit`: permis `DRAFT` ou `REJECTED`; rôles `ADMIN`, `MANAGER`, `MUNICIPAL_AGENT`.
- `approve`: permis `SUBMITTED`; rôles `ADMIN`, `MANAGER`.
- `reject`: permis `SUBMITTED`; rôles `ADMIN`, `MANAGER`; motif obligatoire.
- `close`: permis `APPROVED` ou `ACTIVE`; rôles `ADMIN`, `MANAGER`, `MUNICIPAL_AGENT`; motif obligatoire.

## Contrats API

- `POST /api/v1/permits/:permitId/submit`
- `POST /api/v1/permits/:permitId/approve`
- `POST /api/v1/permits/:permitId/reject` avec `{ "reason": "..." }`
- `POST /api/v1/permits/:permitId/close` avec `{ "reason": "..." }`

Réponses principales :

- `200`: transition appliquée;
- `400`: identifiant ou motif invalide;
- `403`: rôle ou municipalité refusé;
- `404`: permis absent ou hors municipalité;
- `409`: état courant incompatible.

## Traçabilité

Chaque transition écrit dans `EventAudit` : action, acteur, rôle, ancien état, nouvel état, motif et marqueur `sourceType: PERMIT`.

## Interface

La fiche municipale affiche uniquement les actions compatibles avec l’état courant et le rôle connecté. Après succès, le registre et le détail sont invalidés puis rechargés. Les motifs de refus et de fermeture sont visibles dans la chronologie.

## Barrières

- aucune transition hors du graphe autorisé;
- aucune recherche de permis sans `municipalityId`;
- aucun refus ou fermeture sans motif d’au moins trois caractères;
- aucune décision sensible pour le rôle `VIEWER`;
- tests backend et frontend obligatoires avant fusion.
