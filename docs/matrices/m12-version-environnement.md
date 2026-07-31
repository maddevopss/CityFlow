# M12 — Matrice version ↔ environnement

## Statut

**MATRICE ACTIVE — AUCUN DÉPLOIEMENT ATTESTÉ PAR CE DOCUMENT**

## Objet

Relier chaque version CityFlow aux environnements où elle est installée, validée, remplacée ou retirée.

## Colonnes obligatoires

| Version | Artefact | Empreinte | Environnement | Date déploiement | Statut | Configuration | Migration | Validation | Responsable |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — |

## Règles

- utiliser les identifiants des registres T11 et T12;
- conserver l’empreinte exacte de l’artefact déployé;
- distinguer déployé, actif, en validation, remplacé et retiré;
- consigner les migrations et configurations propres à l’environnement;
- relier chaque état à une preuve de déploiement ou de retrait;
- interdire les corrections manuelles non tracées.

## Contrôles de cohérence

- aucune version active sans environnement et responsable;
- aucune même version associée à deux artefacts différents;
- aucune migration sans ordre, résultat et stratégie de retour;
- tout environnement critique possède une version connue et vérifiable.

## Gouvernance

- propriétaire : responsables de livraison et d’exploitation;
- revue : à chaque déploiement, retour arrière, remplacement ou retrait;
- conservation : historique complet des versions utilisées comme preuve.

## Barrière finale

La présence d’une version dans cette matrice ne prouve ni son bon fonctionnement ni son intégrité. Les empreintes, validations et observations de l’environnement demeurent déterminantes.
