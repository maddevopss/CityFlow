# Parcours E2E de production — Inspections

## Objectif

Valider le cycle complet dans un environnement isolé avec une vraie base de données et les mêmes contrôles d’authentification, de rôles et de municipalité que la production.

## Scénario principal

1. Un agent municipal se connecte.
2. Il crée une inspection avec une adresse, un type et une date.
3. Il affecte l’inspection à un inspecteur actif de la même municipalité.
4. L’inspecteur se connecte et voit uniquement l’inspection affectée.
5. Il enregistre une preuve avec une empreinte SHA-256 valide.
6. Il termine l’inspection avec un résultat et des constats.
7. L’agent génère le rapport et vérifie son empreinte déterministe.
8. L’agent prépare une notification, puis la met en file.
9. Le tableau de bord reflète la clôture.
10. Une seconde municipalité ne peut consulter ni modifier aucune donnée du parcours.

## Assertions obligatoires

- aucune réponse inattendue `5xx`;
- les transitions retournent les statuts HTTP documentés;
- l’identifiant d’inspection reste stable durant tout le parcours;
- la preuve apparaît dans le rapport;
- le rapport possède une empreinte SHA-256 sur 64 caractères;
- la notification référence la bonne inspection;
- la liste paginée retrouve l’inspection avec les filtres et la recherche;
- l’isolation intermunicipale retourne `404` ou une liste vide selon le contrat;
- un inspecteur non affecté reçoit un refus;
- les traces ne contiennent ni jeton ni contenu de preuve.

## Scénarios négatifs

- création avec type inconnu;
- affectation à un utilisateur externe ou inactif;
- preuve avec empreinte invalide ou dupliquée;
- clôture répétée;
- rapport demandé avant la clôture;
- notification avec canal ou destinataire invalide;
- lot hors ligne supérieur à 50 opérations;
- dépassement de quota avec vérification de `Retry-After`.

## Données et nettoyage

Chaque exécution crée une municipalité, un agent, deux inspecteurs et une inspection identifiables par un préfixe d’exécution. Le nettoyage supprime les données du scénario même après échec. Aucun test ne dépend d’un ordre global ou de données préexistantes.

## Matrice minimale

- Chromium bureau;
- Chromium mobile;
- WebKit mobile;
- exécution séquentielle pour le parcours complet;
- nouvelle tentative unique seulement pour les erreurs réseau transitoires;
- capture de trace, journal et écran lors d’un échec.

## Barrière de production

Le module n’est pas déclaré prêt pour la production tant que le scénario principal, l’isolation intermunicipale et les scénarios négatifs critiques ne sont pas verts sur l’environnement de préproduction.
