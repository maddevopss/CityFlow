# T11 — Registre des environnements

## Statut

**REGISTRE INITIALISÉ — AUCUN ENVIRONNEMENT RÉEL ATTESTÉ**

## Objet

Maintenir l’inventaire des environnements CityFlow, de leur finalité, de leurs responsables, de leurs données, de leurs accès et de leur cycle de vie.

## Portée

Le registre couvre les environnements locaux, de développement, d’intégration, de validation, de démonstration, de préproduction, de production, de relève et tout environnement temporaire.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | unique et stable |
| Nom | compréhensible |
| Type | local, développement, validation, production ou autre |
| Finalité | usage autorisé |
| Propriétaire | autorité responsable |
| Exploitant | équipe responsable du fonctionnement |
| Hébergement | plateforme et territoire |
| Données autorisées | catégories et restrictions |
| Accès | mécanisme et responsables |
| Version déployée | référence vérifiable |
| Dépendances | services, réseaux et fournisseurs |
| Sauvegarde et reprise | mécanismes applicables |
| Surveillance | signaux et alertes |
| Statut | prévu, actif, dégradé, suspendu ou retiré |
| Dernière revue | date et responsable |

## Registre

| ID | Nom | Type | Finalité | Propriétaire | Version | Données | Statut | Dernière revue | Preuves |
|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Identifier et autoriser l’environnement.
2. Définir finalité, données et accès.
3. Documenter configuration et dépendances.
4. Vérifier avant activation.
5. Réviser après changement significatif.
6. Suspendre ou retirer avec preuve de nettoyage.

## Gouvernance

- propriétaire du registre : responsables d’exploitation CityFlow;
- mise à jour : à toute création, modification, suspension ou suppression;
- revue : au minimum avant chaque déploiement important;
- conservation : historique Git et preuves liées;
- rapprochement : registres des versions, actifs, données, dépendances et fournisseurs.

## Preuves attendues

- configuration effective sans secret exposé;
- liste des accès autorisés;
- version déployée;
- résultats de santé;
- preuve de sauvegarde et de restauration lorsque requise;
- preuve de suppression ou d’assainissement au retrait.

## Barrière finale

L’inscription d’un environnement ne démontre ni sa sécurité, ni sa disponibilité, ni son aptitude à recevoir des données ou du trafic réel. Ces propriétés exigent des validations et preuves distinctes.