# Registre des initiatives CityFlow 1.x

## Objet

Ce registre transforme les décisions d’admission en suivi opérationnel vérifiable. Toute initiative 1.x doit y être inscrite avant le début de sa réalisation.

## Règles

- une initiative possède un identifiant unique et stable;
- un seul responsable de décision est nommé;
- aucun état ne change sans date, auteur et justification;
- les preuves sont liées, jamais remplacées par une appréciation générale;
- une initiative sans prochaine décision, responsable ou échéance est considérée bloquée;
- les risques d’isolation, de sécurité ou d’intégrité suspendent la priorité ordinaire.

## États permis

- **proposée** : problème décrit, admission non décidée;
- **à préciser** : preuves ou contraintes insuffisantes;
- **admise** : décision formelle prise, réalisation non commencée;
- **planifiée** : capacité, dépendances et fenêtre définies;
- **en réalisation** : travaux autorisés et suivis;
- **en validation** : résultat construit, preuves en cours;
- **déployée sous observation** : mise en service limitée ou surveillée;
- **fermée** : effet réel mesuré et obligations transférées;
- **reportée** : décision différée avec condition de réexamen;
- **refusée** : non admise avec justification;
- **arrêtée** : initiative interrompue selon un critère d’arrêt.

## Fiche de registre

Chaque entrée contient au minimum :

| Champ | Exigence |
|---|---|
| Identifiant | Référence stable, par exemple `CF-1X-001` |
| Titre | Résultat attendu en langage simple |
| Problème | Situation réelle à corriger |
| Utilisateurs touchés | Groupes concernés et effets observés |
| État | Une valeur de la liste permise |
| Responsable | Personne qui porte la décision |
| Date de dernière décision | Date vérifiable |
| Prochaine décision | Action ou arbitrage attendu |
| Échéance | Date ou condition de réexamen |
| Priorité | Justification, pas seulement une cote |
| Dépendances | Techniques, humaines, juridiques ou contractuelles |
| Risques | Sécurité, isolation, intégrité, accessibilité et exploitation |
| Données concernées | Catégories, municipalités et sensibilité |
| Coût d’exploitation | Soutien, surveillance, stockage et maintenance |
| Preuves d’admission | Lien vers la fiche d’admission et ses éléments |
| Preuves de validation | Tests, revues, exercices et résultats |
| Conditions d’arrêt | Seuils ou événements déclencheurs |
| Retour arrière | Méthode de retrait ou de restauration |
| Effet réel | Mesure après mise en service |
| Décision de fermeture | Auteur, date et justification |

## Priorisation

La priorité tient compte de l’impact réel, du nombre d’utilisateurs touchés, de l’urgence, de la réduction de risque, de l’effort, du coût d’exploitation et des dépendances.

Une note élevée ne permet jamais de contourner une barrière de sécurité, d’isolation, d’intégrité ou de conformité.

## Mise à jour

Le registre est révisé :

- à chaque changement d’état;
- lorsqu’un risque, une dépendance ou un coût change;
- avant chaque décision de planification;
- après tout incident lié à une initiative;
- pendant l’observation suivant le déploiement;
- lors de la fermeture ou de l’arrêt.

## Fermeture

Une initiative ne peut être fermée que si :

- les critères d’acceptation sont démontrés;
- les risques résiduels sont acceptés explicitement;
- la supervision et le soutien sont attribués;
- la documentation est à jour;
- le retour arrière a été vérifié ou justifié;
- l’effet réel a été mesuré;
- les suivis restants ont un propriétaire et une échéance.

La fermeture administrative sans preuve du résultat est interdite.
