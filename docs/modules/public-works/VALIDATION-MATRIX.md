# Matrice de validation — Travaux publics

| Capacité | Succès | Validation | Rôle interdit | Isolation municipale | Limiteur |
|---|---:|---:|---:|---:|---:|
| Créer un ordre | requis | requis | requis | requis | écriture |
| Lire un ordre | requis | UUID | requis | requis | lecture |
| Transitionner | requis | état | requis | requis | écriture |
| Affecter équipe/véhicule | requis | disponibilité | requis | requis | écriture |
| Ajouter une preuve | requis | taille/SHA-256 | requis | requis | écriture |
| Ajouter un matériau | requis | quantité/coût | requis | requis | écriture |
| Consulter la synthèse | requis | UUID | requis | requis | lecture |

## Barrières

- Jest complet et seuil global de couverture;
- migration PostgreSQL;
- CodeQL sans alerte de limitation de débit;
- Documentation suite;
- PR governance avec impact documentaire réel et section Limites.