# Notifications multicanales

CityFlow peut transmettre une diffusion par courriel, SMS, notification poussée ou webhook selon les préférences autorisées.

## Règles

- consentement et canal préférentiel conservés;
- aucun canal ajouté implicitement;
- repli vers un autre canal seulement si autorisé;
- contenu minimal dans les notifications sensibles;
- suppression immédiate d’un canal désabonné;
- suivi séparé des tentatives, livraisons et échecs;
- aucune confirmation de lecture déduite d’une simple livraison technique.

## Priorités

Les alertes urgentes peuvent utiliser plusieurs canaux autorisés. Les communications ordinaires respectent la fréquence choisie et les heures silencieuses.