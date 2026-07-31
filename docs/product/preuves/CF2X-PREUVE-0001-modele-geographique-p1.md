---
Projet: CityFlow
Document: Preuve P1 du modèle géographique 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# CF2X-PREUVE-0001 — Preuve P1 du modèle géographique 2.x

## 1. Objet

Ce document ouvre la première preuve reproductible associée à `CF2X-INIT-0001 — Modèle géographique officiel`.

Le niveau `P1` vise à démontrer qu’un même vocabulaire géographique peut être compris, appliqué et vérifié de façon cohérente avant toute migration de données, activation municipale ou publication citoyenne.

Cette preuve ne déclare pas le modèle admissible. Elle transforme les principes documentaires en objets contrôlables, exemples testables et critères de rejet explicites.

## 2. Question de preuve

> CityFlow peut-il représenter sans ambiguïté l’appartenance municipale, les territoires, les secteurs, les emplacements et leurs versions, tout en empêchant qu’une donnée soit attribuée au mauvais territoire ou interprétée avec une géométrie périmée?

## 3. Portée

La preuve couvre :

- l’identité d’une municipalité;
- la définition d’un territoire administratif;
- les subdivisions ou secteurs internes;
- les emplacements ponctuels;
- les adresses et références externes;
- les géométries et systèmes de coordonnées;
- les périodes de validité;
- la provenance;
- les changements de frontières;
- les cas inconnus, ambigus, invalides ou contradictoires.

Elle ne couvre pas :

- l’importation de données municipales réelles;
- la cartographie publique en production;
- la navigation ou le calcul d’itinéraire;
- la géolocalisation en temps réel;
- l’autorisation d’un pilote;
- la substitution à une source géographique officielle.

## 4. Hypothèses à vérifier

### H1 — Propriété municipale explicite

Tout objet géographique exploitable possède une municipalité propriétaire explicite et vérifiable.

### H2 — Identité stable

L’identité d’un territoire demeure stable même lorsque son nom, sa représentation ou sa géométrie change.

### H3 — Version temporelle

Une géométrie utilisée dans une décision peut être reliée à une version et à une période de validité précises.

### H4 — Provenance vérifiable

Toute donnée géographique possède une source, une date de réception et une méthode de transformation identifiables.

### H5 — Refus de l’ambiguïté

Une valeur ambiguë, inconnue, contradictoire ou non attribuable n’est jamais convertie silencieusement en valeur valide.

### H6 — Isolation

Une référence géographique appartenant à une municipalité ne peut être utilisée pour qualifier un objet d’une autre municipalité sans relation intermunicipale explicitement autorisée.

## 5. Vocabulaire contrôlé proposé

| Objet | Définition de travail | Identité minimale |
|---|---|---|
| Municipalité | Autorité territoriale propriétaire du contexte | `municipality_id` |
| Territoire | Zone administrative versionnée | `territory_id` |
| Secteur | Subdivision interne d’un territoire | `sector_id` |
| Emplacement | Point ou lieu de référence | `location_id` |
| Adresse | Représentation textuelle structurée d’un emplacement | `address_id` |
| Géométrie | Forme spatiale associée à une version | `geometry_id` |
| Version géographique | État immuable d’une géométrie et de ses métadonnées | `geography_version_id` |
| Source | Origine autoritative ou déclarée de la donnée | `source_id` |

Les termes « territoire », « secteur », « district », « zone », « arrondissement » et « quartier » ne sont pas considérés interchangeables sans définition municipale explicite.

## 6. Contrat conceptuel minimal

Un objet territorial vérifiable doit pouvoir exprimer au minimum :

```text
territory_id
municipality_id
territory_type
canonical_name
status
valid_from
valid_to
source_id
source_version
geometry_id
geometry_version
coordinate_reference_system
created_at
created_by
supersedes_id
```

### Contraintes attendues

1. `municipality_id` est obligatoire.
2. `territory_id` est stable et non réutilisable.
3. une version publiée est immuable;
4. `valid_to` ne précède jamais `valid_from`;
5. deux versions actives incompatibles ne peuvent être sélectionnées implicitement;
6. une géométrie possède un système de coordonnées explicite;
7. une transformation conserve la source et la version d’origine;
8. une suppression logique ne détruit pas les preuves historiques;
9. une frontière partagée ne crée pas automatiquement une propriété partagée;
10. un emplacement hors territoire est conservé comme résultat explicite, pas corrigé arbitrairement.

## 7. Jeu d’exemples synthétiques

La preuve utilise uniquement des identifiants fictifs.

### Municipalités

| Identifiant | Nom fictif | Statut |
|---|---|---|
| `MUN-A` | Ville Alpha | active |
| `MUN-B` | Ville Bêta | active |

### Territoires

| Identifiant | Municipalité | Type | Version | Validité |
|---|---|---|---|---|
| `TER-A-001` | `MUN-A` | secteur | v1 | 2025-01-01 à 2025-12-31 |
| `TER-A-001` | `MUN-A` | secteur | v2 | depuis 2026-01-01 |
| `TER-B-001` | `MUN-B` | secteur | v1 | depuis 2025-01-01 |

### Cas limites obligatoires

