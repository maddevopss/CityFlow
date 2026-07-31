# Gouvernance des interfaces CityFlow 2.x

## Intention

Encadrer les contrats par lesquels services, systèmes, équipes et partenaires échangent des demandes, événements et données.

## Référence stable

Chaque interface gouvernée reçoit un identifiant `CF2X-INT-xxxx`.

## Contrat minimal

Le contrat précise le propriétaire, les consommateurs connus, les schémas, les règles de validation, l’authentification, les autorisations, les limites, les erreurs, les délais, l’idempotence, la compatibilité, les données sensibles, l’observabilité et le soutien.

## Versionnement

Toute évolution est classée compatible, conditionnelle ou incompatible. Les changements incompatibles exigent une période de coexistence, un plan de migration, des preuves d’adoption et une date de retrait autorisée.

## Résilience

Les interfaces définissent les comportements lors de lenteur, duplication, perte, désordre, indisponibilité ou réponse partielle. Les reprises ne doivent pas multiplier les effets irréversibles.

## Sécurité et données

Le moindre privilège, la minimisation, la validation des entrées, la traçabilité et la protection des secrets s’appliquent à chaque interface, y compris interne.

## Surveillance

Les métriques couvrent volume, erreurs, latence, saturation, compatibilité, consommateurs inconnus et dérive de schéma. Les seuils sont reliés à des actions.

## Retrait

Une interface n’est retirée qu’après preuve de l’absence de consommateurs autorisés, traitement des données, retrait des accès et période d’observation.

## Interdictions

Il est interdit de modifier silencieusement un contrat, de considérer une interface interne comme sûre par défaut, de retirer sur la seule absence de trafic récent ou de laisser une interface critique sans propriétaire.

## Traçabilité

Les interfaces sont reliées aux actifs, architectures, dépendances, changements, données, incidents, niveaux de service et décisions.