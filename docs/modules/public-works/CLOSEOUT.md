# Travaux publics — Constat de livraison

## Capacités livrées

- fondations persistantes pour équipes, véhicules, ordres de travail, événements, preuves et matériaux;
- création, consultation et transitions des ordres de travail;
- rattachement aux demandes citoyennes, événements routiers et permis;
- affectation d’une équipe et d’un véhicule avec isolation municipale;
- collecte de preuves terrain et de matériaux;
- calcul du coût matériel agrégé;
- historique append-only des opérations.

## Barrières obligatoires

- filtrage par `municipalityId` dans toutes les lectures et écritures;
- authentification et rôles explicites;
- limiteur de lecture ou d’écriture déclaré directement sur chaque route;
- validation Joi avant tout accès aux services;
- aucune donnée bancaire, de paie ou de géolocalisation continue.

## Ordre de fusion

1. fondations;
2. ordres de travail;
3. équipes et véhicules;
4. exécution terrain;
5. présent constat.

## Validations requises

- migrations PostgreSQL;
- tests backend complets et seuil global de couverture;
- CodeQL sans alerte de limitation de débit;
- Documentation suite;
- PR governance avec sections `Impact documentaire` et `Limites` cohérentes.

## Limites

- aucune interface frontend dans ce bloc;
- aucun stockage binaire;
- aucun suivi GPS temps réel;
- aucun inventaire centralisé;
- aucun calcul de paie ou de temps supplémentaire;
- aucun tableau de bord décisionnel avancé.