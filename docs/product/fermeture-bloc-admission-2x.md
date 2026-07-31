---
Projet: CityFlow
Document: Fermeture du bloc d’admission initial 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Fermeture du bloc d’admission initial 2.x

## Objet

Constater la complétion documentaire du premier bloc d’admission CityFlow 2.x et préciser ce qui est ouvert, ce qui demeure interdit et les prochaines décisions nécessaires.

## Périmètre complété

Le bloc initial comprend :

- le registre des initiatives 2.x;
- `CF2X-INIT-0001` — modèle géographique officiel;
- `CF2X-INIT-0002` — cycle municipal de publication;
- `CF2X-INIT-0003` — isolation et audit de bout en bout;
- `CF2X-INIT-0004` — intégrations versionnées;
- `CF2X-INIT-0005` — pilote municipal limité;
- la matrice commune de preuves;
- le cadre de décision;
- la checklist de préparation du pilote;
- le protocole d’incident et de retour arrière.

## Ce que cette fermeture constate

- les cinq initiatives initiales possèdent une intention, un périmètre, des exclusions, des barrières et des conditions d’admission;
- les dépendances entre géographie, publication, isolation, intégrations et pilote sont explicites;
- les preuves attendues sont structurées;
- l’autorité humaine finale est maintenue;
- les mécanismes de suspension, retour arrière et retrait sont prévus;
- le passage vers un pilote exige encore des preuves et une décision séparée.

## Ce que cette fermeture n’autorise pas

- utilisation de données municipales réelles;
- activation d’une intégration externe;
- publication citoyenne;
- migration de données;
- exploitation multi-municipale;
- automatisation de l’approbation finale;
- lancement d’un pilote;
- déclaration de conformité ou de préparation à la production.

## État des initiatives

| Initiative | État documentaire visé | Autorisation opérationnelle |
|---|---|---|
| CF2X-INIT-0001 | En évaluation | Aucune |
| CF2X-INIT-0002 | En évaluation | Aucune |
| CF2X-INIT-0003 | En évaluation | Aucune |
| CF2X-INIT-0004 | En évaluation | Aucune |
| CF2X-INIT-0005 | En évaluation | Aucune |

La fusion des documents ne change pas automatiquement ces états.

## Barrières maintenues

Les barrières suivantes demeurent non compensables :

- propriété municipale et isolation côté serveur;
- provenance des données et versions;
- identité entre contenu approuvé et contenu publié;
- approbation humaine finale;
- accessibilité des parcours essentiels;
- contrats d’intégration versionnés;
- conservation limitée et justifiée;
- audit attribué;
- suspension et retour arrière testés;
- périmètre de pilote explicitement borné.

## Prochain bloc recommandé

Le prochain bloc doit produire des preuves P1 et P2 sans données réelles :

1. schéma de référence géographique et cas limites;
2. machine d’états de publication et matrice des rôles;
3. modèle d’autorisation et tests d’isolation;
4. modèle de contrat d’intégration versionné;
5. scénarios de répétition d’un pilote fictif;
6. registre concret des preuves et décisions;
7. simulations d’incident, restauration et fermeture.

## Ordre de dépendance

L’ordre recommandé est :

1. géographie;
2. publication;
3. isolation et audit;
4. intégrations;
5. répétition du pilote;
6. revue indépendante;
7. décision d’admissibilité.

Une initiative peut progresser en parallèle uniquement lorsque ses dépendances sont simulées explicitement et que cette simulation est consignée.

## Conditions de passage au bloc suivant

- documents fusionnés et cohérents;
- chemins et identifiants stables;
- aucune contradiction sur les états ou autorisations;
- responsables de preuve désignés;
- environnements d’essai sans données réelles disponibles;
- méthode de conservation des artefacts définie;
- calendrier de revue établi;
- risques documentaires ouverts consignés.

## Risques encore ouverts

- modèle géographique non éprouvé;
- responsabilités municipales non attribuées;
- architecture d’isolation non démontrée;
- canaux de publication non sélectionnés;
- inventaire des intégrations incomplet;
- stratégie d’accessibilité non testée;
- coûts et capacité non mesurés;
- obligations juridiques propres à chaque municipalité non analysées.

## Critère de fermeture réelle d’une initiative

Une initiative n’est réellement fermée que lorsque :

- sa décision finale est enregistrée;
- ses accès et intégrations sont retirés ou transférés;
- ses données temporaires sont traitées;
- ses preuves nécessaires sont conservées;
- ses obligations ouvertes ont un propriétaire;
- les parties concernées sont informées;
- aucun état ambigu ne demeure.

## Conclusion

Le premier bloc d’admission 2.x est documentairement structuré, mais volontairement non opérationnel. La prochaine étape n’est pas de déployer : elle consiste à produire des preuves reproductibles, à exposer les résultats négatifs et à préparer des décisions limitées et réversibles.