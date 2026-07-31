# C4 — Checklist retour arrière

## Statut

**CHECKLIST OPÉRATIONNELLE — AUCUN RETOUR ARRIÈRE EXÉCUTÉ PAR CE DOCUMENT**

## Objet

Encadrer le retour à une version, une configuration ou un état de données antérieur lorsque le maintien du changement devient plus risqué que son retrait.

## Déclenchement

- [ ] critère de retour arrière atteint ou décision explicite prise;
- [ ] incident, changement et environnement concernés identifiés;
- [ ] responsable de décision et responsable d’exécution confirmés;
- [ ] impacts attendus sur utilisateurs, données et dépendances évalués;
- [ ] communication d’urgence préparée.

## Préparation

- [ ] version ou état cible vérifié;
- [ ] artefact antérieur et empreinte disponibles;
- [ ] sauvegardes et points de restauration accessibles;
- [ ] compatibilité des données examinée;
- [ ] ordre des opérations et critères d’arrêt définis;
- [ ] accès et personnes nécessaires disponibles.

## Exécution

- [ ] trafic ou traitements suspendus lorsque requis;
- [ ] retour de code, configuration et données exécuté dans l’ordre prévu;
- [ ] chaque commande et résultat critique consigné;
- [ ] écart signalé sans délai;
- [ ] aucune correction improvisée non documentée.

## Vérification

- [ ] version et configuration effectives confirmées;
- [ ] intégrité et cohérence des données vérifiées;
- [ ] parcours critiques exécutés;
- [ ] dépendances, journaux, métriques et alertes examinés;
- [ ] service déclaré rétabli, dégradé ou toujours interrompu.

## Clôture

- [ ] parties concernées informées;
- [ ] incident et changement mis à jour;
- [ ] pertes, écarts et actions correctives consignés;
- [ ] preuve du retour arrière archivée;
- [ ] revue après événement planifiée.

## Barrière finale

Un retour arrière terminé ne démontre pas le retour complet à un état sain. L’intégrité des données, les dépendances et les effets différés doivent être vérifiés séparément.
