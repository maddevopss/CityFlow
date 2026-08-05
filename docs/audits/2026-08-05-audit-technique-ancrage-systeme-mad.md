# Audit technique CityFlow et vérification de l'ancrage SYSTEME_MAD

- **Date** : 2026-08-05
- **Portée** : `backend/`, `frontend/`, CI GitHub Actions, `docs/integration-systeme-mad/`, registres T, matrices M, gouvernance documentaire
- **Méthode** : installation réelle des dépendances (`npm ci`) et exécution effective des suites de tests, du lint et de `node scripts/validate-systeme-mad-alignment.mjs`, dans les deux dépôts (`backend/`, `frontend/`) ; inspection de l'historique Git et des exécutions GitHub Actions réelles sur `main` (API `actions_list`) ; lecture croisée de `SYSTEME_MAD` (dépôt `maddevopss/SYSTEME_MAD`) et du manifeste d'alignement de CityFlow. Aucun accès à un environnement PostgreSQL/Redis réel : les résultats de tests d'intégration rapportés ci-dessous proviennent de l'exécution de la suite Jest telle que configurée par le dépôt (mocks Prisma), pas d'un environnement de production.
- **Hors périmètre** : test de charge, revue de dépendances tierces (CVE), audit juridique des obligations municipales.
- **Suite de** : `docs/audits/2026-07-31-audit-qualite-code.md` — les six constats de cet audit précédent ont été vérifiés un par un (voir §1).

## Résumé exécutif

Le constat de l'audit du 31 juillet reste valide sur le fond : l'architecture backend est sérieusement pensée (outbox transactionnel, HMAC en temps constant, transitions auditées, SLA de diffusion). Les six écarts qu'il relevait ont bien été corrigés par les PR #687, #688 et #691. **Mais le correctif de sécurité qui a fermé C1/H1/H2 (PR #687, commit `315bbc5`) a introduit une régression qui casse aujourd'hui l'intégralité de l'API** : le middleware CSRF (`lusca.csrf`) exige `req.session`, qu'aucune session Express n'initialise. Résultat vérifié : la CI backend (`backend-ci.yml`) est **rouge sur `main` depuis 4 commits consécutifs** (`315bbc5` → `01d1006`, le HEAD actuel), et une reproduction locale confirme que toutes les routes de l'API renvoient `500` au lieu du code attendu.

Cette régression n'a pas été détectée par les tests de sécurité pourtant écrits pour ce périmètre, parce qu'ils ne s'exécutent jamais : `jest.config.js` restreint la découverte des tests à `backend/tests/`, alors que 11 fichiers de tests de sécurité (471 lignes, couvrant précisément auth, exports, métriques, opérations, notifications) vivent dans `backend/src/` et ne sont inclus ni par `npm test` ni par la commande que `SECURITY_AUDIT_CLOSEOUT.md` recommande d'exécuter.

