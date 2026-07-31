# CF2X-JEUX-0001 — Jeux de données synthétiques P1

## Objet

Définir un socle commun de données fictives pour exécuter les preuves P1 sans utiliser, copier ou dériver de renseignements municipaux réels.

## Principes

- aucune personne, adresse, organisation ou frontière réelle;
- identifiants stables et lisibles;
- cas nominaux, limites et cas volontairement invalides;
- versions explicites;
- provenance synthétique documentée;
- génération déterministe;
- aucune donnée secrète crédible.

## Univers fictif

Trois municipalités sont utilisées :

- `MUN-A — Rivière-Claire`;
- `MUN-B — Mont-Brume`;
- `MUN-C — Val-des-Pins`.

Elles possèdent des territoires, services, utilisateurs, rôles et calendriers entièrement inventés.

## Ensembles minimaux

### Géographie

- secteurs et sous-secteurs versionnés;
- frontières simples et chevauchements volontaires;
- points intérieurs, extérieurs et sur frontière;
- coordonnées absentes ou incompatibles;
- historique d’un changement de frontière.

### Publication

- avis, calendriers et directives;
- brouillons, approbations, corrections et retraits;
- commandes dupliquées;
- versions antérieures consultables.

### Isolation et audit

- acteurs de trois municipalités;
- objets portant un propriétaire municipal explicite;
- accès temporaires de soutien;
- tâches différées;
- sauvegardes saines et contaminées.

### Intégrations

- deux fournisseurs fictifs;
- contrats `v1`, `v2` et `v3-inconnue`;
- événements valides, dupliqués, retardés, contradictoires et mal signés;
- secrets factices non utilisables.

### Pilote

- douze utilisateurs fictifs;
- deux services;
- cinquante dossiers synthétiques;
- calendrier simulé de trente jours;
- incidents et critères d’arrêt prédéfinis.

## Format et versionnement

Chaque jeu doit fournir :

- un identifiant;
- une version;
- une graine de génération;
- une date de création;
- un responsable;
- une empreinte cryptographique;
- la preuve à laquelle il s’applique;
- les invariants attendus.

## Contrôles

Avant utilisation, une vérification confirme l’absence de donnée réelle, la stabilité de la génération, la cohérence des références et la reproductibilité des empreintes.

## Cas interdits

- copier une base de production;
- anonymiser superficiellement des données réelles;
- utiliser une adresse municipale existante;
- employer un secret ou jeton ressemblant à une valeur active;
- modifier un jeu après exécution sans créer une nouvelle version.

## Décision permise

Ce cadre autorise uniquement la préparation et l’exécution contrôlée des preuves P1 et P2. Il n’autorise aucun traitement de données réelles.