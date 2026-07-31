# Continuité des services CityFlow 2.x

## 1. Objet
Ce cadre définit comment CityFlow maintient ou rétablit ses capacités essentielles lors d’une panne, d’une perte de données, d’une défaillance fournisseur, d’un sinistre ou d’une indisponibilité prolongée.

## 2. Identifiant stable
Chaque plan reçoit un identifiant `CF2X-BCP-xxxx`.

## 3. Portée
La continuité couvre les services, données, identités, communications, fournisseurs, infrastructures, procédures manuelles et responsabilités humaines.

## 4. Criticité
Chaque capacité est classée selon son effet réel : essentiel, important, différable ou retirable.

## 5. Objectifs
Le dossier fixe :
- délai maximal acceptable avant rétablissement;
- perte de données maximale acceptable;
- niveau minimal de service;
- durée maximale du mode dégradé;
- ordre de restauration;
- dépendances indispensables.

## 6. Scénarios
Les scénarios incluent au minimum :
- indisponibilité d’une région;
- corruption ou suppression de données;
- compromission d’identités;
- perte d’un fournisseur critique;
- rupture réseau;
- surcharge durable;
- indisponibilité d’une personne clé;
- erreur de déploiement irréversible.

## 7. Stratégies
Chaque scénario possède une stratégie de prévention, détection, confinement, bascule, récupération et retour à la normale.

## 8. Données
Les sauvegardes sont chiffrées, isolées, surveillées et restaurées périodiquement. Une sauvegarde non testée ne constitue pas une preuve de récupérabilité.

## 9. Mode dégradé
Le mode dégradé précise les fonctions disponibles, les protections conservées, les limites, les communications et les conditions de sortie.

## 10. Fournisseurs
Les dépendances externes critiques disposent d’une solution de repli, d’une stratégie de sortie et d’une compréhension des délais réels de récupération.

## 11. Exercices
Les exercices sont proportionnés au risque et couvrent les décisions, communications, accès, données et procédures. Les résultats défavorables sont conservés.

## 12. Activation
L’autorité d’activation, les seuils et les rôles sont nommés à l’avance. Toute activation est horodatée et reliée aux incidents concernés.

## 13. Retour à la normale
Le retour vérifie l’intégrité des données, les parcours essentiels, les écarts accumulés, la sécurité et la capacité opérationnelle.

## 14. Révision
Le plan est révisé après exercice, incident, changement critique, changement fournisseur ou évolution importante de l’architecture.

## 15. Fermeture d’un exercice
La fermeture exige les preuves, écarts, actions, propriétaires, échéances et risques résiduels.

## 16. Interdictions
Il est interdit de :
- déclarer un service résilient sans exercice;
- dépendre d’une seule personne non remplaçable;
- supposer qu’un fournisseur garantit automatiquement la continuité;
- sacrifier sécurité ou intégrité sans décision explicite;
- effacer les échecs d’exercice.

## 17. Liens obligatoires
Le plan relie les services, risques, dépendances, fournisseurs, incidents, changements, données, architecture et décisions.