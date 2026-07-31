# T8 — Registre des dépendances

## Statut

**REGISTRE INITIALISÉ — AUCUNE CARTOGRAPHIE RÉELLE ATTESTÉE**

## Objet

Recenser les dépendances techniques, opérationnelles, contractuelles et informationnelles dont CityFlow dépend pour fonctionner.

## Champs minimaux

| Champ | Description |
|---|---|
| Identifiant | Référence stable de la dépendance |
| Consommateur | Composant, service ou processus dépendant |
| Fournisseur | Composant, service, équipe ou tiers fourni |
| Type | Technique, donnée, humain, contractuel ou infrastructure |
| Finalité | Raison de la dépendance |
| Criticité | Faible, moyenne, élevée ou essentielle |
| Mode de défaillance | Effet attendu en cas d’indisponibilité ou d’altération |
| Détection | Signal ou contrôle permettant de constater une panne |
| Repli | Alternative, mode dégradé ou procédure manuelle |
| Responsable | Propriétaire du suivi |
| Révision | Date ou événement du prochain examen |

## Registre

| Identifiant | Consommateur | Fournisseur | Type | Finalité | Criticité | Défaillance | Détection | Repli | Responsable | Révision |
|---|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Identifier la dépendance avant activation.
2. Documenter sa finalité et son sens de circulation.
3. Évaluer criticité et conséquences de défaillance.
4. Définir surveillance, seuils et propriétaire.
5. Préparer une solution de repli ou accepter explicitement son absence.
6. Réviser après incident, changement ou retrait.
7. Archiver les relations remplacées sans effacer l’historique.

## Gouvernance

- propriétaire du registre : responsables d’architecture et d’exploitation CityFlow;
- mise à jour : à chaque intégration, changement de fournisseur ou modification de flux;
- revue : avant déploiement majeur et durant les exercices de continuité;
- rapprochement : avec actifs, API, fournisseurs, données et environnements;
- historique : Git, décisions d’architecture et changements approuvés.

## Preuves attendues

- contrat ou interface observée;
- propriétaire confirmé;
- test de panne ou de repli;
- signal de surveillance disponible;
- incident ou changement lié;
- décision d’acceptation du risque lorsque le repli manque.

## Barrière finale

Une dépendance documentée n’est pas présumée fiable ni remplaçable. Sa disponibilité, sa sécurité et son mode de repli doivent être démontrés séparément.