**Ajout post-publication (2026-08-05, après ouverture de la PR #692)** : l'exécution réelle du workflow `migration-readiness.yml` sur cette PR a révélé un troisième défaut critique, indépendant des deux précédents : la chaîne de migrations Prisma elle-même est cassée sur `main`. Voir C3 ci-dessous.

Sur le second volet demandé — l'ancrage des spécifications SYSTEME_MAD — le résultat est net : le mécanisme formel est solide et passe sa propre validation (`node scripts/validate-systeme-mad-alignment.mjs` → SUCCÈS, 8 correspondances). Mais l'ancrage reste **structurel, pas encore opérationnel** : les registres T qui devraient porter la preuve vivante de cet alignement (T1 décisions, T2 risques, T13 audits) sont encore à l'état d'échafaudage vide, y compris pour un audit réel déjà produit (celui du 31 juillet, jamais consigné en T13). Ce rapport corrige cet écart en inscrivant les deux audits et les deux risques critiques identifiés ici dans les registres correspondants (§4).

| Sévérité | Nombre de constats | Statut |
|---|---:|---|
| Critique | 3 | **3 corrigés et vérifiés** (§2, addendum du 2026-08-05) |
| Élevée | 2 | 1 corrigé (H1), 1 tel quel (M1/M2/M3 sont classés Moyenne, voir plus bas) |
| Moyenne | 3 | ouverts, hors urgence |

**Addendum 2026-08-05 (même journée, après la première publication de ce rapport)** : à la demande explicite de correction, C1, C2 et C3 ont été corrigés dans cette même PR #692 et revérifiés par exécution réelle (voir le détail dans chaque section et §4bis). Le texte ci-dessous conserve la description originale des constats tels que découverts, pour la traçabilité ; les blocs « Correctif appliqué » indiquent ce qui a été fait.

## 1. Suivi de l'audit du 31 juillet 2026

| Constat original | Statut vérifié | Preuve |
|---|---|---|
| C1 — pas de capture des erreurs async | **Corrigé** | `express-async-errors` requis dans `app.js:2` ; `process.on('unhandledRejection'/'uncaughtException')` dans `server.js` et `worker.js` |
| H1 — lint cassé, pas de config ESLint | **Corrigé** (config présente) mais **dégradé** — voir C2 ci-dessous | `backend/.eslintrc.json`, `frontend/.eslintrc.json` présents |
| H2 — aucune CI frontend | **Corrigé** | `frontend-ci.yml` existe et est vert sur `main` depuis le 2026-08-04 (run `30913090241`) |
| H3 — `eventService.js` mort dupliquant `events.js` | **Corrigé** | fichier absent de `backend/src/services/` |
| M1 — `WAZE_CCP_URL` hors config centrale | Non revérifié en détail (hors priorité de cet audit) | — |
| M2 — notifications non implémentées | Non revérifié en détail | — |
| M3 — dépendances déclarées non utilisées | **Partiellement corrigé** — `winston` et `express-rate-limit` sont maintenant utilisés (`logger.js`, `rateLimiters.js`) | — |

## 2. Constats de cet audit

### C1 — Critique : régression CSRF/session — l'API backend renvoie 500 sur toute requête, CI rouge sur `main`

**Où** : `backend/src/app.js:67-70` ajoute `app.use(lusca.csrf({ key: '_csrf', secret: ... }))` de façon globale, introduit par le commit `315bbc5` (« fix(security): Phase 1 »). Aucun middleware de session (`express-session` ou équivalent) n'est monté avant lui, et le paquet n'est même pas une dépendance déclarée.

**Preuve** :
- exécution réelle de la CI GitHub Actions sur `main` : `backend-ci.yml` échoue sur les 4 derniers commits (`315bbc5`, `efea05f`, `539b83e`, `01d1006` — HEAD actuel), après avoir été vert sur tous les commits précédents ;
- reproduction locale : `npm ci && npm test` (backend) → **24 suites échouent sur 56, 161 tests échouent sur 317**, toutes les intégrations passant par `supertest(app)` renvoyant `500` au lieu du code attendu (ex. `tests/app.healthchecks.test.js` attend `503`, reçoit `500` ; `tests/unit/geojsonExport.test.js` attend `200`/`400`, reçoit `500`) ;
- log applicatif capturé pendant la reproduction : `lusca requires req.session to be available in order to maintain state`, levée dans `lusca/lib/token.js` à chaque requête.

**Pourquoi c'est critique** : le dépôt se déclare « version 1.0.0 — candidate livrable pour un projet pilote municipal » (`README.md`). Dans son état actuel sur `main`, **aucune route de l'API ne répond correctement** — pas seulement celles protégées par authentification, mais aussi `/health/ready` et l'export GeoJSON public. Ce n'est pas un risque : c'est une panne totale déjà mergée sur la branche de référence, invisible uniquement parce que personne n'a encore déployé ce commit ou consulté le statut CI.

**Recommandation** : traiter en urgence avant toute autre livraison. Deux voies possibles, à trancher explicitement (décision architecturale, pas un simple correctif) :
1. monter une session (`express-session`, store Redis puisqu'il est déjà dans la pile) avant `lusca.csrf` ;
2. remplacer `lusca.csrf` par une protection CSRF sans état (double-submit cookie) cohérente avec une API JWT/Bearer qui n'a par ailleurs aucune autre notion de session serveur.
La deuxième option évite d'introduire un état serveur pour une API qui jusqu'ici n'en avait pas. Dans les deux cas, la correction doit être validée par les tests de sécurité existants une fois C2 corrigé.

**Correctif appliqué (2026-08-05)** : option 2, avec un défaut supplémentaire corrigé en chemin. En creusant l'option 2, il s'est avéré que `POST /auth/login` et `POST /auth/refresh` ne posaient en réalité **jamais** le cookie `accessToken` httpOnly que `authenticate` (middleware) et le frontend (`frontend/src/services/api.ts`, `withCredentials: true`, commentaire « Token is now stored as httpOnly cookie by the backend ») attendaient déjà — la migration vers l'authentification par cookie annoncée dans le message du commit `315bbc5` (« Migrated JWT tokens from localStorage to httpOnly cookies ») n'avait donc jamais été terminée côté serveur. Correctifs :
- `backend/src/api/routes/auth.js` : `/login` et `/refresh` posent maintenant le cookie `accessToken` (httpOnly, `secure` en production, `sameSite: 'lax'`, expiration alignée sur le jeton) ; `/logout` le retire. Le jeton continue d'être renvoyé dans le corps JSON pour les clients Bearer (tests, intégrations tierces).
- `backend/src/app.js` : `lusca.csrf` retiré, avec la dépendance `lusca` (package.json + lockfile). La protection CSRF réelle devient l'attribut `SameSite=lax` du cookie — il bloque les requêtes de mutation cross-site (fetch/XHR/formulaire) sans nécessiter de session serveur ni de jeton `_csrf` que le frontend n'a jamais été câblé pour envoyer.
- Vérifié : `npm test` (backend) → 346/346 tests passent (voir C2) ; démarrage réel de l'app sans erreur `lusca requires req.session`.

### C2 — Critique : 11 fichiers de tests de sécurité (471 lignes) ne s'exécutent jamais, ni localement ni en CI

**Où** : `backend/jest.config.js:3` fixe `roots: ['<rootDir>/tests']`. Or `backend/src/app.auth.security.test.js`, `app.citizen-messages.security.test.js`, `app.citizen-operations-security-bundle.test.js`, `app.events.rate-limit.security.test.js`, `app.exports.security.test.js`, `app.inspection-reminders.security.test.js`, `app.inspection-security-bundle.test.js`, `app.metrics.security.test.js`, `app.notifications.security.test.js`, `app.operations.rate-limit.security.test.js` et `app.release-readiness.test.js` vivent tous sous `backend/src/`, hors de ce `root`.

**Preuve** : `npx jest --listTests` ne retourne que 56 fichiers, tous sous `tests/`, zéro sous `src/`. La commande explicitement recommandée par `backend/SECURITY_AUDIT_CLOSEOUT.md` (« Validation ciblée ») — `npx jest src/app.auth.security.test.js ... --runInBand` — a été exécutée telle quelle : **`No tests found, exiting with code 1`**. En forçant leur exécution (`--roots '<rootDir>/tests' '<rootDir>/src'`), les 11 suites échouent intégralement (29/29 tests), pour la même cause racine que C1.

**Pourquoi c'est critique** : ce sont précisément les tests censés garantir la non-régression du durcissement de sécurité des phases 1 et 2. Leur silence explique directement pourquoi C1 a pu être mergé sans alerte : le filet de sécurité existe sur le papier (471 lignes écrites, une procédure de validation documentée) mais n'a jamais réellement tourné.

**Recommandation** : corriger `roots` (ou déplacer ces fichiers sous `tests/security/`, plus conforme à la convention du reste du dépôt), les intégrer à `backend-ci.yml`, puis les faire tous passer avant de clore C1.

**Correctif appliqué (2026-08-05)** : `backend/jest.config.js` découvre maintenant `<rootDir>/tests` **et** `<rootDir>/src`. Une fois exécutés pour de vrai, ces 11 fichiers ont révélé leurs propres défauts — la confirmation la plus directe que « jamais exécuté » n'équivaut pas à « correct » :
- `app.metrics.security.test.js` : jetons de test signés avec la revendication `id` au lieu de `sub` (attendue par `authenticate`), et absence totale de mock Prisma — `prisma.user.findUnique` échouait silencieusement, produisant un `401` au lieu du `403`/`200` attendu. Corrigé (revendication `sub`, mock `user.findUnique` par scénario).
- `app.notifications.security.test.js` : mock Prisma incomplet (ne couvrait pas `user.findUnique`, utilisé par `authenticate`). Corrigé.
- 17 occurrences dans 10 fichiers asserraient `response.headers.ratelimit` — un en-tête combiné qui n'existe plus depuis `express-rate-limit` v7 (`standardHeaders: true` envoie désormais `RateLimit-Limit`, `RateLimit-Remaining`, etc., pas `RateLimit`). Corrigé vers `response.headers['ratelimit-limit']`.
- Effet de bord découvert en cours de route, sans rapport avec C1/C2 : `tests/integration/inspection-trends.test.js` attendait un rejet `400` pour `months=24`, alors que `inspectionTrends.js` autorisait jusqu'à `24`. Le frontend (`InspectionTrends.tsx`) n'offre que 3/6/12 mois : la borne serveur était trop permissive. Corrigée à `max(12)`.

Vérifié : `npm test` → **346 tests passent sur 346, 67 suites sur 67** (contre 56 suites/317 tests visibles avant ce correctif).

### C3 — Critique : la chaîne de migrations Prisma est cassée sur `main` — un déploiement sur base neuve échoue

**Où** : `backend/prisma/migrations/20260730000000_init_core/` et `backend/prisma/migrations/20260730000000_initial/` portent le même horodatage et créent toutes les deux, de façon quasi identique, les tables `Municipality`, `User` et `RoadEvent`. Prisma les applique dans l'ordre lexicographique du nom de dossier (`init_core` avant `initial`), et le fait que ni `check-migrations.mjs` ni la CI habituelle ne détectent le problème.

**Preuve** : découverte en observant l'exécution réelle du workflow `migration-readiness.yml` (déclenché par la présente PR, car il ne tourne que sur `pull_request` — jamais sur push vers `main`, donc jamais vérifié en continu). Sortie exacte :
```
Applying migration `20260730000000_init_core`
Applying migration `20260730000000_initial`
Error: P3018
Database error code: 42P07
Database error: relation "Municipality" already exists
```
Le second migration échoue car le premier a déjà créé les mêmes tables. `20260730000000_init_core` a été ajouté très récemment (commit `c0ce1f5`, 2026-08-03, message « fix:migration/20260730000000_init_core »), après deux tentatives de correction d'ordre de baseline (`184e309`, `63bb0d4`) qui n'ont manifestement pas résolu le problème.

**Pourquoi c'est critique** : `prisma migrate deploy` sur une base de données neuve — exactement le scénario d'un nouvel environnement, d'un onboarding municipal ou d'une restauration — échoue immédiatement et bloque tout démarrage. Combiné à C1, cela signifie qu'aujourd'hui, sur `main`, ni le déploiement initial (schéma) ni le fonctionnement de l'API (CSRF/session) ne sont opérationnels sur un environnement neuf.

**Recommandation** : décider laquelle des deux migrations constitue la vraie baseline historique et supprimer l'autre (ou fusionner leurs différences réelles — `RoadEvent.status` a un défaut `'ACTIVE'` dans l'une et `'PLANNED'` dans l'autre, ce qui n'est pas qu'un problème de formatage). Vérifier au préalable qu'aucun environnement réel n'a déjà appliqué `20260730000000_init_core` avant de la retirer. Ajouter ensuite `migration-readiness.yml` comme vérification obligatoire avant fusion, pas seulement informative.

**Correctif appliqué (2026-08-05)** : `20260730000000_initial` a été conservée comme baseline (nom conventionnel, commentaire d'origine historique « Baseline schema at commit 1178b56 », `id` sans défaut base de données — cohérent avec `@default(uuid())` généré côté Prisma Client). `20260730000000_init_core` a été supprimée. La seule chose réellement nécessaire qu'elle apportait — `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`, requise par trois migrations ultérieures (`add_permit_fees`, `add_permit_issuance`, `add_inspection_reminders`) qui utilisent `gen_random_uuid()` sans la recréer — a été déplacée en tête de `20260730000000_initial`. Les différences de defaults (`status`) n'avaient pas d'incidence : `20260731005500_add_road_event_lifecycle` les écrase explicitement (`SET DEFAULT 'DRAFT'`) juste après.

Vérifié en conditions réelles (PostgreSQL 16 local, pas seulement en mock) : `npm run prisma:migrate:deploy` sur une base neuve applique les 24 migrations restantes sans erreur, et `npx prisma migrate status` confirme « Database schema is up to date! ». `node scripts/release/check-migrations.mjs` rapporte `{"count": 24, "duplicates": []}`.

### H1 — Élevée : configuration ESLint backend incomplète — 162 faux positifs masquent 3 vrais signalements

**Où** : `backend/.eslintrc.json` ne déclare pas d'environnement `jest` ni de bloc `overrides` pour les fichiers `*.test.js`. `npm run lint` (exécuté réellement, dépendances installées) produit **168 erreurs** : 162 sont des `no-undef` sur `describe`/`it`/`expect`/`jest`/`beforeEach` dans les fichiers de test (y compris les 11 fichiers orphelins de C2), et seulement 6 sont substantielles.

**Impact** : le bruit rend le lint inutilisable en l'état — personne ne peut distinguer un vrai problème dans ces 168 lignes. Les 6 erreurs réelles sont dignes d'intérêt :
- `backend/src/services/citizenPortal.js:76` et `backend/src/services/globalSearch.js:42` : déstructuration intentionnelle pour retirer des champs sensibles (`ignoredEvents`/`ignoredMessages`, `municipalityId`/`privateNotes`/`internalMetadata`) avant de renvoyer un objet « safe ». Le code est correct, mais la règle `no-unused-vars` ne connaît pas `ignoreRestSiblings: true` — à ajouter dans la config plutôt que de laisser croire à du code mort.
- `backend/src/api/middleware/rateLimiters.js:9` : `redisConnected` assigné mais jamais lu — celui-là est un vrai reliquat à vérifier.

**Recommandation** : ajouter `"env": { "jest": true }` en `overrides` sur `**/*.test.js`, et `"ignoreRestSiblings": true` à la règle `no-unused-vars`. Ajouter ensuite `npm run lint` comme étape de `backend-ci.yml` (H2 de l'audit précédent avait corrigé ce point côté frontend uniquement).

**Correctif appliqué dans ce même changement** : la configuration ci-dessus a été ajoutée à `backend/.eslintrc.json`. `npm run lint` ne remonte désormais plus qu'une seule erreur réelle : `backend/src/api/middleware/rateLimiters.js:9`, où `redisConnected` est positionné par les gestionnaires d'événements Redis mais n'est lu nulle part (ni exposé sur `/health`, ni utilisé pour dégrader le comportement) — signalé pour décision, non corrigé ici car cela suppose de décider où exposer cet état. L'intégration de `npm run lint` à `backend-ci.yml` reste à faire.

### M1 — Moyenne : dépôt source SYSTEME_MAD épinglé sous un nom d'organisation qui n'est plus l'origine active

**Où** : `docs/integration-systeme-mad/systeme-mad-alignment.json` épingle `bleeband/SYSTEME_MAD@3a03d95f...`. Le hash est exact et vérifié (`git show -s` dans le dépôt `SYSTEME_MAD` local confirme ce commit, daté du 2026-07-31). Mais le remote `origin` du dépôt SYSTEME_MAD réellement accessible aujourd'hui est `maddevopss/SYSTEME_MAD` — `bleeband` apparaît dans SYSTEME_MAD comme l'identité institutionnelle historique (CODEOWNERS, roadmaps), pas comme une erreur de frappe.

**Impact** : c'est cohérent et volontaire (le script de validation exige littéralement `bleeband/SYSTEME_MAD`), mais quiconque tente de re-vérifier l'ancrage en clonant `bleeband/SYSTEME_MAD` sans connaître cet historique risque de ne pas trouver le dépôt. Le hash de commit reste la garantie réelle ; le nom de dépôt est une référence documentaire qui peut dérouter.

**Recommandation** : ajouter une note dans `docs/integration-systeme-mad/README.md` précisant que `bleeband/SYSTEME_MAD` est le nom historique et que le dépôt est aujourd'hui hébergé sous `maddevopss/SYSTEME_MAD`, pour que la traçabilité reste exploitable sans connaissance tacite.

### M2 — Moyenne : les registres T censés porter la preuve de l'ancrage sont encore vides, y compris pour un audit déjà réalisé

**Où** : `docs/registres/t13-registre-audits.md` porte le statut **« REGISTRE INITIALISÉ — AUCUN AUDIT RÉEL CONSIGNÉ »** et une table « Registre » sans aucune ligne, alors qu'un audit réel (`docs/audits/2026-07-31-audit-qualite-code.md`, 6 constats, actions correctives fusionnées) existe depuis 5 jours. De même, `docs/registres/t1-registre-decisions.md` et `t2-registre-risques.md` ne contiennent qu'une ligne placeholder (« Registre initialisé », « non évalué »), et `docs/traceability/requirements.json` ne trace qu'une seule exigence (`REQ-CF-GOV-001`, portant sur la gouvernance elle-même, pas sur un parcours métier livré comme les permis ou les inspections).

**Impact** : le manifeste d'alignement SYSTEME_MAD (`systeme-mad-alignment.json`) affirme que « les décisions, risques, obligations » de CityFlow sont reliés à des mécanismes locaux vivants (T1, T2, T13...). C'est vrai de la structure des fichiers (ils existent, ils passent `validate-live-registers.mjs`), mais pas encore de leur contenu : la preuve institutionnelle que SYSTEME_MAD exige (« aucune conclusion sans preuve proportionnée », SMAD-PRV-001) n'est pas encore alimentée par l'activité réelle du projet (24+ PR fusionnées, 3 phases de sécurité, migrations, cet audit-ci).

**Recommandation** : ce rapport corrige une partie de cet écart en inscrivant les deux audits et les deux risques critiques (C1, C2) dans T13 et T2 (§4). Il reste à établir une pratique récurrente — par exemple une étape de checklist en fin de PR — pour que chaque décision, risque et audit réel soit consigné au moment où il se produit, plutôt que rétroactivement.

### M3 — Moyenne : masse documentaire de gouvernance très supérieure à la surface fonctionnelle livrée

**Où** : le dépôt compte 77 workflows GitHub Actions et plus de 300 fichiers sous `docs/` (checklists, matrices, référentiels, modèles, registres, produit) pour une application couvrant 11 modèles Prisma, 2 modules de domaine et 19 pages frontend. Les documents `docs/product/*-2x.md` (ex. `gestion-couts-2x.md`, `obligations-legales-2x.md`) sont des cadres génériques (aucune donnée, aucun montant, aucun identifiant réel) plutôt que des spécifications produit instanciées.

**Impact** : ce n'est pas un défaut en soi — c'est le modèle SYSTEME_MAD, conçu pour poser le cadre avant l'exécution. Mais le risque est de confondre l'existence du cadre avec sa mise en œuvre (cf. M2), et de consommer un temps d'ingénierie disproportionné à maintenir la cohérence de 77 workflows de gouvernance (`validate-*.mjs`, `*-readiness.yml`...) pendant qu'une régression totale de disponibilité (C1) reste 4 commits sans correction sur la branche principale.

**Recommandation** : aucune action corrective requise dans l'immédiat ; signalé pour arbitrage de priorité entre gouvernance documentaire et stabilité opérationnelle du service livré.

## 3. Ancrage des spécifications SYSTEME_MAD — évaluation détaillée

Validation automatique exécutée réellement pendant cet audit :

```
$ node scripts/validate-systeme-mad-alignment.mjs
Validation de l'alignement SYSTEME_MAD: SUCCÈS (8 correspondances)
Source épinglée: bleeband/SYSTEME_MAD@3a03d95fa435e911149c05081e1c0a2d3e20bcb9
```

Éléments vérifiés au-delà du simple passage du script :

| Élément | Constat |
|---|---|
| Commit épinglé | Vérifié réel : `3a03d95fa435e911149c05081e1c0a2d3e20bcb9` existe bien dans l'historique de `SYSTEME_MAD`, daté du 2026-07-31 |
| Non-héritage automatique | `policy.automaticInheritance: false`, `humanApprovalRequired: true` — conforme au principe SYSTEME_MAD de non-substitution du jugement humain |
| Couverture par famille documentaire | Les 4 familles (R, T, C, M) sont bien représentées dans les 8 correspondances (`mappings`) | 
| Réciprocité déclarative | Chaque `localDocuments` cité existe réellement sur disque (vérifié par le script, confirmé manuellement pour 4 des 8 correspondances) |
| Barrière finale et limites | Présentes et honnêtes — le README reconnaît explicitement que la validation ne vérifie pas le contenu distant de SYSTEME_MAD |
| Alimentation réelle des registres cités | **Insuffisante** — voir M2 : T1/T2/T13 sont référencés comme preuve d'ancrage mais restent quasi vides |
| Cohérence du nom de dépôt source | Voir M1 — mineur, hash correct |

**Conclusion sur l'ancrage** : le mécanisme d'ancrage est bien conçu et honnête sur ses propres limites — c'est en soi un signe de maturité institutionnelle plutôt rare. Il est structurellement ancré (fichiers, validation automatique, commit épinglé, revue requise). Il n'est pas encore *opérationnellement* ancré : les registres qui devraient porter la trace vivante des décisions, risques et audits réels de CityFlow restent des coquilles. Ce rapport comble une partie de cet écart immédiatement (§4) et documente pourquoi il subsistait.

## 4. Actions d'ancrage effectuées dans le cadre de cet audit

Pour que ce constat ne reste pas lui-même une observation sans preuve (contraire au principe SMAD-PRV-001 que CityFlow revendique), les entrées suivantes ont été ajoutées aux registres correspondants dans ce même changement :

- `docs/registres/t13-registre-audits.md` : deux lignes — `AUDIT-2026-001` (audit du 2026-07-31, rétroactif) et `AUDIT-2026-002` (cet audit) ;
- `docs/registres/t2-registre-risques.md` : trois lignes — `RSK-2026-001` (régression CSRF/session, C1), `RSK-2026-002` (tests de sécurité non exécutés, C2) et `RSK-2026-003` (chaîne de migrations cassée, C3 — ajoutée après coup, une fois la PR #692 elle-même passée en CI et le workflow `migration-readiness.yml` déclenché).

Ces entrées ne referment pas les risques : elles les rendent visibles et attribuables, conformément au registre lui-même (« aucune absence de risque présumée »).

## 4bis. Clôture des trois risques critiques (même journée, 2026-08-05)

À la demande explicite de correction, RSK-2026-001, RSK-2026-002 et RSK-2026-003 ont été traités dans cette même PR #692 et leur statut a été mis à jour de « ouvert » à « traité » dans `docs/registres/t2-registre-risques.md`, avec les preuves de vérification (tests réels, migration réelle) en colonne Preuves. Conformément au principe de non-masquage de SYSTEME_MAD, les entrées ne sont pas supprimées : elles restent visibles avec leur historique, leur cause et leur correctif.

## 5. Points positifs confirmés

- Le pattern outbox (`backend/src/services/outbox.js`) reste solide (verrouillage `FOR UPDATE SKIP LOCKED`, back-off exponentiel, `dedupeKey`).
- Le frontend est en bon état réel : `npm ci && npx vitest run` → **79 tests passent sur 79** (25 fichiers), `npm run lint` → aucune erreur. La CI frontend est verte sur `main`.
- Les trois PR de durcissement sécurité (#687, #688, #691) ont visiblement traité un vrai audit externe point par point, avec un document de clôture dédié (`SECURITY_AUDIT_CLOSEOUT.md`) — la démarche est la bonne, seule son exécution (C1, C2) a une faille.
- Le mécanisme d'ancrage SYSTEME_MAD assume explicitement ses propres limites plutôt que de surdéclarer une conformité — rare et notable.

## 6. Priorisation recommandée

1. ~~**C3**~~ — corrigé et vérifié le 2026-08-05 (voir §2).
2. ~~**C1**~~ — corrigé et vérifié le 2026-08-05 (voir §2).
3. ~~**C2**~~ — corrigé et vérifié le 2026-08-05 (voir §2).
4. ~~**H1**~~ — corrigé et vérifié le 2026-08-05 (voir §2).
5. **M1–M3** — restent ouverts, au fil de l'eau ; M2 a été partiellement traité par ce rapport (§4). Aucun n'est bloquant.

Il ne reste, à l'issue de cet audit, aucun constat critique ou élevé ouvert. Les trois constats moyens (M1, M2, M3) ne remettent pas en cause l'utilisabilité du dépôt et sont documentés pour suivi.

## Limites

Cet audit n'a pas eu accès à un environnement PostgreSQL/Redis réel ni à un déploiement ; les résultats de test proviennent de l'exécution locale de la suite Jest/Vitest telle que configurée par le dépôt, avec mocks Prisma. Il n'a pas revérifié en détail M1/M2 de l'audit du 31 juillet (`WAZE_CCP_URL`, notifications), ni exécuté d'audit de dépendances (CVE). Il n'a pas vérifié le contenu actuel du dépôt `SYSTEME_MAD` au-delà du commit épinglé — conformément à la limite déjà déclarée par `docs/integration-systeme-mad/README.md`.

## Barrière finale

Ce rapport ne démontre que ce qui a été effectivement exécuté et observé aux dates indiquées. L'absence de constat sur un périmètre non couvert (dépendances tierces, charge, conformité juridique) ne vaut pas conformité de ce périmètre.
