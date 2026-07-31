# Continuité de service CityFlow

## Objectif

Maintenir une capacité minimale de consultation et de diffusion lorsque PostgreSQL, Redis, le worker ou un fournisseur externe devient indisponible.

## Signaux de santé

- **vivant** : le processus répond sans dépendre d’un service externe;
- **prêt** : les dépendances indispensables sont joignables et les migrations attendues sont présentes;
- **dégradé** : la lecture reste possible, mais une fonction non essentielle est suspendue;
- **indisponible** : l’intégrité ou l’isolation municipale ne peuvent plus être garanties.

## Règles

1. Ne jamais annoncer un état prêt lorsque la base principale est inaccessible.
2. Ne jamais contourner l’isolation municipale pour maintenir le service.
3. Suspendre les écritures avant de risquer une perte ou un doublon.
4. Conserver les demandes de diffusion dans la file durable lorsque le fournisseur externe est indisponible.
5. Rendre l’état dégradé visible dans les métriques et le journal d’exploitation.

## Vérifications avant rétablissement

- migrations cohérentes;
- file de diffusion sans traitement orphelin;
- absence de doublon après reprise;
- lecture et écriture testées dans deux municipalités de validation;
- métriques et alertes revenues à un état attendu.

## Critère de fermeture

Le service n’est déclaré rétabli qu’après validation de l’intégrité, de l’isolation, de la file de diffusion et de la supervision.