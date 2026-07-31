# Dépendances externes CityFlow 2.x

## Intention

Définir comment CityFlow 2.x identifie et maîtrise les dépendances hors de son contrôle direct : interfaces externes, partenaires, autorités, infrastructures partagées et services tiers.

## Référence stable

Chaque dépendance externe reçoit un identifiant `CF2X-DEP-xxxx`.

## Fiche minimale

La fiche précise le fournisseur ou responsable externe, le service consommé, la criticité, les engagements connus, les données échangées, les territoires, les modes de défaillance, les signaux de santé, le propriétaire interne et la stratégie de repli ou de sortie.

## Niveaux

Les dépendances sont courantes, renforcées ou critiques selon leur effet sur la sécurité, les données, la continuité, les obligations et la capacité de retrait.

## Admission

Une dépendance critique sans preuve de disponibilité, propriétaire, surveillance et solution de repli bloque le passage à la réalisation ou exige une décision d’acceptation de risque explicitement autorisée.

## Surveillance

CityFlow observe la disponibilité, la qualité, les changements de contrat, les sous-traitants, les incidents, les coûts et la concentration. Un engagement commercial ne remplace pas une preuve opérationnelle.

## Changement et sortie

Toute modification importante déclenche une réévaluation des interfaces, risques, données, coûts, niveaux de service et plans de continuité. La sortie couvre migration, récupération ou suppression des données, retrait des accès et validation du remplacement.

## Interdictions

Il est interdit de supposer une disponibilité à partir d’une date promise, de masquer une concentration critique, de dépendre d’un accès personnel non transférable ou de fermer la relation sans preuve de retrait des données et secrets.

## Traçabilité

Les dépendances externes sont reliées aux fournisseurs, interfaces, risques, niveaux de service, incidents, changements, continuité, coûts et décisions.