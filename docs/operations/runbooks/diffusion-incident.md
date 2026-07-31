# Procédure d’incident — diffusion CityFlow

## Déclenchement

Utiliser cette procédure lorsqu’une alerte critique indique une file morte, un traitement bloqué, un retard critique persistant ou un état global critique.

## 1. Confirmer

- vérifier que l’alerte est toujours active;
- consulter le tableau de bord de diffusion;
- noter l’heure de début, les métriques touchées et le premier symptôme;
- éviter toute relance massive avant d’avoir identifié la cause.

## 2. Contenir

- suspendre les changements non essentiels;
- confirmer la santé de PostgreSQL, Redis, du worker et du backend;
- isoler le composant fautif;
- préserver les journaux et les identifiants de sortie concernés.

## 3. Rétablir

- corriger la dépendance ou la configuration en cause;
- relancer d’abord une seule diffusion morte depuis l’interface administrateur;
- vérifier son passage à l’état traité;
- relancer ensuite les autres éléments par petits lots;
- confirmer la disparition des alertes critiques.

## 4. Clore

- consigner la durée, l’impact et les actions prises;
- confirmer qu’aucune municipalité n’a reçu de données d’une autre municipalité;
- créer un suivi pour toute correction durable;
- remplir le modèle de retour d’expérience.

## Interdictions

Ne jamais modifier directement les statuts en base, supprimer les preuves d’audit ou désactiver les contrôles d’isolation pour accélérer le rétablissement.
