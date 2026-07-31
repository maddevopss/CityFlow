# CityFlow

**Plateforme de gestion dynamique de la voirie (PGDV)**

CityFlow transforme les permis, arrêtés et changements de chantier en information routière structurée, vérifiable et diffusable vers les équipes municipales, les citoyens et les systèmes partenaires.

## Statut

CityFlow est actuellement un prototype en phase de fondation. Il ne doit pas encore être utilisé pour publier de l'information routière de production.

## Objectifs

- centraliser les entraves et événements de voirie;
- maintenir une source officielle par municipalité;
- produire des flux géographiques normalisés;
- conserver l'historique des validations et publications;
- simplifier les confirmations des entrepreneurs;
- réduire le délai entre une décision municipale et sa diffusion.

## Architecture actuelle

Le dépôt contient un service backend Node.js basé sur Express, PostgreSQL/Prisma, Redis/BullMQ et Socket.IO.

```text
backend/
├── prisma/       Schéma et données de développement
├── src/api/      Routes et middlewares HTTP
├── src/services/ Services métier et diffusion
├── src/workers/  Traitements asynchrones
└── tests/        Tests Jest et Supertest
```

## Démarrage local

### Prérequis

- Node.js 20 ou une version LTS compatible;
- PostgreSQL;
- Redis.

### Installation

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm test
npm run dev
```

L'API répond par défaut sur `http://localhost:3000`. Le contrôle de santé est disponible sur `/health`.

## Sécurité

Les secrets réels ne doivent jamais être versionnés. Les valeurs de `.env.example` sont uniquement des exemples locaux. Toute configuration de production devra refuser de démarrer lorsqu'un secret obligatoire est absent ou faible.

## Feuille de route immédiate

1. stabiliser le dépôt et l'intégration continue;
2. renforcer l'isolation entre municipalités;
3. sécuriser les webhooks et les connexions temps réel;
4. introduire PostGIS et la validation géographique;
5. implanter le cycle brouillon, validation, approbation et publication;
6. ajouter l'audit et les versions immuables;
7. préparer un projet pilote municipal limité.

## Contribution

Les changements doivent être réalisés sur une branche dédiée et soumis par pull request. Chaque PR doit expliquer son intention, ses impacts, les validations effectuées et les limites restantes.
