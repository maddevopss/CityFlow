# Gestion des changements CityFlow 2.x

## 1. Objet

Ce cadre définit comment CityFlow prépare, autorise, réalise, vérifie et clôt tout changement susceptible d’affecter un service, une donnée, une dépendance, une infrastructure ou une pratique d’exploitation.

Un changement n’est pas seulement une modification de code. Il peut concerner une configuration, une migration, une règle, un fournisseur, une procédure, un accès ou un retrait.

## 2. Identifiant stable

Chaque changement reçoit un identifiant `CF2X-CHG-xxxx` conservé dans les décisions, PR, déploiements, incidents et preuves.

## 3. Catégories

- standard : répétable, documenté et à faible risque;
- normal : évalué et autorisé avant exécution;
- renforcé : risque, portée ou irréversibilité élevés;
- urgent : nécessaire pour contenir un danger immédiat.

L’urgence réduit le délai, jamais l’obligation de preuve et de revue après action.

## 4. Fiche minimale

La fiche précise :

- intention et résultat attendu;
- services, données et territoires touchés;
- propriétaire et décideur;
- risques et dépendances;
- plan de validation;
- stratégie de déploiement;
- seuils d’arrêt;
- plan de retour ou confinement;
- fenêtre et capacité disponibles;
- communication requise.

## 5. Évaluation

L’évaluation couvre au minimum :

- effet sur les personnes et parcours;
- sécurité et confidentialité;
- intégrité, migration et récupération des données;
- disponibilité, performance et capacité;
- accessibilité et disparités géographiques;
- exploitation, soutien et fournisseurs;
- coût d’action et coût d’inaction;
- réversibilité réelle.

## 6. Autorisation

Aucune personne ne peut proposer, autoriser, exécuter et valider seule un changement renforcé ou critique.

Les barrières de sécurité, données et continuité ne peuvent être compensées par une priorité commerciale.

## 7. Préparation

Avant exécution :

- les critères de succès et d’échec sont figés;
- les accès temporaires sont limités;
- la sauvegarde ou opération compensatoire est vérifiée;
- les responsables de surveillance et retour sont disponibles;
- les dépendances critiques sont confirmées;
- la communication est prête.

## 8. Exécution

L’exécution suit les étapes prévues. Toute divergence significative déclenche une pause, une décision et une trace.

Les changements renforcés utilisent une exposition progressive lorsque possible.

## 9. Validation et surveillance

Après exécution, CityFlow vérifie :

- le résultat fonctionnel;
- l’intégrité des données;
- les indicateurs de protection;
- les erreurs silencieuses;
- les parcours réels;
- l’état des dépendances;
- les coûts et la charge d’exploitation.

## 10. Retour, confinement et retrait

Le retour est déclenché par les seuils préétablis. Lorsqu’un retour complet est impossible, le dossier précise les opérations compensatoires, le confinement et le risque résiduel.

## 11. Changement urgent

Un changement urgent exige :

- une autorité nommée;
- un motif factuel;
- une portée minimale;
- une surveillance active;
- une revue après action dans le délai fixé;
- la régularisation des preuves manquantes.

## 12. Échec et incident

Tout incident lié au changement référence `CF2X-CHG-xxxx`. Le changement ne peut être déclaré réussi sur la seule disparition d’une alerte.

## 13. Fermeture

La fermeture exige :

- validation documentée;
- résultat et écarts enregistrés;
- accès temporaires retirés;
- documentation mise à jour;
- risques résiduels attribués;
- coûts réels consignés;
- apprentissages transmis.

## 14. Interdictions

Il est interdit de :

- modifier les seuils après observation pour fabriquer un succès;
- exécuter un changement critique sans capacité de confinement;
- masquer une divergence au plan;
- confondre déploiement terminé et changement validé;
- fermer un changement avec obligations sans propriétaire.

## 15. Liens obligatoires

Le dossier relie selon le cas : initiative, décision, risque, dépendance, validation, mise en service, incident, problème, fournisseur et PR.