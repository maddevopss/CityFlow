# Fermeture et retrait des initiatives 1.x

## Objet

Ce document définit les conditions minimales permettant de fermer, suspendre, retirer ou archiver une initiative CityFlow 1.x.

Une initiative n’est pas terminée parce que son code est fusionné, que son écran est visible ou que son déploiement a réussi. Elle est terminée lorsque son effet réel est établi, que ses obligations résiduelles sont attribuées et que sa continuité ou son retrait ne crée pas de risque caché.

## Principes

1. aucune fermeture sans preuve vérifiable;
2. aucune fermeture avec risque critique non traité;
3. aucun retrait sans plan de transition;
4. aucune donnée abandonnée sans règle de conservation ou de suppression;
5. aucune dépendance laissée sans propriétaire;
6. aucune fermeture qui efface l’historique de décision;
7. aucun succès déclaré uniquement à partir d’une livraison technique.

## États de fin de vie

### Confirmée

L’initiative a atteint ses résultats attendus, respecte les barrières obligatoires et peut entrer dans l’exploitation courante.

### Fermée avec suivi

Le résultat principal est confirmé, mais des obligations résiduelles limitées demeurent. Elles possèdent un responsable, une échéance et une méthode de vérification.

### Suspendue

L’initiative est arrêtée temporairement parce qu’une condition essentielle manque, qu’un risque doit être réduit ou qu’une dépendance externe bloque la suite.

### Réduite

Une partie de l’initiative est conservée, tandis que les éléments non prouvés, trop coûteux ou trop risqués sont retirés.

### Retirée

La capacité est désactivée et supprimée de l’usage normal. Le retrait comprend la transition, le traitement des données, les communications et les vérifications après coup.

### Arrêtée

L’initiative cesse parce que son résultat n’est pas démontré, que son coût n’est plus acceptable, qu’une barrière obligatoire échoue ou que sa poursuite n’est plus justifiée.

### Archivée

L’initiative ne produit plus de travail actif. Ses décisions, preuves, résultats et leçons restent consultables selon les règles de conservation applicables.

## Conditions obligatoires de fermeture

Avant une fermeture, le responsable doit confirmer :

- l’identifiant de l’initiative;
- la décision finale et sa date;
- le décideur et les personnes consultées;
- la comparaison avec la situation de référence;
- les résultats observés;
- les écarts par rapport aux seuils prévus;
- l’état des risques;
- l’état des dépendances;
- l’état des coûts d’exploitation;
- le traitement des données et des accès;
- la documentation opérationnelle;
- le soutien et l’escalade;
- le plan de retour arrière ou de retrait, lorsqu’applicable;
- les obligations résiduelles;
- la prochaine date de vérification, lorsqu’un suivi demeure.

## Barrières non compensables

Une initiative ne peut pas être confirmée ou fermée comme réussie si l’une des conditions suivantes demeure en échec :

- isolation entre organisations ou utilisateurs;
- sécurité des accès et des secrets;
- intégrité des données;
- traçabilité des actions importantes;
- possibilité de récupérer ou de corriger une erreur grave;
- respect des obligations légales ou contractuelles applicables;
- coût d’exploitation manifestement non soutenable;
- absence de propriétaire pour un risque critique.

Un bon résultat d’usage ne compense jamais une barrière de sécurité ou d’intégrité en échec.

## Dossier de fermeture

Le dossier de fermeture contient au minimum :

1. un résumé du problème initial;
2. la portée réellement livrée;
3. la preuve d’utilisation réelle;
4. la preuve de résultat;
5. les limites connues;
6. les incidents ou écarts observés;
7. les coûts constatés;
8. les décisions de poursuite, réduction ou retrait;
9. les responsabilités transférées à l’exploitation;
10. les éléments explicitement non réalisés;
11. les leçons réutilisables;
12. les références vers les preuves sources.

Les preuves doivent être accessibles, datées et suffisamment précises pour permettre une vérification indépendante.

## Retrait d’une capacité

Tout retrait doit définir :

- la raison du retrait;
- les utilisateurs touchés;
- la date de fin d’usage;
- les communications prévues;
- la solution de remplacement, si elle existe;
- le traitement des données existantes;
- la révocation des accès, tâches planifiées, secrets et intégrations;
- la suppression ou l’archivage du code et de la configuration;
- la surveillance après retrait;
- les conditions de réactivation exceptionnelle;
- le responsable de la vérification finale.

## Traitement des données

La fermeture ou le retrait doit préciser, pour chaque catégorie de données :

- si elle est conservée, transférée, anonymisée ou supprimée;
- la justification;
- la durée de conservation;
- le propriétaire;
- la méthode de vérification;
- les dépendances qui utilisent encore ces données.

Aucune suppression irréversible ne doit être exécutée sans preuve d’autorisation et sans vérification de ses effets sur les systèmes dépendants.

## Transfert vers l’exploitation

Lorsqu’une initiative devient une capacité durable, le transfert comprend :

- un propriétaire opérationnel;
- des objectifs de service compréhensibles;
- les signaux de santé;
- les alertes pertinentes;
- les procédures d’intervention;
- les procédures de retour arrière;
- les dépendances critiques;
- les coûts récurrents;
- les limites de capacité;
- la documentation de soutien;
- la fréquence de revue.

Sans transfert explicite, l’initiative demeure ouverte.

## Vérification après fermeture

Une vérification post-fermeture est requise lorsque :

- l’initiative touche des données sensibles;
- elle modifie l’isolation ou les autorisations;
- elle entraîne un coût récurrent significatif;
- elle remplace une capacité existante;
- elle a connu un incident important;
- ses résultats demandent du temps pour être confirmés;
- son retrait peut laisser des dépendances cachées.

La vérification doit confirmer que :

- les résultats persistent;
- aucun risque nouveau n’est apparu;
- les anciennes dépendances sont réellement retirées;
- les coûts correspondent aux prévisions;
- les utilisateurs ne contournent pas la solution;
- les obligations résiduelles progressent.

## Réouverture

Une initiative fermée peut être rouverte lorsqu’une preuve nouvelle montre :

- une régression importante;
- un risque non détecté;
- une dépendance oubliée;
- un coût réel supérieur au seuil accepté;
- une atteinte à la sécurité, à l’isolation ou à l’intégrité;
- un résultat utilisateur qui ne persiste pas;
- une obligation résiduelle abandonnée.

La réouverture conserve l’identifiant d’origine et ajoute une nouvelle décision datée. L’historique ne doit pas être réécrit.

## Décision finale

La décision finale doit utiliser une formulation explicite parmi les suivantes :

- confirmer et transférer à l’exploitation;
- fermer avec suivi résiduel;
- réduire la portée et poursuivre;
- suspendre jusqu’à satisfaction des conditions;
- retirer progressivement;
- arrêter immédiatement;
- archiver sans mise en service.

Toute décision indique :

- la justification;
- les preuves utilisées;
- les risques acceptés;
- le propriétaire des suites;
- les dates de vérification;
- les conditions de réouverture.

## Règle de clôture

Une initiative ne peut passer à l’état fermé que lorsque :

- sa décision finale est enregistrée;
- son résultat est comparé au point de départ;
- ses barrières obligatoires sont satisfaites;
- ses risques résiduels sont attribués;
- ses données et accès sont traités;
- son exploitation ou son retrait possède un propriétaire;
- ses preuves sont conservées;
- sa prochaine vérification est planifiée lorsque nécessaire.

En l’absence de ces éléments, l’initiative reste ouverte, suspendue ou en retrait. Elle ne doit pas être déclarée réussie par défaut.