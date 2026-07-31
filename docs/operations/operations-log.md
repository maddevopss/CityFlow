# Journal d’exploitation

Chaque intervention significative doit produire une entrée immuable ou versionnée contenant :

- date et heure UTC;
- environnement;
- responsable;
- motif;
- service concerné;
- municipalités potentiellement touchées, sans données sensibles;
- action exécutée;
- résultat observé;
- liens vers alertes, métriques, déploiements et incidents;
- décision de fermeture ou de suivi.

## Événements obligatoires

- déploiement et retour arrière;
- changement de configuration;
- restauration de sauvegarde;
- rotation de secret;
- ouverture et fermeture d’incident;
- exercice de reprise;
- dépassement de capacité.

## Règles

Le journal ne doit contenir aucun jeton, mot de passe, contenu citoyen ou charge utile municipale. Toute correction conserve la valeur précédente et la justification.