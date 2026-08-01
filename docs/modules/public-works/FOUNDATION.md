# Travaux publics — Fondations

## Portée

Ce bloc introduit les structures persistantes nécessaires pour transformer une demande citoyenne, un événement routier ou un permis en ordre de travail municipal suivi jusqu’à sa fermeture.

## Objets métier

- équipes de travaux publics;
- véhicules municipaux;
- ordres de travail;
- historique append-only des transitions;
- preuves terrain;
- matériaux et coûts unitaires.

## États

Les ordres de travail suivent le cycle `DRAFT`, `PLANNED`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CLOSED`, `CANCELLED`.

## Sécurité

Toutes les tables portent `municipalityId`. Les services et routes doivent toujours filtrer par cette valeur. Aucune route ne peut être ajoutée sans authentification, autorisation explicite et limitation de débit.

## Limites

- aucune gestion d’inventaire centralisée;
- aucun suivi GPS temps réel;
- aucun stockage binaire;
- aucun calcul de paie;
- aucune intégration télématique véhicule.