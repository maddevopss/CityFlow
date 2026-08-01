# Permis et autorisations — Paquet de production

## Sécurité

- isolation par `municipalityId` sur toutes les lectures et écritures;
- séparation des rôles demandeur, agent et réviseur;
- transitions d’état contrôlées côté serveur;
- décisions motivées et conservées de façon append-only;
- pièces limitées par type, taille, empreinte SHA-256 et clé de stockage unique;
- quotas initiaux : 60 lectures/minute, 20 écritures/minute, 10 décisions/minute par utilisateur et municipalité;
- réponses `429` avec `Retry-After` et code stable `PERMIT_RATE_LIMITED`;
- aucune donnée personnelle dans les métriques ou journaux techniques.

## Exploitation

Métriques obligatoires : demandes créées, soumises, en attente, approuvées, refusées, délivrées, temps médian de traitement, dossiers bloqués et erreurs par opération. Alertes initiales : taux d’erreur supérieur à 5 % sur 10 minutes, p95 supérieur à 1 seconde, dossier en révision depuis plus de 10 jours ouvrables, échec de stockage de pièce ou de migration.

## Conservation

- décisions et traces d’audit : 7 ans ou politique municipale supérieure;
- pièces : durée du dossier plus période réglementaire;
- journaux techniques : 90 jours;
- données de test : supprimées après chaque exécution E2E.

## Retour arrière

1. désactiver les routes via configuration;
2. conserver les données créées;
3. revenir au déploiement précédent;
4. ne jamais supprimer automatiquement une décision ou une pièce;
5. exécuter la migration descendante uniquement après sauvegarde et approbation.

## Barrière de production

GO uniquement lorsque migrations, backend, frontend, OpenAPI, tests d’isolation, quotas, observabilité et E2E sont verts sur préproduction. Toute fuite intermunicipale, transition interdite acceptée, perte de décision ou absence de preuve entraîne NO-GO.
