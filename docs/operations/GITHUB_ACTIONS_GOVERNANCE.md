# Gouvernance GitHub Actions

> **ID document :** CITYFLOW-OPS-CI-001  
> **Statut :** À valider  
> **Propriétaire :** Équipe technique CityFlow  
> **Version :** 1.0.0  
> **Date :** 2026-08-03

## Périmètre

Ce document définit les contrôles minimaux applicables aux fichiers de `.github/workflows/`.

## Exigences

Chaque workflow modifié doit :

- déclarer des permissions globales minimales;
- éviter `pull_request_target`;
- épingler les actions externes sur un SHA Git complet de 40 caractères;
- justifier toute permission `write`;
- utiliser un nom de workflow unique;
- limiter ses déclencheurs et ses chemins au périmètre nécessaire;
- définir une limite de temps raisonnable pour ses jobs;
- éviter les secrets dans les journaux et dans les événements de PR non fiables.

## Porte automatisée

Le workflow `.github/workflows/workflow-compliance.yml` produit deux validations :

1. un inventaire global JSON de tous les workflows;
2. un contrôle strict limité aux workflows modifiés dans la PR.

Le script `scripts/governance/audit-workflows.mjs` détecte :

- permissions globales absentes;
- usage de `pull_request_target`;
- actions externes non épinglées;
- permissions en écriture à justifier;
- noms de workflows dupliqués.

L’inventaire est conservé comme artefact pendant 14 jours.

## Commandes ciblées

```bash
node --check scripts/governance/audit-workflows.mjs
node scripts/governance/audit-workflows.mjs
WORKFLOW_AUDIT_BASE_REF=<sha-base> node scripts/governance/audit-workflows.mjs --changed-only --strict
```

## Gestion des exceptions

Une exception doit être inscrite dans la PR avec :

- la permission ou le déclencheur concerné;
- la raison technique;
- le risque;
- la portée;
- l’approbation requise;
- la mesure compensatoire.

Aucune exception implicite n’est autorisée.

## Traçabilité

- **Exigences :** validation automatique et sécurité des workflows.
- **Décisions :** audit global informatif et contrôle strict des fichiers modifiés.
- **Risques :** les workflows historiques non modifiés peuvent encore contenir une dette signalée dans l’inventaire.
- **Changements :** script d’audit, workflow de conformité et présent document.
- **Tests :** syntaxe Node et exécution ciblée du script.
- **Preuves :** rapport `workflow-compliance.json` et artefact GitHub Actions.
- **Validations :** CI distante requise avant fusion.

## Limites

- Le contrôle repose sur une analyse statique ciblée du YAML.
- Il ne remplace pas une revue humaine des scripts exécutés.
- Les protections de branche configurées dans GitHub ne sont pas versionnées dans ce dépôt.

## Historique

| Version | Date | Changement |
|---|---|---|
| 1.0.0 | 2026-08-03 | Création de la politique et de la porte de conformité. |
