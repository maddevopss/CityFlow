# Préparation à la production — module Inspections

## Statut

Le module Inspections ne peut être déclaré prêt pour la production qu’après intégration et validation des blocs #413 à #417. Ce document constitue la barrière de fermeture de la phase 1; il ne remplace ni les résultats CI ni une autorisation de déploiement.

## Portée de la fermeture

| Bloc | Capacité | Condition de fermeture |
|---|---|---|
| #413 | Performance | pagination, filtres, recherche et index validés sur un volume représentatif |
| #414 | Observabilité | audit, métriques, tableaux de bord et alertes réellement instrumentés |
| #415 | Sécurité | quotas, limites, validations et scénarios d’abus testés |
| #416 | Contrat API | OpenAPI validé automatiquement et conforme aux routes déployées |
| #417 | E2E | parcours complet vert en préproduction sur les navigateurs requis |

## Ordre d’intégration

1. #413 — performance et contrat de liste paginée;
2. #414 — observabilité des opérations réelles;
3. #415 — durcissement et limites d’utilisation;
4. #416 — documentation du contrat stabilisé;
5. #417 — preuve de fonctionnement de bout en bout;
6. #418 — constat final de préparation à la production.

La PR #418 doit être fusionnée en dernier. Elle ne doit pas masquer une dépendance rouge, contournée ou non exécutée.

## Barrières obligatoires

### Qualité applicative

- Backend CI verte, seuils de couverture respectés;
- Frontend CI verte, build de production réussi;
- migrations Prisma applicables sur une base vide et une base représentative;
- aucun test désactivé, ignoré ou rendu permissif sans dérogation documentée.

### Performance

- pagination obligatoire sur les listes potentiellement volumineuses;
- absence de lecture non bornée dans le cycle principal;
- index présents pour les filtres et tris de production;
- temps de réponse mesurés sur un jeu de données représentatif;
- absence de régression détectée sur les tableaux de bord et rapports.

### Sécurité

- isolation municipale vérifiée sur toutes les lectures et mutations;
- contrôle des rôles vérifié pour administrateur, agent, inspecteur et rôle interdit;
- quotas et limites retournant des erreurs stables;
- validation des UUID, dates, transitions, tailles, types MIME et empreintes;
- aucune donnée sensible dans les journaux, métriques ou artefacts E2E.

### Exploitation

- événements d’audit produits pour les opérations critiques;
- métriques de débit, latence et erreurs disponibles;
- tableau de bord d’exploitation importé et lisible;
- alertes configurées et testées;
- procédure de diagnostic et de retour arrière documentée.

### Contrat et intégration

- document OpenAPI syntaxiquement valide;
- exemples compatibles avec les réponses réelles;
- erreurs, rôles et pagination documentés;
- guide développeur couvrant création, affectation, preuve, clôture, rapport et notification.

### E2E

Le scénario automatisé doit démontrer :

1. création d’une inspection;
2. affectation à un inspecteur valide;
3. consultation par l’inspecteur affecté;
4. ajout d’une preuve vérifiable;
5. clôture avec résultat et constats;
6. génération du rapport déterministe;
7. préparation d’une notification;
8. mise à jour de la liste paginée et du tableau de bord;
9. refus d’accès depuis une autre municipalité;
10. refus des rôles non autorisés.

## Décision de mise en production

La décision finale doit être explicite :

- **GO** : toutes les barrières obligatoires disposent de preuves vertes et les risques résiduels sont acceptés;
- **GO sous conditions** : uniquement avec dérogation datée, propriétaire, échéance et mesure compensatoire;
- **NO-GO** : toute défaillance d’isolation, perte de preuve, incohérence de rapport, absence d’observabilité critique ou échec du parcours E2E.

## Preuves attendues

- liens vers les exécutions CI des PR #413 à #417;
- rapports de tests et couverture;
- résultat de validation OpenAPI;
- traces E2E de préproduction;
- capture ou export du tableau de bord d’exploitation;
- résultat des tests de quotas et d’isolation;
- décision GO/NO-GO signée par le responsable de livraison.

## Risques résiduels connus

- les notifications externes nécessitent encore des adaptateurs fournisseurs réels si ceux-ci ne sont pas intégrés;
- la signature de rapport n’équivaut pas à un certificat institutionnel tant qu’un fournisseur de signature n’est pas branché;
- l’optimisation des tournées demeure géométrique sans réseau routier réel;
- la synchronisation hors ligne doit être observée sur des appareils et réseaux représentatifs;
- la conformité réglementaire municipale demeure soumise à validation externe.

## Retour arrière

Avant le déploiement :

- sauvegarde et vérification de restauration de la base;
- inventaire des migrations incluses;
- version applicative précédente identifiable;
- procédure de désactivation du module ou des fonctions nouvelles;
- propriétaires opérationnels disponibles pendant la fenêtre de déploiement.

## Critère de fermeture de la phase 1

La phase 1 est fermée uniquement lorsque :

- #413 à #417 sont fusionnées dans `main`;
- leurs contrôles obligatoires sont verts;
- les preuves sont rassemblées;
- aucun risque bloquant n’est ouvert;
- la décision GO est consignée;
- #418 est fusionnée après vérification de ces conditions.
