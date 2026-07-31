# Évolution de l’architecture CityFlow 2.x

## 1. Objet
Ce cadre définit comment CityFlow fait évoluer son architecture sans perdre la traçabilité, la résilience, la sécurité, la compréhension ni la capacité de retrait.

## 2. Identifiant stable
Chaque décision d’évolution reçoit un identifiant `CF2X-ARCH-xxxx`.

## 3. Principes
- architecture guidée par les besoins réels;
- décisions explicites et révisables;
- dépendances visibles;
- séparation des responsabilités;
- réversibilité proportionnée au risque;
- exploitation et coût considérés dès la conception;
- complexité justifiée par une valeur mesurable.

## 4. Dossier minimal
Le dossier précise :
- problème à résoudre;
- état actuel;
- options étudiées;
- contraintes;
- impacts sur données, sécurité et exploitation;
- dépendances;
- coûts et capacité;
- stratégie de migration;
- retour ou coexistence;
- critères de réussite et de retrait.

## 5. Options
L’option de ne rien changer, de simplifier, de retirer ou de différer doit être examinée avec les options de construction et d’achat.

## 6. Décisions
Toute décision importante documente le contexte, les critères, les compromis, les options rejetées, le niveau de confiance et les déclencheurs de révision.

## 7. Interfaces
Les interfaces internes et externes sont versionnées, documentées et surveillées. Les ruptures exigent une période de transition ou une décision explicite.

## 8. Données
Les changements de modèle, stockage ou flux couvrent migration, compatibilité, intégrité, provenance, sauvegarde et suppression.

## 9. Résilience
L’architecture identifie les points uniques de défaillance, modes dégradés, limites de capacité et mécanismes de confinement.

## 10. Sécurité
Les frontières de confiance, privilèges, secrets, surfaces d’attaque et journaux sont réévalués lors de chaque évolution significative.

## 11. Fournisseurs
Toute dépendance externe critique possède une stratégie de sortie, une compréhension des coûts et un plan de continuité.

## 12. Dette
La dette architecturale est enregistrée avec conséquence, propriétaire, seuil d’escalade et critère de traitement.

## 13. Migration
Les migrations sont progressives lorsque possible, mesurables, réversibles ou compensables, et accompagnées de critères d’arrêt.

## 14. Validation
La validation couvre comportement, performance, sécurité, données, observabilité, accessibilité, exploitation et coût.

## 15. Retrait
Tout composant retiré exige traitement des données, accès, secrets, dépendances, contrats, documentation et surveillance résiduelle.

## 16. Révision
Une décision est revue lors d’un changement majeur de volume, risque, fournisseur, coût, obligation ou preuve.

## 17. Interdictions
Il est interdit de :
- ajouter de la complexité sans problème explicite;
- considérer une technologie comme une stratégie;
- migrer sans preuve de récupération;
- maintenir une dépendance critique non possédée;
- fermer une évolution sans retrait de l’ancien chemin lorsque prévu.

## 18. Liens obligatoires
Le dossier relie initiatives, décisions, risques, dépendances, données, sécurité, fournisseurs, coûts, changements et PR.