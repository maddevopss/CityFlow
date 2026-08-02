# Exécution terrain

Ce bloc ajoute la collecte des preuves terrain, l’enregistrement des matériaux consommés et la synthèse d’exécution d’un ordre de travail.

## Contrôles

- ordre de travail validé dans la municipalité de l’utilisateur;
- preuve décrite par métadonnées, empreinte SHA-256 et clé de stockage;
- taille maximale validée avant écriture;
- quantité et coût unitaire validés;
- routes de lecture et d’écriture limitées dès leur déclaration.

## Limites

Aucun fichier binaire n’est stocké dans PostgreSQL. Aucun inventaire global, aucune facturation fournisseur et aucun calcul de paie ne sont inclus.