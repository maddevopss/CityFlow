---
titre: Exécution P1-003 — Isolation et audit
statut: Prête à exécuter
categorie: Preuve produit
langue: fr-CA
---

# Exécution P1-003 — Isolation et audit

## Objet

Vérifier, sur données synthétiques, que les espaces municipaux demeurent isolés et que toute action significative laisse une trace exploitable.

## Scénarios minimaux

- lecture autorisée dans un espace;
- lecture croisée refusée;
- écriture croisée refusée;
- accès sans contexte refusé;
- action privilégiée journalisée;
- export du journal et vérification de son intégrité.

## Contrôles obligatoires

- séparation stricte des organisations;
- refus par défaut;
- acteur, action, cible et horodatage;
- motif ou contexte de décision;
- corrélation entre requête et journal;
- conservation des tentatives refusées.

## Preuves attendues

Manifeste, matrice d’accès, requêtes synthétiques, réponses, journaux, empreintes, anomalies et rejeu indépendant.

## État initial

`NON EXÉCUTÉE — AUCUNE GARANTIE DE PRODUCTION DÉCLARÉE`

Toute fuite, ambiguïté d’organisation ou trace manquante entraîne un verdict d’échec.