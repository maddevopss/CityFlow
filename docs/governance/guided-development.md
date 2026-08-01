# Développement guidé par la traçabilité

## Statut

**ACTIF — OUTIL DE PRÉPARATION, PAS AUTORITÉ D’ENREGISTREMENT**

## Objet

Réduire les oublis au démarrage d’une fonctionnalité en générant un dossier de travail cohérent avant l’implémentation et avant l’enregistrement officiel des identifiants dans les catalogues du bloc E.

## Commande

```bash
node scripts/scaffold-feature.mjs \
  --title "Gestion des inspections" \
  --owner "Équipe CityFlow" \
  --objective "Planifier, réaliser et valider les inspections municipales."
```

La sortie par défaut est `docs/feature-work/<slug>/`.

## Contenu généré

- `feature-manifest.json` : identité, statut, propriétaire, objectif et identifiants provisoires;
- `traceability.md` : questions de conception et chaîne proposée;
- `pr-body.md` : brouillon conforme au contrat de gouvernance vivante;
- `review-checklist.md` : dix contrôles avant enregistrement.

## Cycle obligatoire

1. Générer le dossier de travail.
2. Compléter l’objectif, la portée, les exclusions, les critères et le retour arrière.
3. Faire réviser la décision, le risque, le test, la preuve et la validation attendue.
4. Enregistrer des identifiants officiels et uniques dans les catalogues `docs/traceability/`.
5. Remplacer tous les identifiants `*-DRAFT-*` dans le dossier et dans le corps de PR.
6. Implémenter et produire les preuves.
7. Ouvrir la PR réelle; le workflow `PR governance` vérifie les identifiants officiels.

## Règles de sécurité

- aucun chemin absolu ou hors dépôt;
- aucune écriture dans `.git`;
- aucun écrasement sans `--force`;
- slug limité aux caractères `a-z`, `0-9` et tirets simples;
- aucune mutation automatique des catalogues institutionnels;
- aucune fusion autorisée avec des identifiants provisoires.

## Validation

Le script `scripts/validate-feature-work.mjs` contrôle tous les dossiers présents dans `docs/feature-work/`. La suite CI teste également la génération nominale, l’écrasement interdit, la traversée de chemin et les slugs invalides.

## Limites

Le générateur prépare une structure cohérente. Il ne décide pas de la valeur métier, de l’architecture, du niveau de risque, de la suffisance des tests ou de l’acceptabilité des preuves.

## Barrière finale

Un dossier généré est un brouillon de travail. Il ne crée aucune exigence, décision, autorisation ou preuve officielle tant que les identifiants n’ont pas été enregistrés et approuvés humainement.
