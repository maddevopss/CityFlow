# Fermeture du bloc de restructuration frontend

## Portée livrée

Le bloc frontend est fermé par une série de petites PR indépendantes :

1. audit initial et configuration;
2. styles globaux et sémantique;
3. composants de formulaire réutilisables;
4. extraction de la logique des inspections;
5. retour en haut accessible;
6. navigation clavier et stabilité mobile;
7. chargement différé des routes métier;
8. configuration des tests et preuve de fermeture.

## Garanties conservées

- aucune modification des contrats API;
- aucune modification des rôles ou permissions;
- aucune logique d’autorité déplacée vers le frontend;
- les routes protégées conservent `ProtectedRoute`;
- les appels réseau restent dans les services et hooks;
- les composants de formulaire exposent des libellés et erreurs accessibles.

## Validation attendue

- `npm run lint`;
- `npm run build`;
- `npm test -- --run`;
- CodeQL;
- gouvernance de PR;
- revue des routes protégées;
- vérification mobile et clavier.

## Limites

Cette fermeture ne constitue pas une refonte graphique complète. Les autres pages monolithiques pourront être découpées progressivement, chacune dans une PR dédiée, sans rouvrir ce bloc de fondations frontend.
