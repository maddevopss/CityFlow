# CityFlow

**Plateforme de gestion dynamique de la voirie (PGDV)**

CityFlow transforme les permis, arrêtés et changements de chantier en information routière structurée, vérifiable et diffusable vers les équipes municipales, les citoyens et les systèmes partenaires.

## Statut

**Version 1.0.0 — candidate livrable pour un projet pilote municipal contrôlé.**

Cette version couvre les parcours essentiels de gestion des événements routiers, permis, inspections, demandes citoyennes, notifications, opérations et diffusion. Son utilisation en production exige l’exécution complète de la checklist de livraison, une base PostgreSQL dédiée, Redis, des secrets robustes et une validation municipale du périmètre pilote.

## Périmètre livré

- gestion des événements routiers et de leur cycle de validation;
- registre des permis, documents, frais et délivrance;
- inspections, affectations, preuves, calendrier, rappels et tendances;
- demandes citoyennes, messages, niveaux de service et escalades;
- notifications et tableaux d’opérations;
- export GeoJSON public contrôlé;
- webhook de permis signé sur le corps brut reçu;
- isolation des données par municipalité;
- authentification, rôles, limitation de débit et journalisation HTTP;
- contrôle de santé versionné sur `/health`.

## Architecture

Le dépôt contient :

```text
backend/     API Node.js/Express, PostgreSQL/Prisma, Redis/BullMQ et Socket.IO
frontend/    Interface React/TypeScript/Vite
scripts/     Vérifications de gouvernance et d’intégrité
```

## Démarrage local

### Prérequis

- Node.js 20 LTS;
- PostgreSQL;
- Redis.

### Backend

```bash
cd backend
cp .env.example .env
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

L’API répond par défaut sur `http://localhost:3000`. Le contrôle de santé est disponible sur `/health` et retourne le nom du service, la version, l’horodatage et l’identifiant de requête.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

## Validation ciblée avant livraison

```bash
cd backend
npx jest src/app.release-readiness.test.js --runInBand --silent
npm run lint -- --quiet

cd ../frontend
npm run build
```

Les tests complets et les contrôles CI demeurent obligatoires avant fusion et création du tag de version.

## Sécurité

Les secrets réels ne doivent jamais être versionnés. Les valeurs de `.env.example` sont uniquement des exemples locaux. Une installation de production doit notamment fournir :

- un `JWT_SECRET` robuste;
- un secret distinct pour le webhook des permis;
- une URL PostgreSQL dédiée;
- une URL Redis protégée;
- une origine frontend explicite;
- HTTPS devant le frontend et l’API.

Les compteurs de limitation de débit sont actuellement locaux au processus. Un stockage partagé est requis avant un déploiement horizontal à plusieurs instances.

## Livraison

Les documents suivants définissent la livraison :

- `docs/releases/CITYFLOW_V1_0_0.md` : périmètre, preuves et limites;
- `docs/releases/DEPLOYMENT_CHECKLIST_V1.md` : étapes de déploiement et retour arrière.

## Contribution

Les changements doivent être réalisés sur une branche dédiée et soumis par pull request. Chaque PR doit expliquer son intention, ses impacts, les validations effectuées et les limites restantes.
