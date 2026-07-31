# Frontières et flux d’architecture

## Statut

**FRONTIÈRES DÉFINIES — FLUX À VALIDER**

## Objet

Décrire où commencent et se terminent les responsabilités ainsi que les mouvements de données entre composants.

## Exigences

- origine, destination et finalité de chaque flux;
- autorité responsable de la donnée;
- validation, transformation et conservation;
- erreurs, reprises et idempotence;
- chiffrement et traces lorsque requis.

## Barrière

Tout flux inconnu, non attribué ou impossible à interrompre constitue un écart architectural bloquant.