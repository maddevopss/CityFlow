# Audit de qualité du code — backend/frontend CityFlow

- **Date** : 2026-07-31
- **Portée** : `backend/src`, `frontend/src`, configuration, CI, dépendances
- **Méthode** : lecture exhaustive des routes, services, workers et middlewares backend, du contexte d'authentification frontend, des workflows CI et des `package.json`. Aucune exécution de `npm audit` (pas d'accès réseau au registre npm depuis cet environnement).
- **Hors périmètre** : audit de sécurité formel (secrets, injection, authz fine) — un audit dédié pourra être demandé séparément.

## Résumé exécutif

Le backend est globalement bien structuré (pattern outbox transactionnel, webhook HMAC avec fenêtre de tolérance, transitions d'état auditées, surveillance de SLA de diffusion). Le constat principal n'est pas un manque de conception mais une **dette d'exécution** : un bug systémique de gestion d'erreurs asynchrones qui menace la disponibilité du service, plus plusieurs écarts entre ce que le projet déclare (dépendances, scripts, CI) et ce qui est réellement branché.

| Sévérité | Nombre de constats |
|---|---|
| Critique | 1 |
| Élevée | 3 |
| Moyenne | 4 |

## Constats

### C1 — Critique : aucune capture des erreurs asynchrones dans les routes Express

**Où** : tous les gestionnaires de route (`backend/src/api/routes/auth.js`, `events.js`, `exports.js`, `operations.js`, `permits.js`) sont des fonctions `async` sans `try/catch`, et aucun wrapper (`express-async-errors`, `catchAsync`, etc.) n'est utilisé. Confirmé par recherche : zéro occurrence de `try {` dans `backend/src/api/**`, et le paquet `express-async-errors` n'est pas une dépendance.

**Pourquoi c'est critique** : Express 4 ne transmet pas automatiquement une exception levée dans une fonction `async` à `next(err)`. Un rejet de promesse (ex. `prisma.user.findUnique` qui échoue, une erreur réseau vers Postgres) devient un **rejet de promesse non géré** au lieu d'atteindre `errorHandler` (`backend/src/api/middleware/errorHandler.js`). Aucun gestionnaire `process.on('unhandledRejection', …)` n'existe dans `server.js` ni `worker.js`. Sur Node 20 (utilisé ici, cf. `docker/backend/Dockerfile`), le comportement par défaut d'un rejet non géré est de **terminer le processus**. Toute panne transitoire de la base de données ou du réseau sur n'importe quelle route peut donc faire tomber tout le service API, pas seulement la requête en cours.

**Recommandation** : ajouter `express-async-errors` (ou un wrapper `catchAsync`) à l'initialisation de `app.js`, et ajouter des gestionnaires `unhandledRejection`/`uncaughtException` explicites en dernier filet dans `server.js` et `worker.js`.

### H1 — Élevée : `npm run lint` est cassé, aucune configuration ESLint

**Où** : `backend/package.json` et `frontend/package.json` définissent tous deux un script `lint` (`eslint src/`), et `eslint` figure dans les `devDependencies` des deux paquets. Aucun fichier `.eslintrc*` ni `eslint.config.*` n'existe à la racine de `backend/` ou `frontend/`.

**Impact** : la commande échoue immédiatement (« no ESLint configuration found ») ; le lint n'a probablement jamais tourné avec succès dans ce dépôt. La CI ne l'appelle d'ailleurs pas non plus (voir H2).

**Recommandation** : committer une configuration ESLint minimale par paquet (ou une config partagée), et l'ajouter comme étape de CI.

### H2 — Élevée : aucune CI pour le frontend

**Où** : `.github/workflows/` ne contient que `backend-ci.yml` (tests backend) et `operations-validation.yml` (validation Prometheus/Alertmanager/Grafana). Rien ne déclenche `frontend/` — ni `npm run build` (vérification TypeScript), ni `npm test` (Vitest), ni lint.

**Impact** : une régression TypeScript, un test Vitest cassé, ou une erreur de build peut être fusionnée sur `main` sans qu'aucun signal automatique ne le détecte, alors que l'outillage (Vitest, Testing Library, Cypress) est en place côté `frontend/package.json`.

**Recommandation** : ajouter un workflow `frontend-ci.yml` filtré sur `frontend/**`, exécutant au minimum `npm run build` et `npm test`.

### H3 — Élevée : code mort dupliquant la logique métier avec des garanties plus faibles

**Où** : `backend/src/services/eventService.js` (classe `EventService`) n'est importé par aucune route (vérifié par recherche globale dans `backend/src` : seule référence hors du fichier lui-même est son test `backend/tests/unit/eventService.test.js`).

**Pourquoi c'est un problème** : ce service duplique la création/mise à jour d'événements déjà implémentée correctement dans `backend/src/api/routes/events.js`, mais en plus faible :
- pas de validation Joi ;
- pas de transaction ;
- pas d'écriture dans `EventAudit` (`appendEventAudit`) ;
- pas de dépôt dans l'outbox de diffusion ;
- `findById()` ne filtre pas par `municipalityId`, contrairement à `findMunicipalEvent()` dans les routes.

Le code est aujourd'hui inoffensif car inutilisé, mais il constitue un piège : un futur développeur pressé qui le découvre et le branche à une route réintroduirait silencieusement une régression d'isolation municipale et perdrait la piste d'audit. Le fichier de test associé (76 lignes) donne une fausse impression de couverture sur du code qui ne s'exécute jamais en production.

**Recommandation** : supprimer `eventService.js` et son test, ou le documenter explicitement comme brouillon non branché si une réutilisation future est prévue.

### M1 — Moyenne : accès à la configuration incohérent, secret non documenté

**Où** : `backend/src/config/index.js` centralise et valide les secrets (`requireProductionSecret` impose une longueur minimale en production pour `JWT_SECRET` et `PERMIT_WEBHOOK_SECRET`). Mais `backend/src/services/diffusionService.js:38` lit `process.env.WAZE_CCP_URL` directement, en contournant ce module central. `WAZE_CCP_URL` n'apparaît pas non plus dans `backend/.env.example`, contrairement aux autres variables requises.

**Impact** : rien n'empêche un déploiement en production sans `WAZE_CCP_URL` défini ; `axios.post(undefined, …)` échouera au moment de la diffusion plutôt qu'au démarrage, et personne ne peut découvrir cette variable en lisant `.env.example`.

**Recommandation** : ajouter `wazeCcpUrl` à `config/index.js` (avec validation si nécessaire) et l'ajouter à `.env.example`.

### M2 — Moyenne : notifications non implémentées malgré un schéma qui les prévoit

**Où** : `backend/src/services/notificationService.js` ne contient que des `console.log` marqués `// TODO: Implémenter l'envoi d'email`, pour `notifyAgent()` et `sendToEntrepreneur()`. Le service n'est référencé nulle part ailleurs dans `backend/src` (recherche confirmée). Le schéma Prisma (`RoadEvent.contractorEmail`, `RoadEvent.contractorToken`) et la dépendance `nodemailer` suggèrent pourtant que la notification des entrepreneurs fait partie du flux prévu.

**Impact** : les agents municipaux et entrepreneurs ne reçoivent aujourd'hui aucune notification automatique aux transitions d'état (soumission, rejet, publication), alors que l'architecture (schéma, dépendance) laisse penser que c'est attendu.

**Recommandation** : soit implémenter l'envoi via `nodemailer` et brancher `notifyAgent`/`sendToEntrepreneur` sur les transitions pertinentes de `events.js`, soit retirer le service et la dépendance tant que la fonctionnalité n'est pas priorisée.

### M3 — Moyenne : dépendances déclarées mais jamais utilisées

**Où** : recherche exhaustive de `require(...)` dans `backend/src` pour chaque dépendance de production. Ne sont importés nulle part : `winston`, `express-rate-limit`, `multer`, `node-cron`, `rrule`, `kafkajs`, `mqtt`, `nodemailer`. Soit **8 des 19 dépendances de production** (plus de 40 %) déclarées dans `backend/package.json` ne sont utilisées par aucun fichier source.

**Impact concret par paquet** :
- `winston` : absent, tout le logging passe par `console.log`/`console.error` non structuré (15 occurrences dans 6 fichiers), ce qui complique l'exploitation malgré la stack d'observabilité Prometheus/Grafana déjà en place dans `observability/`.
- `express-rate-limit` : absent, aucune route (y compris `/api/v1/auth/login` et le webhook public `/api/v1/permits/hook`) n'a de limitation de débit malgré la dépendance déclarée.
- `rrule` : le champ `RoadEvent.recurrenceRule` existe dans le schéma et est accepté en entrée (`createSchema` dans `events.js`) mais n'est jamais interprété — les événements récurrents ne sont pas expansés.

**Recommandation** : pour chaque paquet, décider explicitement — l'implémenter (winston pour le logging structuré et express-rate-limit pour `/auth/login` et les webhooks sont les priorités les plus claires) ou le retirer de `package.json`. Le statu quo gonfle la surface de dépendances sans bénéfice.

## Points positifs à noter

- Le pattern outbox (`backend/src/services/outbox.js`) est solide : verrouillage `FOR UPDATE SKIP LOCKED`, back-off exponentiel plafonné, passage en `DEAD` après `MAX_ATTEMPTS`, déduplication par `dedupeKey`.
- Le webhook de permis (`backend/src/api/routes/permits.js`) vérifie signature HMAC en temps constant (`crypto.timingSafeEqual`) et fenêtre de tolérance temporelle — bonne pratique rarement vue à ce niveau de rigueur dans un prototype.
- Les transitions d'état d'événement (`transition()` dans `events.js`) sont transactionnelles et systématiquement auditées via `appendEventAudit`, avec vérification explicite de l'état source autorisé.
- La surveillance de SLA de diffusion (`deliveryServiceLevels.js`, `deliverySlaMonitor.js`) est un ajout mature pour un prototype (percentiles, alertes automatiques, déduplication par `md5(...)::uuid`).

## Priorisation suggérée

1. **C1** — corriger avant toute mise en charge, même en environnement de test : c'est un risque de disponibilité, pas seulement de style.
2. **H2** puis **H1** — rétablir un filet de sécurité CI/lint avant d'accumuler plus de code non vérifié.
3. **H3** — nettoyage à faible risque, à faire dès qu'un créneau se libère.
4. **M1–M3** — à traiter au fil de l'eau, priorité à `express-rate-limit` sur `/auth/login` compte tenu de la surface d'attaque par force brute.
