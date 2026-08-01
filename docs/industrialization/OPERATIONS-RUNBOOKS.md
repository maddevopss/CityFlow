# Runbooks d’exploitation CityFlow

## Catalogue obligatoire

- indisponibilité API;
- saturation de la base de données;
- retard des tâches planifiées;
- échec de diffusion des notifications;
- hausse d’erreurs d’authentification;
- fuite ou soupçon de fuite de données;
- échec de sauvegarde;
- restauration et retour arrière;
- saturation du stockage de pièces;
- dégradation d’un module municipal.

## Structure d’un runbook

Chaque procédure contient : déclencheur, impact, propriétaire, niveau d’incident, diagnostic, commandes sûres, décision d’escalade, communication, retour arrière, validation de rétablissement et preuves à conserver.

## Règles

- aucune commande destructive sans étape de confirmation;
- commandes VPS clairement identifiées;
- secrets et données citoyennes masqués;
- chronologie UTC et heure locale conservées;
- revue après incident avec actions et responsables;
- exercice trimestriel d’au moins un scénario critique.

## Fermeture

Un incident n’est fermé qu’après rétablissement vérifié, communication effectuée, chronologie complétée et actions correctives enregistrées.
