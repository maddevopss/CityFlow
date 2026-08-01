# Durcissement de sécurité — Inspections

## Principes

Les limites sont appliquées côté serveur, par municipalité et par identité authentifiée. Le frontend ne constitue jamais une barrière de sécurité.

## Quotas initiaux

| Opération | Limite | Fenêtre |
|---|---:|---:|
| lecture de listes | 300 | 5 minutes |
| création d’inspection | 60 | 10 minutes |
| affectation | 120 | 10 minutes |
| clôture | 60 | 10 minutes |
| enregistrement de preuves | 100 | 10 minutes |
| synchronisation hors ligne | 20 lots | 5 minutes |
| génération de rapport | 30 | 10 minutes |
| distribution de notification | 50 | 10 minutes |

Une réponse de dépassement utilise HTTP `429`, fournit `Retry-After`, un code stable `INSPECTION_QUOTA_EXCEEDED` et ne révèle aucun détail interne.

## Limites de charge

- taille JSON maximale : 256 Kio;
- lot de synchronisation : 50 opérations;
- preuve : métadonnées seulement, fichier maximal déclaré de 25 Mio;
- notes : 4 000 caractères;
- constats : 8 000 caractères;
- recherche : 100 caractères;
- pagination : 100 éléments;
- optimisation de tournée : 100 arrêts;
- aucune chaîne de contrôle ou caractère nul accepté.

## Validation complémentaire

- refuser les dates invalides ou excessivement éloignées;
- refuser une clôture antérieure à la création;
- normaliser les espaces et conserver les valeurs canoniques;
- valider les UUID avant toute requête;
- refuser les types MIME non autorisés;
- vérifier l’empreinte SHA-256 sur 64 caractères hexadécimaux;
- empêcher les clés de stockage avec traversée de chemin;
- limiter les changements d’état aux transitions autorisées;
- utiliser une réponse `404` uniforme pour les ressources hors municipalité.

## Résilience et abus

- délais d’attente obligatoires pour les adaptateurs externes;
- idempotence pour synchronisation, notification et génération de rapport;
- circuit ouvert après échecs répétés d’un fournisseur;
- journalisation structurée des refus sans contenu sensible;
- quotas configurables par environnement mais jamais désactivés en production.

## Critères d’acceptation

1. Chaque endpoint critique possède une limite documentée et testée.
2. Les dépassements retournent `429` et `Retry-After`.
3. Les validations échouent avant toute mutation.
4. Les tests couvrent l’isolation municipale, les transitions invalides et les charges maximales.
5. Aucun secret, jeton ou contenu de preuve n’apparaît dans les erreurs.
