---
titre: Modèle canonique des artefacts de preuve P1
statut: Proposition exécutable
categorie: Gouvernance des preuves
langue: fr-CA
---

# Modèle canonique des artefacts de preuve P1

## But

Uniformiser les éléments produits par chaque exécution afin qu’une personne indépendante puisse comprendre, vérifier et rejouer la preuve.

## Structure obligatoire

1. Identité de l’exécution
2. Protocole et critère visé
3. Version du code et dépendances
4. Environnement et configuration
5. Entrées synthétiques et empreintes
6. Commandes ou étapes exactes
7. Sorties brutes et empreintes
8. Résultats par critère
9. Écarts, anomalies et limites
10. Verdict provisoire
11. Rejeu indépendant
12. Décision et signatures

## Règles d’intégrité

- aucun résultat ne doit être réécrit silencieusement;
- tout remplacement produit une nouvelle version;
- les échecs et résultats inconclusifs sont conservés;
- les secrets et renseignements personnels sont interdits;
- les horodatages utilisent un format explicite;
- chaque artefact possède un identifiant stable.

## Convention de verdict

Seuls `RÉUSSIE`, `RÉUSSIE AVEC RÉSERVES`, `ÉCHOUÉE`, `INCONCLUSIVE` et `NON EXÉCUTÉE` sont permis.

## Barrière

Un dossier incomplet ne peut soutenir aucune décision institutionnelle positive.