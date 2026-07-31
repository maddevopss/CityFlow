---
titre: Résilience et dégradation contrôlée P2
statut: Proposition
categorie: Preuves produit
langue: fr-CA
---

# Résilience et dégradation contrôlée P2

## Objet

Préparer les essais de panne, de ralentissement et de récupération sans exposer un service réel.

## Scénarios minimaux

- indisponibilité d’une dépendance;
- latence excessive;
- perte temporaire de connectivité;
- doublon ou retard d’événement;
- saturation contrôlée;
- restauration après interruption.

## Attentes

Le système doit échouer de façon explicite, conserver la traçabilité, éviter la corruption silencieuse et permettre une reprise vérifiable.

## Arrêt

Tout signe de propagation hors environnement isolé entraîne l’arrêt immédiat.

## État

`PROTOCOLE DÉFINI — RÉSILIENCE NON DÉMONTRÉE`
