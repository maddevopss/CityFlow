# Validation automatisée de CityFlow

> **ID Document :** OPS-VALIDATION-001  
> **Statut :** Proposition vérifiable  
> **Propriétaire :** Équipe technique CityFlow  
> **Version :** 1.0.0  
> **Date :** 2026-08-03

## Objectif

Fournir une procédure reproductible, ciblée et compatible avec les règles SYSTEME_MAD pour valider CityFlow sans lancer inutilement toutes les suites du dépôt.

## Prérequis

- Node.js 20;
- npm avec prise en charge de `npm ci`;
- Git;
- variables d’environnement de test requises par le backend;
- PostgreSQL et Redis lorsque les tests d’intégration ciblés les exigent.

## Commandes officielles

### Composants modifiés

```bash
VALIDATION_BASE_REF=origin/main node scripts/validate-project.mjs --scope=changed --install
```

### Backend seulement

```bash
node scripts/validate-project.mjs --scope=backend --install
```

### Frontend seulement

```bash
node scripts/validate-project.mjs --scope=frontend --install
```

### Validation explicite des deux composants

```bash
node scripts/validate-project.mjs --scope=all --install
```

`--install` exécute `npm ci --no-audit --no-fund`. Sans cette option, les dépendances déjà présentes sont utilisées.

## Séquence backend

1. lint silencieux;
2. validation du schéma Prisma;
3. tests Jest en série.

La CI backend exécute également `prisma generate` après l’installation propre.

## Séquence frontend

1. cohérence du fichier de verrouillage;
2. lint silencieux;
3. tests Vitest;
4. vérification TypeScript et build Vite;
5. budget de bundle via le script de build existant.

## Gestion des erreurs

- arrêter au premier échec;
- ne pas masquer les erreurs avec `|| true` ou `continue-on-error`;
- ne consulter que les 30 dernières lignes pertinentes du journal;
- corriger uniquement la cause liée au périmètre de la PR;
- ajouter un test de non-régression lorsqu’un bogue est corrigé.

## Preuves attendues

- commande exécutée;
- portée choisie;
- versions Node/npm;
- fichiers modifiés;
- résultat du lint;
- résultat Prisma;
- résultat des tests;
- résultat du build;
- limitations d’environnement.

## Limitations

- l’orchestrateur ne provisionne pas PostgreSQL ni Redis;
- il ne remplace pas les tests E2E nécessitant un environnement complet;
- le mode `changed` exige `VALIDATION_BASE_REF` ou `GITHUB_BASE_SHA`;
- les tests restent ceux définis officiellement dans les composants.

## Traçabilité

- **Exigences :** procédure reproductible, installation propre, lint, tests, TypeScript, build, Prisma et documentation.
- **Décisions :** orchestrateur Node multiplateforme; portée ciblée par défaut; arrêt au premier échec.
- **Risques :** dépendances externes de test non provisionnées automatiquement.
- **Changements :** script racine, CI backend et présent document.
- **Tests :** commandes officielles décrites ci-dessus.
- **Preuves :** sorties locales ou GitHub Actions.
- **Validations :** exécution réelle encore requise dans un environnement disposant du dépôt.

## Historique

| Version | Date | Changement |
|---|---|---|
| 1.0.0 | 2026-08-03 | Procédure initiale reproductible |
