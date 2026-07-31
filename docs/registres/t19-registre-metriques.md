# T19 — Registre des métriques

## Statut

**REGISTRE INITIALISÉ — AUCUNE MÉTRIQUE RÉELLE ATTESTÉE**

## Objet

Recenser les métriques CityFlow, leur finalité, leur méthode de calcul, leur source, leur qualité, leurs seuils, leurs responsables et leurs usages autorisés.

## Champs minimaux

| Champ | Description |
|---|---|
| Identifiant | Référence stable |
| Nom | Désignation compréhensible |
| Finalité | Décision ou compréhension visée |
| Définition | Ce qui est réellement mesuré |
| Formule | Méthode de calcul |
| Source | Données et systèmes utilisés |
| Période | Fenêtre et fréquence de mesure |
| Propriétaire | Responsable de la définition |
| Producteur | Service ou processus qui calcule |
| Consommateurs | Publics et décisions utilisant la métrique |
| Seuils | Valeurs d’attention, alerte ou arrêt |
| Qualité | Complétude, fraîcheur, exactitude et limites |
| Coût | Ressources nécessaires à la production |
| État | Proposée, active, suspendue ou retirée |
| Révision | Date ou événement du prochain examen |

## Registre

| Identifiant | Nom | Finalité | Définition | Formule | Source | Période | Propriétaire | Producteur | Consommateurs | Seuils | Qualité | Coût | État | Révision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Définir la question ou décision soutenue.
2. Documenter formule, sources, période et limites.
3. Attribuer propriétaire, producteur et consommateurs.
4. Valider le calcul sur des données représentatives.
5. Fixer seuils, alertes et réactions attendues.
6. Surveiller qualité, coût, dérive et mauvais usages.
7. Réviser, suspendre ou retirer lorsque la métrique n’est plus fiable ou utile.

## Gouvernance

- propriétaire du registre : responsables d’observabilité et de gouvernance des données CityFlow;
- mise à jour : à chaque création, changement de formule, source, seuil ou usage;
- revue : périodique et après anomalie de mesure;
- rapprochement : avec données, obligations, risques, publications et décisions;
- historique : définitions, versions, résultats de validation et retraits conservés.

## Preuves attendues

- formule et jeu de données de validation;
- provenance et qualité des sources;
- résultats de comparaison ou recalcul;
- seuils approuvés;
- exemples d’interprétation correcte et incorrecte;
- preuve de suspension ou retrait.

## Barrière finale

Une métrique inscrite n’est pas présumée exacte, utile, comparable ou apte à décider seule. Son interprétation doit conserver la portée, les limites et l’incertitude de la mesure.
