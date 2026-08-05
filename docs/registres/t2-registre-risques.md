# T2 — Registre des risques

## Statut

**REGISTRE VIVANT — AUCUNE ABSENCE DE RISQUE PRÉSUMÉE**

## Objet

Maintenir une vue attribuée et révisable des scénarios pouvant nuire aux citoyens, aux municipalités, aux opérations, aux données, à la sécurité ou à la continuité de CityFlow.

## Portée

Le registre couvre les risques institutionnels, juridiques, humains, techniques, opérationnels, financiers, territoriaux, environnementaux, de sécurité, de vie privée et de données.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | `RSK-AAAA-NNN` unique |
| Scénario | Cause, événement et conséquence possibles |
| Catégorie | Domaine principal du risque |
| Source | Origine du signal ou de l’analyse |
| Actifs touchés | Services, données, personnes ou territoires concernés |
| Probabilité | Échelle définie et justifiée |
| Impact | Échelle définie par dimension |
| Niveau initial | Résultat avant traitements |
| Contrôles existants | Mesures déjà en place et preuves |
| Traitement | éviter, réduire, transférer ou accepter |
| Responsable | Propriétaire du risque |
| Échéance | Date du prochain traitement ou réexamen |
| Niveau résiduel | Niveau après traitements |
| Statut | ouvert, surveillé, accepté, réalisé ou fermé |
| Déclencheurs | Signaux imposant une réévaluation |
| Preuves | Analyses, incidents, tests et décisions liés |

## Entrées

| Identifiant | Scénario | Niveau | Statut | Responsable | Échéance | Traitement | Preuves |
|---|---|---|---|---|---|---|---|
| — | Registre initialisé | non évalué | ouvert | Maintenance CityFlow | Première analyse réelle | À définir | Historique Git |
| RSK-2026-001 | Le middleware `lusca.csrf` (ajouté par le commit `315bbc5`, durcissement sécurité Phase 1) exige `req.session`, absent de la pile Express. Toute requête à l'API backend échoue en `500`. | Critique | ouvert | Équipe backend CityFlow | Avant toute mise en production ou démonstration pilote | Réduire — monter une session (ex. store Redis déjà présent) ou remplacer par une protection CSRF sans état cohérente avec l'authentification par jeton | Run CI `maddevopss/CityFlow` #30916518659 et 3 runs précédents (`efea05f`, `539b83e`, `315bbc5`) — `backend-ci.yml` rouge sur `main` ; reproduction locale documentée dans `docs/audits/2026-08-05-audit-technique-ancrage-systeme-mad.md` |
| RSK-2026-002 | `backend/jest.config.js` restreint la découverte des tests à `tests/` ; 11 fichiers de tests de sécurité (471 lignes) situés sous `backend/src/` ne s'exécutent ni localement (`npm test`) ni en CI, y compris via la commande documentée dans `SECURITY_AUDIT_CLOSEOUT.md`. | Élevé | ouvert | Équipe backend CityFlow | Avant la prochaine PR touchant l'authentification, les webhooks ou la limitation de débit | Réduire — corriger `roots` dans `jest.config.js` ou déplacer les fichiers sous `tests/security/`, puis les intégrer à `backend-ci.yml` | `npx jest --listTests` (0 fichier sous `src/`), `npx jest src/app.auth.security.test.js` (« No tests found ») — documenté dans `docs/audits/2026-08-05-audit-technique-ancrage-systeme-mad.md` |
| RSK-2026-003 | Deux migrations Prisma portant le même horodatage (`20260730000000_init_core` et `20260730000000_initial`) créent toutes deux les tables `Municipality`, `User` et `RoadEvent`. `prisma migrate deploy` sur une base neuve échoue (`P3018` / `42P07 relation "Municipality" already exists`) dès la deuxième migration. | Critique | ouvert | Équipe backend CityFlow | Avant tout nouveau déploiement, onboarding municipal ou restauration | Réduire — déterminer la véritable baseline, supprimer ou fusionner l'autre migration après vérification qu'aucun environnement réel ne l'a déjà appliquée | Workflow `migration-readiness.yml` déclenché par la PR #692 (échec `Error: P3018`) — documenté dans `docs/audits/2026-08-05-audit-technique-ancrage-systeme-mad.md` |

## Règles d’évaluation

- employer des échelles documentées et constantes;
- distinguer faits, hypothèses et incertitudes;
- ne pas réduire un niveau sans preuve du contrôle;
- rendre visible le risque résiduel;
- attribuer toute acceptation à une autorité compétente;
- rouvrir un risque lorsque les hypothèses changent.

## Gouvernance

- propriétaire : responsable de la gestion des risques CityFlow;
- contributeurs : propriétaires de services, données, contrôles et obligations;
- revue : périodique et à chaque incident, changement majeur ou nouvelle obligation;
- conservation : historique complet des niveaux et décisions;
- escalade : tout risque critique sans propriétaire ou échéance bloque la fermeture.

## Preuves attendues

- analyse de scénario;
- justification des niveaux;
- preuve des contrôles;
- décision d’acceptation ou plan de traitement;
- validations de réduction;
- suivi des déclencheurs.

## Barrière finale

Un risque n’est pas maîtrisé parce qu’il figure au registre. Toute réduction, acceptation ou fermeture exige des contrôles démontrés, une autorité attribuée et un suivi vérifiable.
