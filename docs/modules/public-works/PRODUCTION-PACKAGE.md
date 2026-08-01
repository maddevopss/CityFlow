# Travaux publics — Paquet de production

## Sécurité

- isolation municipale sur ordres, journaux, équipes, coûts et preuves;
- séparation entre création, affectation, exécution et vérification;
- transitions d’état contrôlées et idempotence des opérations mobiles;
- limites de lots hors ligne, coûts, heures et pièces;
- quotas initiaux : 120 lectures/minute, 40 écritures/minute, 20 journaux/minute par travailleur;
- aucune preuve binaire dans PostgreSQL; stockage objet, empreinte SHA-256 et antivirus;
- coûts négatifs ou supérieurs aux limites municipales refusés.

## Exploitation

Métriques : arriéré, ordres urgents, délais de prise en charge, durée d’intervention, taux de blocage, coûts estimés/réels, interventions répétées et erreurs de synchronisation. Alertes : ordre urgent non affecté, ordre bloqué depuis plus de 24 heures, dépassement de coût, échec de synchronisation ou p95 supérieur à 1 seconde.

## Retour arrière

Désactiver création et transitions, conserver les journaux et preuves, revenir au déploiement précédent et ne jamais supprimer automatiquement un ordre exécuté. Toute migration descendante exige sauvegarde et approbation.

## Barrière de production

GO après migrations, rôles, coûts, journaux, interface, OpenAPI, synchronisation et E2E verts. Toute fuite intermunicipale, perte de journal, double application d’une opération ou fermeture sans preuve entraîne NO-GO.
