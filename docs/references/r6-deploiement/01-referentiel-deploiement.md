# Référentiel R6 — Déploiement

## Statut

**R6 OUVERT — CAPACITÉ DE DÉPLOIEMENT NON ATTESTÉE**

## Objet

Définir comment CityFlow est préparé, livré, vérifié, activé, surveillé et retiré dans chaque environnement autorisé.

## Exigences permanentes

- environnements, responsabilités et dépendances inventoriés;
- artefacts versionnés, traçables et reproductibles;
- configuration séparée du code et secrets protégés;
- validations préalables, critères d’arrêt et retour arrière documentés;
- migrations de données réversibles ou accompagnées d’un plan de restauration;
- activation progressive lorsque le risque le justifie;
- preuve de santé après livraison et surveillance renforcée;
- journal des changements, incidents et retraits conservé.

## Portées

Le cadre s’applique aux déploiements locaux, municipaux, intermunicipaux, provinciaux et aux environnements de validation. Une portée plus large exige toujours une décision explicite.

## Preuves attendues

- version livrée et empreinte de l’artefact;
- résultats des validations;
- configuration effective sans secret exposé;
- décision d’activation;
- preuve du retour arrière testé;
- observations après livraison.

## Fermeture

R6 ne peut être fermé que si le processus a été exécuté avec succès sur un environnement représentatif, que les écarts critiques sont traités et que les preuves sont archivées.

**R6 NON FERMÉ — DÉPLOIEMENT DE PRODUCTION NON AUTORISÉ PAR CE DOCUMENT.**
