# Sécurité produit CityFlow 2.x

## 1. Objet
Ce cadre définit comment CityFlow intègre la sécurité dans le cycle de vie du produit, depuis l’admission jusqu’au retrait.

## 2. Identifiant stable
Chaque dossier reçoit un identifiant `CF2X-SEC-xxxx`.

## 3. Principes
- sécurité proportionnée au risque;
- moindre privilège;
- séparation des responsabilités;
- défense en profondeur;
- journalisation vérifiable;
- réduction de la surface d’attaque;
- capacité de confinement et retrait.

## 4. Analyse minimale
Le dossier couvre :
- actifs à protéger;
- personnes et données exposées;
- frontières de confiance;
- menaces plausibles;
- vulnérabilités connues;
- dépendances et fournisseurs;
- barrières préventives, détectives et correctives;
- risque résiduel.

## 5. Identités et accès
Les accès sont authentifiés, autorisés, limités, révisés et retirés. Les privilèges élevés sont temporaires lorsque possible et soumis à une trace exploitable.

## 6. Secrets
Les secrets ne sont ni codés en dur ni partagés sans contrôle. Leur rotation, révocation, portée et utilisation sont surveillées.

## 7. Développement
Les changements sensibles exigent revue, tests, analyse des dépendances, validation des entrées, gestion des erreurs et preuve de non-régression.

## 8. Données
Les protections couvrent transit, repos, sauvegardes, journaux, exportations, suppression et récupération.

## 9. Dépendances
Les composants externes sont inventoriés, versionnés, surveillés et remplaçables. Une vulnérabilité critique déclenche une décision explicite.

## 10. Validation
La validation inclut selon le risque :
- contrôles automatisés;
- tests d’autorisation;
- isolation entre organisations;
- abus de logique métier;
- exposition de données;
- résilience et limitation;
- revue indépendante.

## 11. Mise en service
La mise en service vérifie les configurations, accès, journaux, alertes, seuils, retour et capacité de confinement.

## 12. Vulnérabilités
Toute vulnérabilité reçoit gravité, exposition, propriétaire, échéance, mesure compensatoire et preuve de correction.

## 13. Incidents
Les incidents de sécurité privilégient protection, confinement, préservation des preuves, communication contrôlée et rétablissement vérifié.

## 14. Exceptions
Une exception est limitée, justifiée, approuvée, compensée, surveillée et assortie d’une date d’expiration.

## 15. Retrait
Le retrait traite les accès, secrets, données, journaux, dépendances, environnements et obligations résiduelles.

## 16. Interdictions
Il est interdit de :
- accepter un risque critique sans autorité et durée;
- masquer une vulnérabilité par changement de classification;
- considérer un test automatisé comme preuve complète;
- maintenir un accès sans propriétaire;
- déployer un changement critique sans confinement réalisable.

## 17. Liens obligatoires
Le dossier relie initiatives, risques, décisions, données, fournisseurs, architecture, changements, incidents, validation et PR.