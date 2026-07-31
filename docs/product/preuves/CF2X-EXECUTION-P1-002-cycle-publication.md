---
titre: Exécution P1-002 — Cycle de publication
statut: Prête à exécuter
categorie: Preuve produit
langue: fr-CA
---

# Exécution P1-002 — Cycle de publication

## Objet

Vérifier que CityFlow 2.x peut préparer, publier, corriger, archiver et reconstruire un état publié sans perte de traçabilité.

## Scénarios minimaux

- création d’un brouillon synthétique;
- validation puis publication;
- rejeu idempotent d’une publication identique;
- correction versionnée sans écrasement du passé;
- archivage contrôlé;
- reconstruction à partir des artefacts conservés.

## Contrôles

- identifiants stables;
- version et horodatage explicites;
- auteur et décision consignés;
- absence de mutation silencieuse;
- empreinte vérifiable des données;
- journal complet des transitions.

## Artefacts obligatoires

Manifeste, données synthétiques, journaux, empreintes, captures des transitions, écarts, verdict provisoire et rejeu indépendant.

## Critère de réussite

Chaque transition produit le même état attendu lors du rejeu et permet de reconstituer l’historique complet.

## État initial

`NON EXÉCUTÉE — AUCUNE PUBLICATION RÉELLE AUTORISÉE`

Les résultats devront être ajoutés dans une PR distincte après exécution réelle.