- un point clairement à l’intérieur de `TER-A-001` v2;
- un point clairement à l’extérieur;
- un point exactement sur une frontière;
- une adresse sans coordonnées;
- deux adresses textuelles similaires dans deux municipalités;
- un territoire renommé sans changement géométrique;
- une géométrie modifiée sans changement d’identité;
- deux versions temporelles qui se chevauchent par erreur;
- une géométrie sans système de coordonnées;
- une source externe dont la version est inconnue;
- une référence `MUN-A` utilisée dans un objet appartenant à `MUN-B`;
- une subdivision supprimée mais encore nécessaire pour expliquer une décision historique.

## 8. Scénarios reproductibles

### G-P1-01 — Attribution nominale

**Entrée :** point intérieur à `TER-A-001` v2, municipalité `MUN-A`, date 2026-07-31.

**Résultat attendu :** attribution unique à `TER-A-001`, version v2, avec provenance et méthode de calcul.

### G-P1-02 — Version historique

**Entrée :** même emplacement évalué au 2025-06-01.

**Résultat attendu :** utilisation de v1 plutôt que v2.

### G-P1-03 — Frontière

**Entrée :** point situé exactement sur une limite partagée.

**Résultat attendu :** résultat `boundary` ou règle municipale explicitement versionnée; aucune attribution arbitraire.

### G-P1-04 — Hors territoire

**Entrée :** point extérieur à tous les territoires connus de `MUN-A`.

**Résultat attendu :** `outside_known_territory`; aucune sélection du territoire le plus proche.

### G-P1-05 — Ambiguïté temporelle

**Entrée :** deux versions actives incompatibles à la même date.

**Résultat attendu :** rejet contrôlé et événement d’audit.

### G-P1-06 — Système de coordonnées absent

**Entrée :** géométrie sans référence spatiale déclarée.

**Résultat attendu :** rejet avant calcul.

### G-P1-07 — Fuite municipale

**Entrée :** objet de `MUN-B` soumis avec `TER-A-001`.

**Résultat attendu :** refus d’autorisation et trace d’audit; aucune normalisation automatique.

### G-P1-08 — Renommage

**Entrée :** changement du nom officiel sans changement d’identité.

**Résultat attendu :** nouvel attribut versionné; `territory_id` inchangé.

### G-P1-09 — Changement de frontière

**Entrée :** modification géométrique à partir d’une date donnée.

**Résultat attendu :** nouvelle version immuable reliée à la précédente; décisions historiques conservées.

### G-P1-10 — Source incomplète

**Entrée :** fichier géographique dont la provenance ou la version ne peut être établie.

**Résultat attendu :** quarantaine; aucune admission dans le référentiel officiel.

## 9. Résultats attendus

La preuve P1 est considérée réussie lorsque :

- chaque scénario produit un résultat déterministe;
- les refus sont aussi documentés que les succès;
- les versions historiques sont sélectionnées selon la date demandée;
- les objets intermunicipaux sont refusés par défaut;
- aucune ambiguïté n’est corrigée silencieusement;
- chaque résultat peut citer l’identité, la version et la provenance utilisées;
- les décisions historiques demeurent explicables après un changement de frontière;
- les cas limites sont rejouables avec les mêmes entrées.

## 10. Preuves à joindre ultérieurement

Le dossier final devra contenir :

- un schéma conceptuel versionné;
- un dictionnaire de données;
- un jeu de données synthétiques;
- un exécuteur de scénarios ou une procédure manuelle reproductible;
- les résultats attendus et observés;
- les journaux de refus;
- une revue indépendante;
- les limites connues;
- les écarts et décisions associées;
- les empreintes ou versions des artefacts utilisés.

## 11. Critères d’échec

La preuve échoue notamment si :

- un territoire peut exister sans municipalité explicite;
- une version historique est remplacée en place;
- une donnée intermunicipale est acceptée sans autorisation;
- une ambiguïté produit un succès implicite;
- un calcul est effectué sans système de coordonnées connu;
- la provenance disparaît après transformation;
- une décision historique devient inexplicable;
- les résultats ne sont pas reproductibles.

## 12. Limites actuelles

Cette première preuve demeure conceptuelle et synthétique. Elle ne démontre pas encore :

- la performance sur des volumes municipaux;
- la précision d’un moteur spatial particulier;
- l’intégration avec un fournisseur officiel;
- la conformité d’un jeu de données réel;
- la robustesse d’une migration;
- l’accessibilité d’une interface cartographique;
- la capacité de restauration opérationnelle.

Ces éléments relèvent de preuves P2 à P4.

## 13. Décision permise après cette preuve

Une réussite P1 peut uniquement autoriser :

- la conception détaillée du schéma;
- la création de prototypes isolés;
- l’écriture de tests automatisés sur données synthétiques;
- la comparaison de bibliothèques ou moteurs spatiaux;
- la préparation d’une preuve P2.

Elle ne peut pas autoriser :

- une migration réelle;
- un import municipal;
- une publication;
- un pilote;
- une activation multi-municipale.

## 14. Traçabilité

Cette preuve est reliée à :

- `CF2X-INIT-0001 — Modèle géographique officiel`;
- la matrice de preuves des initiatives 2.x;
- le cadre de décision des initiatives 2.x;
- le protocole d’incident et de retour arrière 2.x;
- la fermeture du bloc d’admission initial 2.x.

## 15. État proposé

| Élément | Valeur |
|---|---|
| Initiative | `CF2X-INIT-0001` |
| Niveau visé | `P1` |
| État de la preuve | `À exécuter` |
| Données réelles autorisées | Non |
| Publication autorisée | Non |
| Pilote autorisé | Non |
| Décision humaine requise | Oui |
