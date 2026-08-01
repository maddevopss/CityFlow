# Guide d’exploitation — Permis municipaux

## Vérifications quotidiennes

- surveiller les erreurs 5xx des routes `/api/v1/permits`;
- repérer les conflits répétés d’ingestion ou de paiement;
- contrôler les permis bloqués en `SUBMITTED`;
- examiner les pièces refusées ou toujours en attente;
- vérifier les délivrances absentes malgré un permis approuvé et payé.

## Diagnostic rapide

1. Confirmer la municipalité et le rôle contenus dans le jeton.
2. Vérifier l’état courant du permis.
3. Consulter l’historique `EventAudit`.
4. Contrôler la conformité des pièces obligatoires.
5. Contrôler l’état des frais.
6. Rejouer uniquement une opération idempotente avec la même référence.

## Incidents fréquents

- `PERMIT_NOT_FOUND` : mauvais identifiant ou isolation municipale correcte;
- `PERMIT_DOCUMENTS_INCOMPLETE` : pièce manquante, en attente ou refusée;
- `PERMIT_FEE_ALREADY_PAID` : paiement déjà constaté avec une autre référence;
- conflit de transition : état courant incompatible;
- délivrance refusée : décision, pièces ou frais non conformes.

## Actions interdites

- modifier directement les états en base;
- contourner l’audit;
- réutiliser une référence de paiement différente;
- supprimer une pièce pour masquer un refus;
- désactiver un limiteur pour résoudre un incident.

## Escalade

Conserver l’identifiant du permis, la municipalité, le code d’erreur, l’heure UTC, la route appelée et l’identifiant de corrélation avant toute escalade technique.