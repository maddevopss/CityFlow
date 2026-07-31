# Registre des actifs — CityFlow 2.x

## Objet

Ce cadre définit comment CityFlow 2.x identifie les actifs nécessaires à ses services et attribue leur propriété, leur criticité et leur cycle de vie.

## Identifiant

Chaque actif reçoit un identifiant `CF2X-ASSET-xxxx`.

## Actifs couverts

Le registre couvre services, applications, dépôts, bases de données, jeux de données, interfaces, domaines, certificats, comptes, secrets, infrastructures, documents essentiels et relations fournisseurs.

## Fiche minimale

Chaque actif indique :

- propriétaire et équipe responsable;
- finalité;
- criticité;
- données traitées;
- dépendances;
- environnements;
- accès privilégiés;
- sauvegarde et rétablissement;
- date de révision;
- état du cycle de vie.

## États

Les états sont proposé, actif, limité, en migration, à retirer, retiré ou archivé.

## Vérification

Le registre est rapproché périodiquement avec la réalité technique et contractuelle. Les actifs sans propriétaire, inconnus ou non utilisés sont traités comme des risques.

## Changements

Toute création, migration, changement de criticité ou retrait met à jour les dépendances, risques, configurations et procédures d’exploitation.

## Retrait

Le retrait traite données, accès, secrets, contrats, sauvegardes, observabilité et obligations de conservation avant fermeture.
