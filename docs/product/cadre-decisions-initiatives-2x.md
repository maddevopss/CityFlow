---
Projet: CityFlow
Document: Cadre de décision des initiatives 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Cadre de décision des initiatives 2.x

## Objet

Normaliser les décisions qui font évoluer une initiative entre exploration, évaluation, admissibilité, autorisation limitée, suspension et fermeture.

## États

- **Proposée** : besoin identifié, preuves absentes ou initiales.
- **En évaluation** : conception et essais autorisés dans un cadre réversible.
- **Admissible** : preuves minimales acceptées, sans autorisation d’exploitation implicite.
- **Autorisée sous conditions** : périmètre, durée et contrôles précisément bornés.
- **Suspendue** : activité interrompue en attente de correction ou de décision.
- **Retirée** : initiative fermée et actifs temporaires supprimés ou archivés.

## Autorité

Toute décision doit être prise par une personne ou un groupe explicitement mandaté. Une recommandation technique, un score, un test automatisé ou une assistance intelligente ne constitue jamais l’autorité finale.

## Contenu obligatoire d’une décision

- identifiant et date;
- initiative et version concernées;
- état précédent et nouvel état;
- périmètre autorisé;
- preuves examinées;
- preuves manquantes ou refusées;
- risques résiduels;
- conditions et échéances;
- responsables;
- déclencheurs de suspension;
- procédure de retour arrière;
- durée de validité;
- signatures ou approbations requises.

## Types de décision

### Admission

Autorise la poursuite contrôlée de l’évaluation. Elle ne permet pas l’usage de données réelles, sauf mention explicite et justifiée.

### Admissibilité

Constate que les preuves minimales sont suffisantes pour envisager une autorisation limitée. Elle ne vaut pas lancement.

### Autorisation limitée

Précise la municipalité, le territoire, les utilisateurs, les données, les canaux, la durée et les limites opérationnelles.

### Extension

Exige une nouvelle analyse lorsque le volume, le territoire, les données, les intégrations ou les responsabilités changent matériellement.

### Suspension

Interrompt immédiatement tout ou partie de l’initiative lorsqu’une barrière, une preuve ou une condition n’est plus satisfaite.

### Retrait

Ferme l’initiative, révoque les accès, retire les intégrations, traite les données temporaires et conserve les preuves nécessaires.

## Règles de quorum

La décision doit inclure les compétences correspondant aux risques : produit, municipal, sécurité, vie privée, accessibilité, exploitation et données. Une même personne peut couvrir plusieurs rôles, mais les responsabilités demeurent explicites.

## Conflits d’intérêts

Toute personne ayant produit seule une preuve critique déclare ce lien. Les décisions d’autorisation limitée et d’extension requièrent au moins une revue indépendante.

## Décisions conditionnelles

Une condition doit avoir :

- un responsable;
- une date limite;
- une preuve attendue;
- un effet en cas de non-respect;
- un mécanisme de vérification.

Une condition vague comme « surveiller attentivement » n’est pas acceptable.

## Réévaluation

Une décision expire ou doit être revue lorsque :

- le périmètre change;
- une preuve critique expire;
- un incident majeur survient;
- une intégration ou un fournisseur change;
- une municipalité supplémentaire est ajoutée;
- une exigence légale ou opérationnelle change;
- la durée autorisée se termine.

## Registre minimal

| ID | Initiative | Décision | État | Date | Validité | Responsable | Statut |
|---|---|---|---|---|---|---|---|
| À attribuer | À préciser | À préciser | À préciser | À fixer | À fixer | À nommer | Ouverte / Satisfaite / Expirée / Retirée |

## Modèle de décision

### Décision

- **ID :**
- **Initiative :**
- **Version :**
- **État précédent :**
- **Nouvel état :**
- **Périmètre :**
- **Durée :**

### Fondement

- preuves acceptées;
- preuves refusées;
- résultats négatifs;
- risques résiduels.

### Conditions

- condition;
- responsable;
- échéance;
- preuve;
- conséquence.

### Suspension et retour arrière

- déclencheurs;
- personne autorisée à suspendre;
- actions immédiates;
- preuve de fermeture ou reprise.

### Approbations

- autorité municipale;
- responsable CityFlow;
- sécurité et vie privée;
- accessibilité;
- exploitation.

## Principe de prudence

En cas d’ambiguïté sur l’état, le périmètre ou la validité, l’état le plus restrictif s’applique.

## Limite

Ce cadre structure les décisions. Il ne remplace pas les preuves, les mandats municipaux ni les obligations légales applicables.