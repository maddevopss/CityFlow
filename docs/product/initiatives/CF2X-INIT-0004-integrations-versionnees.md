---
Projet: CityFlow
Document: Admission CF2X-INIT-0004 — Intégrations versionnées
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: En évaluation
Auteur: MAD DevOps
---

# CF2X-INIT-0004 — Intégrations versionnées

## Décision recherchée

Évaluer un cadre d’intégration permettant à CityFlow d’échanger avec des systèmes municipaux et publics sans dépendre de contrats implicites, de formats instables ou de transformations impossibles à retracer.

Cette initiative demeure **En évaluation** et n’autorise aucune connexion à une source municipale réelle.

## Problème

Une intégration non versionnée peut modifier silencieusement le sens d’un champ, supprimer une valeur, rejouer une opération, mélanger des municipalités ou publier une donnée qui n’a pas été approuvée. Un simple succès HTTP ne prouve ni l’intégrité ni l’acceptation métier de l’échange.

## Résultat attendu

Chaque intégration doit avoir :

- un propriétaire et une finalité explicites;
- un contrat versionné et lisible;
- une portée municipale déterminée côté serveur;
- une compatibilité et une période de transition documentées;
- une validation syntaxique et métier;
- une idempotence et une corrélation de bout en bout;
- un journal des transformations et décisions;
- un mécanisme de suspension, reprise et retrait;
- des preuves que les données reçues et émises correspondent aux versions attendues.

## Portée

- API entrantes et sortantes;
- webhooks;
- importations et exportations de fichiers;
- flux géographiques;
- systèmes de gestion documentaire;
- canaux de publication;
- files de messages et tâches différées;
- synchronisations planifiées;
- adaptateurs temporaires de migration.

## Hors portée

- activation d’un fournisseur précis;
- engagement contractuel avec un tiers;
- copie complète de systèmes patrimoniaux;
- transformation non documentée de données officielles;
- accès direct d’un tiers à la base de données CityFlow.

## Principes obligatoires

1. Chaque contrat possède un identifiant et une version immuables.
2. Toute rupture de compatibilité exige une nouvelle version majeure.
3. Le contexte municipal ne provient jamais uniquement du contenu reçu.
4. Les champs inconnus, manquants ou ambigus sont traités explicitement.
5. Les transformations conservent la provenance de la valeur originale.
6. Les reprises sont idempotentes et ne créent pas de doublons.
7. Les secrets sont séparés des contrats et régulièrement révocables.
8. Une intégration peut être désactivée par municipalité sans arrêter toute la plateforme.
9. Une publication externe n’est confirmée qu’après vérification du résultat au canal cible.

## Contrat minimal

Le contrat doit préciser :

- nom, propriétaire et finalité;
- direction du flux;
- municipalités autorisées;
- schéma et types;
- unités, référentiels et règles géographiques;
- champs obligatoires, facultatifs et interdits;
- règles de validation et de rejet;
- stratégie d’idempotence;
- authentification et rotation des secrets;
- délais, quotas et limites;
- erreurs, reprises et quarantaine;
- journalisation et conservation;
- compatibilité, dépréciation et date de retrait;
- procédure de test et de retour arrière.

## Cycle de vie d’une version

États proposés :

1. Brouillon;
2. En revue;
3. Approuvée pour essais;
4. Active en environnement contrôlé;
5. Active;
6. Dépréciée;
7. Suspendue;
8. Retirée.

Le passage à **Active** exige une approbation humaine et des preuves d’essai. Une version dépréciée demeure observable jusqu’à son retrait.

## Compatibilité

La compatibilité doit être démontrée pour :

- ajout d’un champ facultatif;
- retrait ou renommage d’un champ;
- changement de type ou d’unité;
- nouvelle valeur d’énumération;
- changement de référentiel géographique;
- modification d’ordre ou de pagination;
- évolution du mécanisme d’authentification;
- changement de comportement d’erreur ou de reprise.

## Validation des échanges

Chaque message ou fichier doit être contrôlé avant application :

- structure valide;
- version reconnue;
- municipalité autorisée;
- provenance identifiable;
- règles métier satisfaites;
- références géographiques résolues;
- absence de contenu interdit;
- clé d’idempotence disponible;
- taille et fréquence dans les limites.

Les éléments rejetés sont placés en quarantaine avec une raison exploitable, sans être publiés ni appliqués partiellement.

## Sécurité et vie privée

- privilèges minimaux;
- secrets hors journaux et dépôts;
- chiffrement en transit;
- signature ou authentification des messages;
- filtrage des données personnelles non nécessaires;
- séparation des environnements;
- rotation et révocation testées;
- accès de soutien temporaire et audité.

## Observabilité

Les mesures minimales comprennent :

- messages reçus, acceptés, rejetés et rejoués;
- retard du flux;
- version de contrat utilisée;
- taux de transformation et d’erreur;
- éléments en quarantaine;
- tentatives non autorisées;
- divergences détectées lors de la réconciliation;
- statut du canal cible;
- date de dernière réussite vérifiée.

## Tests requis

- tests de contrat pour chaque version supportée;
- tests de compatibilité ascendante et descendante;
- doublons et rejeu;
- ordre inversé et retard;
- interruption au milieu d’un lot;
- secret expiré ou révoqué;
- municipalité incorrecte;
- données géographiques inconnues;
- réponse partielle d’un canal externe;
- reprise après suspension;
- retrait d’une version sans perte de preuve.

## Dépendances

- `CF2X-INIT-0001` pour le référentiel géographique;
- `CF2X-INIT-0002` pour le cycle de publication;
- `CF2X-INIT-0003` pour l’isolation et l’audit;
- inventaire des systèmes externes;
- politique de gestion des secrets;
- registre des contrats et versions.

## Conditions d’admission

L’initiative pourra devenir **Admissible** lorsque :

- le format de contrat est approuvé;
- une stratégie de versionnement et de dépréciation existe;
- les règles d’idempotence et de quarantaine sont testées;
- l’isolation municipale est démontrée;
- la rotation des secrets est vérifiée;
- une réconciliation détecte les divergences;
- un arrêt et un retour arrière ont été simulés;
- les responsabilités internes et externes sont nommées.

## Déclencheurs d’arrêt

- contrat implicite ou non attribué;
- données impossibles à relier à une municipalité;
- transformation détruisant la provenance;
- reprise produisant des doublons;
- version externe modifiée sans préavis;
- impossibilité de suspendre un seul flux;
- secret partagé ou non révocable;
- échec de réconciliation non expliqué.

## Retour arrière et retrait

Toute intégration doit permettre :

- suspension immédiate;
- arrêt par municipalité;
- retour à la dernière version approuvée;
- mise en quarantaine des messages non traités;
- réconciliation avant reprise;
- révocation des secrets;
- conservation des preuves de version et de décision;
- retrait documenté de l’adaptateur et des données temporaires.

## Preuves attendues

- modèle de contrat versionné;
- catalogue des intégrations;
- matrice de compatibilité;
- résultats des tests de contrat;
- simulation de rotation des secrets;
- rapport de reprise et de réconciliation;
- plan de dépréciation;
- décision d’admission.

## Limite

Le présent document autorise uniquement la conception, les maquettes et les essais avec données fictives ou anonymisées.