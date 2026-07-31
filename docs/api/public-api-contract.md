# Contrat de l’API publique CityFlow

## Principes

- versionnement explicite sous `/api/v1`;
- authentification séparée par consommateur;
- filtrage systématique par municipalité;
- pagination bornée;
- erreurs structurées sans détail interne;
- identifiant de corrélation pour chaque requête;
- limites de débit documentées.

## Compatibilité

Une modification incompatible exige une nouvelle version majeure, une période de transition et un avis aux intégrateurs.

## Sécurité

Aucune réponse publique ne retourne de secret, donnée interne d’exploitation ou donnée d’une autre municipalité. Les champs personnels doivent être minimisés et justifiés.