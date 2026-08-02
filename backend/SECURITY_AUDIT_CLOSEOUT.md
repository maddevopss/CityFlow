# Clôture de l’audit de sécurité backend

## Portée

Cette clôture couvre les contrôles serveur prioritaires identifiés pendant la stabilisation : authentification, autorisations, isolation municipale, routes publiques, validation des entrées et limitation de débit.

## Authentification

- Les jetons utilisent `sub` comme identifiant utilisateur canonique.
- `POST /api/v1/auth/login` valide et normalise l’adresse courriel et borne la longueur du mot de passe.
- Les réponses d’échec de connexion demeurent volontairement génériques.
- `GET /api/v1/auth/me` est limité avant authentification.
- Une session dont l’utilisateur n’existe plus retourne `401` au lieu de `200 null`.

## Autorisations et isolation municipale

Les routes internes examinées utilisent les données du jeton côté serveur et ne font pas confiance à un identifiant municipal fourni par le client :

- événements et transitions;
- historique d’audit des événements;
- métriques HTTP;
- opérations de diffusion;
- alertes opérationnelles;
- permis et demandes citoyennes déjà protégés par leurs limiteurs dédiés.

Les recherches sensibles utilisent `req.user.municipalityId` afin d’empêcher les accès intermunicipaux.

## Routes publiques

### `/health`

- publique par conception;
- réponse minimale;
- aucune donnée métier ou configuration exposée.

### `/api/v1/exports/geojson`

- publique par conception;
- limitée aux événements `PLANNED` et `ACTIVE`;
- sélection explicite des champs retournés;
- validation stricte de `municipalityId` et `eventType`;
- cache public court;
- limitation de débit avant accès aux données.

### Webhooks et demandes citoyennes

- protégés par les limiteurs dédiés existants;
- validation et traitements spécifiques conservés dans leurs routes respectives.

## Limitation de débit

Des seuils distincts existent pour :

- connexion et restauration de session;
- lectures publiques;
- métriques;
- événements;
- opérations;
- permis;
- demandes citoyennes;
- webhooks.

Les limiteurs sont placés avant l’authentification lorsqu’ils doivent également couvrir les tentatives anonymes.

## Validation ciblée

Commandes recommandées pour cette PR :

```bash
cd backend
npx jest src/app.auth.security.test.js src/app.exports.security.test.js src/app.metrics.security.test.js src/app.events.rate-limit.security.test.js src/app.operations.rate-limit.security.test.js --runInBand --silent
npm run lint -- --quiet
```

## Limites connues

- Les compteurs `express-rate-limit` utilisent actuellement la mémoire du processus.
- Un stockage partagé sera nécessaire avant un déploiement horizontal multi-instance.
- La rotation de jetons ou les sessions révocables constituent une évolution d’architecture et ne sont pas introduites dans cette stabilisation.
- Aucun comportement métier, schéma de base de données ou contrat de réponse réussi n’est modifié.
