# Sécurité — Inspections v1

## Contrôles appliqués

- authentification JWT avant toute route métier;
- autorisation par rôles `ADMIN`, `MUNICIPAL_AGENT` et `INSPECTOR`;
- filtrage systématique par `municipalityId` issu du jeton;
- restriction des inspecteurs à leurs inspections et rappels;
- validation Joi des identifiants et données entrantes;
- empreinte SHA-256 et unicité des références de preuve;
- génération idempotente des rappels.

## Frontières de confiance

Le backend demeure l’autorité d’accès. Les filtres de l’interface ne remplacent jamais les contrôles serveur.

## Risques résiduels

- stockage d’objets et URL signées non inclus;
- analyse antivirus des fichiers non incluse;
- journal d’audit métier détaillé à renforcer;
- revue de sécurité externe non réalisée.
