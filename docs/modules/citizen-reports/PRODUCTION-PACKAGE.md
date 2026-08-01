# Signalements citoyens — Paquet de production

## Sécurité et confidentialité

- séparation stricte entre données publiques et internes;
- jeton de suivi secret jamais journalisé;
- isolation municipale sur les files, messages, pièces et affectations;
- limitation de débit, anti-abus et validation des pièces;
- conservation minimale des coordonnées et consentement explicite.

## Exploitation

Métriques : volume reçu, délai de triage, délai de première réponse, arriéré, réouvertures, doublons et taux de résolution. Alertes : hausse anormale, signalement urgent non affecté, message citoyen sans réponse et p95 supérieur à 1 seconde.

## Retour arrière

Désactiver les écritures publiques, conserver les numéros et jetons existants, revenir au déploiement précédent et ne supprimer aucune preuve ni communication.

## Barrière GO/NO-GO

GO seulement après validation OpenAPI, confidentialité, anti-abus, notifications, suivi public, isolation intermunicipale et E2E. Toute fuite de données internes ou exposition d’un jeton entraîne NO-GO.
