---
titre: Rapport canonique d’exécution P1
statut: Proposition exécutable
categorie: Gouvernance des preuves
langue: fr-CA
---

# Rapport canonique d’exécution P1

## Objet

Fournir un format unique pour synthétiser une exécution sans masquer les données brutes, les réserves ou les échecs.

## En-tête obligatoire

- identifiant de la preuve;
- identifiant de l’exécution;
- date et environnement;
- commit et versions;
- exécutant et réviseur;
- statut du rejeu.

## Corps du rapport

### Question vérifiée

Formulation exacte et critère d’acceptation.

### Méthode

Étapes suivies, outils, configuration et données synthétiques.

### Résultats

Tableau critère par critère avec attendu, observé, artefact et conclusion.

### Écarts et limites

Toutes les anomalies, hypothèses et conditions non vérifiées.

### Reproductibilité

Instructions de rejeu, empreintes et résultat du réviseur indépendant.

### Verdict

Un seul verdict permis, accompagné de sa justification et des réserves.

## Règles

Le rapport ne remplace jamais les artefacts bruts. Toute correction est versionnée. Une absence de preuve est explicitement marquée `NON VÉRIFIÉE`.