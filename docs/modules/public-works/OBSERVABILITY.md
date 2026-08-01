# Observabilité — Travaux publics

## Événements à mesurer

- ordre créé, affecté, démarré, bloqué, complété et fermé;
- preuve ajoutée;
- matériau ajouté;
- affectation refusée pour équipe ou véhicule indisponible;
- tentative interdite par rôle ou municipalité;
- limiteur déclenché.

## Dimensions permises

- municipalityId;
- catégorie, priorité et état;
- type d’événement;
- durée entre création, démarrage, complétion et fermeture;
- nombre de preuves et coût matériel agrégé.

## Données interdites dans les journaux

- contenu des preuves;
- coordonnées personnelles;
- jetons d’authentification;
- charges complètes de partenaires;
- motifs libres non nettoyés.

## Alertes recommandées

- ordre urgent non affecté;
- ordre bloqué au-delà du seuil municipal;
- hausse anormale des erreurs 409 ou 500;
- échec d’écriture d’un événement append-only;
- taux élevé de limitation de débit.

## Limites

Ce document définit le contrat sans brancher un fournisseur de télémétrie ni fixer des seuils chiffrés définitifs.