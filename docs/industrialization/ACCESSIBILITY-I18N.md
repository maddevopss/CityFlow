# Accessibilité WCAG 2.2 AA et internationalisation

## Exigences

- navigation complète au clavier;
- ordre de focus logique et focus visible;
- contrastes conformes AA;
- champs avec étiquette, aide et erreur associées;
- annonces dynamiques compatibles lecteurs d’écran;
- aucune information transmise uniquement par la couleur;
- zoom à 200 % sans perte fonctionnelle;
- français canadien par défaut et architecture prête pour l’anglais;
- formats de date, heure, nombre et devise localisés;
- aucune chaîne métier nouvelle codée en dur dans les composants.

## Validation

Axe ne doit rapporter aucune violation critique ou sérieuse sur les parcours principaux. Les tests manuels couvrent clavier, lecteur d’écran, zoom et réduction des animations.

## GO / NO-GO

NO-GO si une action métier est inaccessible au clavier, si une erreur n’est pas annoncée, si une page critique dépasse les violations permises ou si la langue modifie la logique métier.
