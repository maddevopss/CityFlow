# Bibliothèque des modèles CityFlow

## Statut

**BIBLIOTHÈQUE ACTIVE — MODÈLES À ADAPTER ET À VALIDER**

## Objet

Fournir des structures de départ cohérentes pour les documents opérationnels de CityFlow. Un modèle facilite la rédaction; il ne constitue ni une preuve, ni une autorisation, ni un verdict.

## Catalogue

| Type | Modèle | Usage principal |
|---|---|---|
| `decision` | [Décision](./decision.md.tpl) | Décision structurante ou arbitrage |
| `adr` | [Décision d’architecture](./adr.md.tpl) | Choix technique durable |
| `incident` | [Incident](./incident.md.tpl) | Chronologie, impact et rétablissement |
| `validation` | [Validation](./validation.md.tpl) | Scénarios, résultats et réserves |
| `deploiement` | [Déploiement](./deploiement.md.tpl) | Préparation, exécution et surveillance |
| `audit` | [Audit](./audit.md.tpl) | Portée, constats et actions |
| `rapport` | [Rapport](./rapport.md.tpl) | Analyse et recommandations |
| `communication` | [Communication](./communication.md.tpl) | Message autorisé et traçable |

## Variables communes

- `{{ID}}`
- `{{TITLE}}`
- `{{OWNER}}`
- `{{DATE}}`
- `{{STATUS}}`

## Génération

```bash
node scripts/generate-governance-document.mjs \
  --type decision \
  --id DEC-001 \
  --title "Choix du mécanisme de diffusion" \
  --owner "Équipe CityFlow" \
  --output docs/decisions/dec-001-diffusion.md
```

## Règles

- conserver les sections de preuve, limites et barrière finale;
- remplacer toutes les variables avant publication;
- attribuer un responsable et une date;
- relier le document aux registres, matrices ou checklists applicables;
- soumettre le document produit à une revue humaine.

## Barrière finale

La génération d’un document ne valide pas son contenu. Les faits, preuves, décisions et responsabilités doivent être confirmés séparément.
