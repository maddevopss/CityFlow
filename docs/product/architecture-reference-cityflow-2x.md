# Architecture de référence CityFlow 2.x

## Intention

Ce document décrit comment les cadres de gouvernance CityFlow 2.x forment un système cohérent de décision, de réalisation, d’exploitation, de protection et d’apprentissage.

Il ne remplace aucun cadre spécialisé. Il définit leurs relations, leurs priorités et les règles qui empêchent qu’un contrôle local contredise l’ensemble.

## Principe directeur

CityFlow fonctionne selon une chaîne vérifiable :

**contexte → problème → hypothèses → décision → initiative → réalisation → validation → mise en service → exploitation → valeur → apprentissage → révision ou fermeture**.

Chaque étape conserve ses preuves, limites, responsabilités et obligations résiduelles.

## Couches

### 1. Orientation et portefeuille

La feuille de route, l’admission, le registre des initiatives, la capacité, les coûts, les risques stratégiques et les arbitrages déterminent ce qui peut être engagé.

### 2. Preuves et décisions

Les références `CF2X-HYP`, `CF2X-MET`, `CF2X-EXP` et `CF2X-DEC` rendent visibles hypothèses, observations, essais et décisions humaines.

### 3. Réalisation et architecture

Le passage à la réalisation, les changements, l’architecture, les interfaces, les dépendances et les configurations encadrent la transformation concrète.

### 4. Protections transversales

Sécurité, vie privée, données, accessibilité, obligations, fournisseurs, qualité et audit s’appliquent à toutes les couches. Une barrière critique échouée ne peut être compensée par un score favorable ailleurs.

### 5. Mise en service et exploitation

Validation, mise en service, transfert, actifs, observabilité, niveaux de service, soutien, incidents, problèmes, continuité et résilience rendent le service exploitable et rétablissable.

### 6. Valeur et apprentissage

La mesure puis la réalisation de la valeur, les connaissances, les apprentissages, les revues du portefeuille et la revue du cycle ferment la boucle.

### 7. Retrait et fermeture

Le retrait des services et la fermeture des initiatives traitent les personnes, données, accès, contrats, coûts, risques et obligations résiduelles sans effacer l’histoire.

## Priorité des règles

En cas de conflit :

1. les obligations légales et protections critiques prévalent;
2. la sécurité des personnes, des données et de la continuité prévaut sur la vitesse;
3. une preuve traçable prévaut sur une affirmation;
4. une décision humaine autorisée prévaut sur une recommandation automatisée;
5. la règle la plus spécialisée s’applique lorsqu’elle ne contredit pas une protection supérieure;
6. le conflit non résolu est enregistré et arbitré, jamais masqué.

## Références stables

Les objets gouvernés utilisent des identifiants `CF2X-*`. Les noms, emplacements et outils peuvent évoluer sans casser les relations historiques.

## Autorité humaine

Les systèmes automatisés peuvent collecter, comparer, détecter, expliquer et recommander. Ils fournissent provenance, critères, incertitude et limites. Ils ne deviennent jamais l’autorité finale pour l’acceptation d’un risque critique, une exception, une mise en service sensible, un retrait ou une fermeture.

## Proportionnalité

Le niveau de contrôle dépend de l’exposition, de l’irréversibilité, de la sensibilité, du territoire, de la dépendance, de la difficulté de retour et des conséquences possibles. La simplification est permise lorsque ses conditions sont explicites et vérifiées.

## Preuve d’efficacité

La présence d’un document, d’un tableau de bord ou d’une approbation ne démontre pas l’efficacité d’un contrôle. Les cadres doivent être testés par leurs résultats, incidents, exercices, audits et revues.

## Évolution

Cette architecture est révisée lorsque le cycle produit change, qu’un conflit structurel apparaît, qu’un incident révèle une lacune, qu’une obligation externe évolue ou qu’un contrôle produit plus de charge que de protection.

## Fermeture

La version 2.x peut être déclarée institutionnellement complète lorsque :

- tous les cadres essentiels possèdent une référence et un propriétaire;
- leurs relations sont vérifiables;
- les barrières critiques sont explicites;
- les exceptions sont limitées et traçables;
- les contrôles ont été éprouvés dans des cas réels ou représentatifs;
- les lacunes et obligations résiduelles demeurent visibles.

La complétude documentaire n’est jamais présentée comme une preuve de maturité opérationnelle.