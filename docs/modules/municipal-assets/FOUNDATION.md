# Gestion des actifs municipaux — Fondations

## Portée

Ce bloc introduit le registre central des actifs municipaux et son historique append-only. Il fournit une base commune pour les bâtiments, parcs, réseaux, équipements et véhicules sans mélanger leurs caractéristiques spécialisées.

## Objets métier

### Actif municipal

Chaque actif possède :

- un identifiant UUID;
- un `municipalityId` obligatoire;
- un numéro unique dans sa municipalité;
- un nom, un type et un sous-type facultatif;
- un état opérationnel et une condition physique;
- un mode de propriété;
- un service responsable;
- une adresse et une localisation structurée facultatives;
- des données financières de base;
- une durée de vie utile et une valeur résiduelle facultatives;
- des métadonnées extensibles;
- une version pour le contrôle de concurrence futur.

### Historique

`MunicipalAssetEvent` conserve les événements métier de façon append-only. Les transitions d’état et de condition, l’acteur, les métadonnées et la clé d’idempotence peuvent être consignés sans réécrire l’historique.

## Référentiels

Types : `BUILDING`, `PARK`, `NETWORK`, `EQUIPMENT`, `VEHICLE`, `OTHER`.

États : `DRAFT`, `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`, `DISPOSED`.

Conditions : `UNKNOWN`, `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `CRITICAL`.

Modes de propriété : `OWNED`, `LEASED`, `SHARED`, `OTHER`.

## Sécurité et intégrité

- toutes les tables portent `municipalityId`;
- le numéro d’actif est unique uniquement dans sa municipalité;
- les valeurs financières ne peuvent pas être négatives;
- la durée de vie utile doit être positive;
- la recherche textuelle possède un index dédié;
- l’historique accepte une clé d’idempotence unique par municipalité;
- aucune route HTTP ni permission implicite n’est créée dans cette PR.

## Tests

- contrats unitaires des types, états, conditions et normalisation des numéros;
- contrat d’intégration de la migration SQL;
- vérification des contraintes d’isolation, d’idempotence, de recherche et d’intégrité financière.

## Limites

- aucune route HTTP;
- aucune interface frontend;
- aucun détail spécialisé de bâtiment, parc, réseau, équipement ou véhicule;
- aucune garantie, inspection, maintenance, dépense ou écriture d’amortissement;
- aucun fichier binaire;
- aucune suppression métier exposée.

Ces capacités seront ajoutées dans des PR indépendantes après stabilisation de la fondation.
