# CF2X-PREUVE-0004 — Intégrations versionnées

## Statut

- Initiative liée : `CF2X-INIT-0004`
- Niveau visé : `P1 — preuve conceptuelle reproductible`
- État : `À exécuter`

## Question de preuve

Une intégration externe peut-elle évoluer sans casser silencieusement CityFlow, dupliquer des effets ou rendre une donnée impossible à réconcilier?

## Hypothèses

1. Chaque échange déclare une version de contrat.
2. Une version inconnue est refusée explicitement.
3. Les commandes répétées sont idempotentes.
4. La provenance et l’empreinte du message sont conservées.
5. Les écarts sont détectés par réconciliation.
6. Une intégration peut être suspendue sans bloquer le reste du système.
7. La rotation d’un secret n’interrompt pas les échanges déjà admis.

## Jeux synthétiques

Deux fournisseurs fictifs, trois versions de contrat, des messages valides, périmés, dupliqués, retardés, contradictoires et mal signés.

## Scénarios

1. Échange nominal en version courante.
2. Acceptation contrôlée d’une version antérieure compatible.
3. Refus d’une version inconnue.
4. Double livraison d’un même événement.
5. Livraison dans le désordre.
6. Réponse partielle suivie d’une reprise.
7. Écart entre source et état CityFlow détecté par réconciliation.
8. Rotation de secret avec fenêtre de chevauchement bornée.
9. Signature invalide refusée avant traitement.
10. Suspension d’un fournisseur défaillant.
11. Réactivation après vérification humaine.
12. Dépréciation documentée d’une ancienne version.

## Résultats attendus

- aucun double effet;
- refus explicites et auditables;
- compatibilité déclarée, jamais supposée;
- reprise déterministe;
- écart visible et réconciliable;
- suspension locale;
- provenance complète.

## Critères d’échec

La preuve échoue si un message inconnu est accepté, si un doublon crée un second effet, si un écart demeure invisible, si un secret est exposé ou si la suspension d’une intégration dégrade les autres.

## Artefacts exigés

- contrats synthétiques versionnés;
- catalogue de compatibilité;
- messages d’essai;
- journal des décisions;
- rapport de réconciliation;
- preuve de rotation;
- décision humaine.

## Décision permise

Une réussite P1 permet la construction d’adaptateurs isolés P2. Elle n’autorise aucune connexion à un fournisseur réel ni aucun échange de données municipales.