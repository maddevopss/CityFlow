# Alignement de CityFlow avec SYSTEME_MAD

## Statut

**ALIGNEMENT CONTRÔLÉ — AUCUN HÉRITAGE SILENCIEUX**

## Objet

Relier la gouvernance, les preuves et les mécanismes de contrôle de CityFlow au cœur institutionnel de SYSTEME_MAD sans copier son autorité ni créer une dépendance implicite.

## Source institutionnelle épinglée

- dépôt : `bleeband/SYSTEME_MAD`
- branche de référence : `main`
- commit examiné : `3a03d95fa435e911149c05081e1c0a2d3e20bcb9`
- constitution : `00-SYSTEME-MAD/governance/constitution.md`
- fondations : `01-FONDATIONS/README.md`
- décisions : `00-SYSTEME-MAD/decisions.md`

Le commit est épinglé pour empêcher qu’une modification ultérieure de SYSTEME_MAD change automatiquement les règles applicables à CityFlow.

**Note sur le nom du dépôt** : `bleeband/SYSTEME_MAD` est le nom institutionnel historique sous lequel le commit ci-dessus a été examiné et épinglé ; ce même dépôt est aujourd'hui hébergé sous `maddevopss/SYSTEME_MAD` (`git remote -v` y confirme `https://github.com/maddevopss/SYSTEME_MAD`, et le commit `3a03d95f...` s'y retrouve à l'identique). Le nom épinglé n'est pas modifié — il reste la référence documentaire de l'examen initial — mais quiconque cherche à recloner ce dépôt pour re-vérifier l'ancrage doit utiliser `maddevopss/SYSTEME_MAD`. Voir `docs/audits/2026-08-05-audit-technique-ancrage-systeme-mad.md` (constat M1).

## Principes d’intégration

1. CityFlow demeure responsable de ses décisions, risques, contrôles et preuves.
2. SYSTEME_MAD fournit des principes et une architecture institutionnelle, pas une certification automatique.
3. Toute règle héritée est représentée dans `systeme-mad-alignment.json` avec une portée, une adaptation locale et des preuves attendues.
4. Toute évolution du commit de référence exige une revue explicite, une décision enregistrée et une nouvelle validation.
5. Un conflit entre une règle locale et SYSTEME_MAD doit être documenté comme dérogation; il ne peut être masqué par une simple mention d’alignement.

## Domaines reliés

| Domaine CityFlow | Mécanisme local | Ancrage SYSTEME_MAD |
|---|---|---|
| gouvernance | décisions, obligations, parties prenantes | constitution et cycle institutionnel |
| preuve | matrices M1, M2, M11 et M15 | autorité des preuves et traçabilité |
| risque | T2, C6 et M3 | prudence, réserves et non-présomption |
| changement | T4, C11, C15 et M11 | décision explicite et réversibilité |
| exploitation | T3, T10, T19, C5 et C17 | continuité, observation et apprentissage |
| documentation | référentiels R, registres T, checklists C, matrices M | mémoire institutionnelle contrôlée |
| assistance | R8 et validations humaines | intelligence non souveraine et confirmation humaine |

## Processus de mise à jour

1. identifier un nouveau commit ou document de SYSTEME_MAD;
2. comparer sa portée au commit actuellement épinglé;
3. relever les règles ajoutées, retirées ou modifiées;
4. évaluer les impacts sur les référentiels, registres, checklists et matrices CityFlow;
5. documenter la décision dans T1 et les risques dans T2;
6. mettre à jour le manifeste et ses preuves;
7. exécuter `node scripts/validate-systeme-mad-alignment.mjs`;
8. soumettre la modification à revue avant fusion.

## Limites

La validation automatique confirme uniquement la cohérence du manifeste, la présence des documents locaux et l’épinglage de la source. Elle ne vérifie pas à distance le contenu actuel de SYSTEME_MAD et ne démontre pas une conformité institutionnelle.

## Barrière finale

La mention « aligné avec SYSTEME_MAD » ne constitue ni une approbation, ni une délégation d’autorité, ni une preuve de conformité. Chaque décision et chaque résultat demeurent limités aux éléments effectivement examinés et démontrés dans CityFlow.
