---
titre: Exécution P1-004 — Intégrations versionnées
statut: Prête à exécuter
categorie: Preuve produit
langue: fr-CA
---

# Exécution P1-004 — Intégrations versionnées

## Objet

Vérifier que les échanges externes de CityFlow 2.x reposent sur des contrats explicites, versionnés, validables et compatibles avec un traitement idempotent.

## Scénarios minimaux

- charge utile valide pour la version courante;
- champ obligatoire absent;
- version inconnue ou retirée;
- répétition du même événement;
- évolution compatible d’un contrat;
- rejet contrôlé d’une évolution incompatible.

## Contrôles

- schéma et version consignés;
- identifiant de corrélation;
- validation avant traitement;
- réponse d’erreur exploitable;
- absence de double effet;
- journal des décisions de compatibilité.

## Artefacts attendus

Contrats, exemples synthétiques, résultats de validation, journaux, empreintes, matrice de compatibilité, écarts et rejeu.

## État initial

`NON EXÉCUTÉE — AUCUNE INTÉGRATION EXTERNE AUTORISÉE`

Une réussite documentaire ne constitue pas une autorisation de connexion à un système municipal réel.