# Modes dégradés CityFlow

## Principes

Un mode dégradé doit préserver l’intégrité, l’isolation municipale et la traçabilité avant la disponibilité complète.

## Scénarios

### PostgreSQL indisponible
- refuser les écritures;
- ne jamais servir de données en cache sans garantie d’isolation;
- exposer l’état indisponible.

### Redis indisponible
- interrompre les opérations dépendantes de la file;
- conserver les demandes déjà persistées;
- éviter toute exécution en double.

### Fournisseur de diffusion indisponible
- garder les messages dans la file durable;
- appliquer les reprises graduelles;
- ne pas marquer un message comme livré sans accusé valide.

### Supervision indisponible
- conserver les journaux locaux structurés;
- traiter cette perte comme un incident d’exploitation;
- ne pas masquer l’état réel du service.

## Sortie du mode dégradé

Le retour exige une vérification de l’intégrité, de l’isolation, des files, des métriques et des alertes.