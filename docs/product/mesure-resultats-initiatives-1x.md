# Mesure des résultats des initiatives CityFlow 1.x

## Objet

Ce document définit comment CityFlow vérifie qu’une initiative produit un effet réel, utile et durable avant de la déclarer terminée.

Une livraison technique ne constitue pas, à elle seule, une réussite. Une initiative n’est fermée que lorsque les résultats attendus sont observés, documentés et jugés suffisants.

## Principes

1. Toute initiative admise doit posséder une hypothèse de résultat vérifiable.
2. Les mesures doivent être définies avant le développement ou avant l’expérimentation.
3. Les résultats techniques, opérationnels et utilisateurs sont évalués séparément.
4. Une amélioration ne doit pas masquer une dégradation de sécurité, d’isolation, de fiabilité ou de coût.
5. Une absence de preuve n’est jamais interprétée comme une réussite.
6. Les données utilisées doivent être minimales, justifiées et protégées.
7. Toute conclusion doit distinguer faits observés, interprétation et décision.

## Fiche de mesure obligatoire

Chaque initiative active doit documenter au minimum :

- l’identifiant stable de l’initiative;
- le problème de départ;
- les utilisateurs ou opérateurs concernés;
- l’hypothèse de résultat;
- la situation de référence;
- les indicateurs retenus;
- la période d’observation;
- les sources de données;
- les risques de mesure;
- les seuils de réussite, d’alerte et d’arrêt;
- la personne responsable de l’analyse;
- la date de la prochaine décision.

## Catégories de résultats

### 1. Résultat utilisateur

Exemples :

- réduction du temps requis pour accomplir une tâche;
- diminution des erreurs ou abandons;
- meilleure compréhension de l’état d’une opération;
- réduction des étapes manuelles;
- accessibilité améliorée;
- satisfaction ou confiance mieux documentée.

### 2. Résultat opérationnel

Exemples :

- réduction des interventions manuelles;
- diminution des incidents récurrents;
- amélioration du temps de détection ou de résolution;
- réduction du travail de soutien;
- meilleure traçabilité;
- augmentation de la capacité sans perte de qualité.

### 3. Résultat technique

Exemples :

- fiabilité accrue;
- latence réduite;
- couverture de tests améliorée;
- déploiement ou retour arrière plus sûr;
- diminution de la dette technique;
- réduction des erreurs silencieuses.

### 4. Résultat économique

Exemples :

- coût d’exploitation réduit;
- meilleure utilisation des ressources;
- réduction du coût par opération;
- diminution des pertes ou reprises;
- valeur créée supérieure au coût total de maintien.

## Situation de référence

Avant toute comparaison, l’initiative doit documenter la situation initiale avec suffisamment de précision pour permettre une évaluation honnête.

La référence doit préciser :

- la période observée;
- le volume concerné;
- les limites connues;
- les événements exceptionnels;
- les écarts de qualité des données;
- les facteurs externes pouvant influencer le résultat.

Une référence reconstruite après coup doit être explicitement identifiée comme telle.

## Qualité des indicateurs

Un indicateur acceptable doit être :

- directement lié au problème;
- compréhensible;
- reproductible;
- disponible à un coût raisonnable;
- peu sensible aux manipulations;
- accompagné de ses limites;
- compatible avec les exigences de confidentialité.

Les indicateurs de volume seuls ne suffisent pas. Par exemple, le nombre d’utilisations ne prouve ni l’utilité, ni la qualité, ni l’absence de dommage.

## Barrières non compensables

Une initiative ne peut pas être déclarée réussie si l’un des éléments suivants est présent :

- faille de sécurité non maîtrisée;
- rupture d’isolation entre organisations;
- perte ou corruption de données;
- absence de retour arrière raisonnable;
- augmentation importante des incidents;
- coût d’exploitation non soutenable;
- dépendance critique sans responsable;
- effet négatif important sur l’accessibilité ou l’usage.

Une bonne note globale ne compense jamais une barrière critique.

## Périodes d’observation

La durée d’observation doit correspondre au type de résultat attendu.

Trois étapes sont recommandées :

1. **validation immédiate** : fonctionnement, sécurité, intégrité et absence de régression majeure;
2. **validation courte** : usage réel, incidents, soutien et premiers effets;
3. **validation durable** : stabilité du résultat, coût de maintien et effets secondaires.

Une initiative peut être livrée sans être fermée. Elle reste alors en observation.

## Décisions possibles

À la fin d’une période de mesure, la décision doit être explicitement consignée :

- **confirmer** : le résultat est démontré et durable;
- **poursuivre l’observation** : les données sont encore insuffisantes;
- **ajuster** : le résultat est partiel ou les effets secondaires exigent une correction;
- **réduire la portée** : seule une partie de l’initiative est justifiée;
- **suspendre** : un risque ou une incertitude empêche de continuer;
- **retirer** : le résultat est insuffisant ou le coût est disproportionné;
- **arrêter immédiatement** : une barrière critique est franchie.

## Conditions de fermeture

Une initiative peut passer à l’état `fermée` seulement si :

- les résultats attendus sont comparés à la référence;
- les écarts sont expliqués;
- les risques résiduels sont acceptés explicitement;
- les coûts réels de maintien sont connus;
- la documentation et le soutien sont à jour;
- les actions restantes possèdent un responsable distinct;
- le registre des initiatives contient la décision finale;
- les preuves sont accessibles et durables.

## Compte rendu final

Le compte rendu de fermeture doit contenir :

1. le problème initial;
2. la solution ou le changement livré;
3. les résultats attendus;
4. les résultats observés;
5. les écarts et limites;
6. les incidents ou effets secondaires;
7. le coût réel;
8. la décision finale;
9. les leçons réutilisables;
10. les éléments à surveiller après fermeture.

## Responsabilités

Le responsable de l’initiative assure la collecte et la mise à jour des preuves.

La personne qui accepte la fermeture doit vérifier que :

- les preuves sont suffisantes;
- les limites sont visibles;
- les barrières critiques sont respectées;
- la décision ne repose pas uniquement sur l’équipe ayant réalisé le changement.

## Traçabilité

Les mesures, décisions et changements de seuil doivent être datés et reliés à l’initiative correspondante.

Toute modification d’un indicateur après le début de l’observation doit conserver :

- l’ancienne définition;
- la nouvelle définition;
- la raison du changement;
- l’impact sur les comparaisons déjà produites.

## Règle finale

CityFlow ne confond pas « livré », « utilisé » et « utile ».

Une initiative 1.x n’est terminée que lorsque son effet réel est démontré, que ses risques sont maîtrisés et que son maintien demeure justifiable.
