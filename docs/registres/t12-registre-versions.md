# T12 — Registre des versions

## Statut

**REGISTRE INITIALISÉ — AUCUNE VERSION RÉELLE ATTESTÉE**

## Objet

Conserver la trace des versions CityFlow, de leur contenu, de leurs artefacts, de leurs compatibilités, de leur déploiement et de leur retrait.

## Portée

Le registre couvre les applications, services, API, schémas de données, documents, configurations et artefacts livrables.

## Champs minimaux

| Champ | Exigence |
|---|---|
| Identifiant | unique |
| Composant | élément versionné |
| Version | valeur immuable |
| Type | développement, candidate, stable, corrective ou retirée |
| Source | commit, tag ou référence documentaire |
| Artefact | emplacement et empreinte |
| Changements | résumé et liens |
| Compatibilité | versions et consommateurs concernés |
| Migrations | exigences et retour arrière |
| Validations | résultats associés |
| Approbation | autorité et date |
| Environnements | lieux de déploiement |
| Statut | préparée, publiée, active, remplacée ou retirée |
| Date | publication ou retrait |

## Registre

| ID | Composant | Version | Source | Artefact | Compatibilité | Statut | Date | Preuves |
|---|---|---|---|---|---|---|---|---|

## Cycle de vie

1. Attribuer une version avant livraison.
2. Relier la version à une source et un artefact immuables.
3. Documenter changements, migrations et compatibilité.
4. Valider et approuver la publication.
5. Suivre les environnements actifs.
6. Marquer remplacement et retrait sans effacer l’historique.

## Gouvernance

- propriétaire du registre : responsables de livraison CityFlow;
- mise à jour : à chaque création, publication, déploiement, remplacement ou retrait;
- revue : avant toute activation et lors des revues de dépendances;
- conservation : permanente pour les versions publiées;
- rapprochement : registres des environnements, changements, validations, API et données.

## Preuves attendues

- commit ou tag exact;
- empreinte de l’artefact;
- notes de version;
- validations réussies et réserves;
- décision de publication;
- preuve de déploiement ou de retrait.

## Barrière finale

Une version inscrite n’est ni sûre, ni compatible, ni autorisée par défaut. Chaque propriété doit être démontrée dans la portée et l’environnement concernés.