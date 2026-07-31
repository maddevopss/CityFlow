---
Projet: CityFlow
Document: Matrice de preuves des initiatives 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Matrice de preuves des initiatives 2.x

## Objet

Ce document définit les preuves minimales nécessaires pour faire passer une initiative de **En évaluation** à **Admissible**, puis éventuellement à **Autorisée**. Une affirmation, une maquette ou une démonstration isolée ne constitue pas une preuve suffisante.

## Règles communes

Une preuve doit être :

- attribuée à un responsable;
- datée et liée à une version;
- reproductible ou vérifiable;
- conservée dans un emplacement approuvé;
- reliée à une exigence précise;
- accompagnée de ses limites et résultats négatifs;
- invalidée lorsque le système, le périmètre ou le risque change matériellement.

## Niveaux de preuve

| Niveau | Signification | Usage permis |
|---|---|---|
| P0 | intention ou hypothèse documentée | exploration seulement |
| P1 | conception revue | prototype réversible |
| P2 | essai reproductible avec données fictives | évaluation contrôlée |
| P3 | essai représentatif et indépendant | décision d’admissibilité |
| P4 | preuve opérationnelle limitée | autorisation de pilote |
| P5 | preuve durable en exploitation | maintien ou extension |

Aucun niveau supérieur ne peut être déclaré uniquement parce que les niveaux précédents existent.

## Domaines obligatoires

Chaque initiative doit présenter des preuves dans les domaines suivants :

1. besoin et résultat attendu;
2. périmètre et exclusions;
3. architecture et dépendances;
4. sécurité et isolation;
5. vie privée et conservation;
6. accessibilité et compréhension;
7. intégrité et provenance;
8. audit et responsabilité;
9. exploitation, incidents et soutien;
10. retour arrière et retrait;
11. coûts, capacité et limites;
12. décision humaine et risques résiduels.

## Matrice par initiative

| Initiative | Preuves particulières minimales |
|---|---|
| CF2X-INIT-0001 | référentiel géographique, cas limites, migrations, validation topologique, provenance |
| CF2X-INIT-0002 | machine d’états, matrice des rôles, identité approuvée/publiée, vérification des canaux |
| CF2X-INIT-0003 | tests intermunicipaux, autorisations, audit, accès privilégiés, restauration |
| CF2X-INIT-0004 | contrats versionnés, compatibilité, idempotence, quarantaine, rotation des secrets |
| CF2X-INIT-0005 | mandat, périmètre, répétition, critères d’arrêt, fermeture simulée |

## Fiche de preuve

Chaque élément enregistré doit contenir :

- identifiant de preuve;
- initiative et exigence visées;
- type de preuve;
- niveau revendiqué;
- auteur et vérificateur;
- environnement et données utilisés;
- procédure suivie;
- résultat attendu et résultat obtenu;
- anomalies et écarts;
- liens vers artefacts;
- date d’expiration ou condition de révision;
- décision associée.

## Résultats négatifs

Les échecs, limites et incertitudes sont conservés avec la même rigueur que les réussites. Une preuve ne peut être supprimée ou reformulée pour masquer :

- un test échoué;
- une fuite ou divergence;
- un besoin d’intervention manuelle;
- une hypothèse non vérifiée;
- une dépendance indisponible;
- un coût ou délai supérieur au seuil;
- un obstacle d’accessibilité;
- une incapacité de retour arrière.

## Indépendance de vérification

Les preuves P3 et supérieures doivent être revues par une personne qui n’a pas produit seule le changement évalué. Les conflits d’intérêts et limites de compétence sont déclarés.

## Expiration

Une preuve doit être réévaluée lorsque :

- le schéma de données change;
- un rôle ou une règle d’autorisation change;
- un fournisseur ou contrat évolue;
- le territoire ou le volume augmente;
- un incident révèle une hypothèse fausse;
- une exigence légale ou municipale change;
- l’environnement de déploiement change;
- la preuve dépasse sa période de validité.

## Barrières non compensables

Une initiative ne peut devenir admissible si une preuve critique manque dans l’un des domaines suivants :

- isolation municipale;
- autorité humaine finale;
- identité entre contenu approuvé et publié;
- provenance des données;
- accessibilité des parcours essentiels;
- capacité de suspension et retour arrière;
- conservation et suppression justifiées;
- responsabilité attribuée.

Une bonne performance ou une faible probabilité estimée ne compense pas l’absence d’une barrière.

## Décision d’admissibilité

La décision doit énumérer :

- preuves acceptées;
- preuves refusées ou expirées;
- risques résiduels;
- conditions et durée de validité;
- périmètre autorisé;
- déclencheurs de suspension;
- responsables de surveillance;
- prochaine date de révision.

## Registre synthétique

| ID preuve | Initiative | Exigence | Niveau | Statut | Responsable | Expiration |
|---|---|---|---|---|---|---|
| À attribuer | À préciser | À préciser | P0–P5 | Manquante / En cours / Acceptée / Refusée / Expirée | À nommer | À fixer |

## Limite

Cette matrice organise les preuves; elle ne remplace ni les essais, ni la revue indépendante, ni la décision formelle d’autorisation.