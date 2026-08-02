# Audit Initial — Frontend CityFlow

## 1. Contexte
Ce document présente l'audit initial du frontend de CityFlow et le plan de découpage pour sa restructuration, réalisé en accord avec le `SYSTEME_MAD` et notamment le standard `std-web-mobile.md`.

## 2. État des lieux

### 2.1 Architecture actuelle
- **Framework** : React 18 avec Vite, TypeScript, TailwindCSS.
- **Routage** : React Router DOM.
- **Gestion d'état et appels réseau** : Zustand et React Query (TanStack Query), Axios.
- **Cartographie** : Leaflet, react-leaflet.
- **Structure des dossiers** :
  - `src/components/` : Contient des sous-dossiers `common/` (Button, ProtectedRoute) et `layout/` (Header, Layout, Sidebar).
  - `src/pages/` : Contient toutes les vues (Dashboard, InspectionsPage, EventsPage, etc.).
  - `src/services/` : Contient les appels API (ex: `inspectionService.ts`).
  - `src/hooks/`, `src/context/`, `src/types/`.

### 2.2 Problèmes identifiés et Risques de régression
1. **Pages monolithiques** : Plusieurs fichiers comme `InspectionsPage.tsx` font près de 200 lignes. Ils mélangent l'état des formulaires inline, les appels React Query, et des tableaux massifs en JSX directement dans le rendu.
2. **Formulaires inline** : Les formulaires (ex: Créer une inspection) sont codés en ligne dans les pages au lieu d'être dans des composants form dédiés (`src/components/forms/`), limitant la réutilisabilité.
3. **Styles globaux vs locaux** : `index.css` utilise des `@apply` pour `.btn-primary` et `.input-field`. C'est une bonne base, mais cela doit être systématisé à travers des composants fonctionnels plutôt que de reposer uniquement sur les classes globales ou des styles inline.
4. **Accessibilité (A11y)** : Des améliorations sont nécessaires sur la structure sémantique, la gestion du focus dans les modales/formulaires, et l'ordre de tabulation, tel qu'exigé par la norme MADPROOF.
5. **Avertissements de compilation** : Un avertissement concernant l'usage obsolète de `baseUrl` dans `tsconfig.json` bloquait `npm run build`. Il a été corrigé lors de cet audit.

## 3. Plan de restructuration (Découpage en blocs)

1. **Bloc 1 : Audit initial** (Cette PR) - Documentation de l'état actuel et correction des avertissements de build bloquants.
2. **Bloc 2 : Fondations CSS et sémantique HTML** - Validation de la structure (main, nav, header) et nettoyage des styles (Tailwind / variables CSS).
3. **Bloc 3 : Extraction des composants réutilisables** - Isoler les composants communs (Inputs, modales, tableaux).
4. **Bloc 4 : Séparation de la logique JavaScript/TypeScript** - Extraire les appels d'API et la gestion d'état des pages vers des hooks ou services dédiés.
5. **Bloc 5 : Bouton « Retour en haut »** - Implémenter la fonctionnalité accessible (focus clavier, zone tactile).
6. **Bloc 6 : Accessibilité et UX mobile** - Révision de la navigation clavier, formulaires accessibles, contrastes, responsive (vérification sur 320px à 1440px).
7. **Bloc 7 : Performance et sécurité** - Lazy loading justifié, nettoyage, sécurisation des variables côté client.
8. **Bloc 8 : Tests et documentation** - Ajout ou mise à jour des tests pour garantir l'absence de régression, et finalisation de la documentation technique.

## 4. Vérifications et Résultats (Bloc 1)
- `npm run lint` : PASS
- `npm run typecheck` / `npm run build` : PASS (Suite à l'ajustement du `tsconfig.json`)
- Tests existants : N/A (non exécutés à ce stade, couverts par Vitest)
- Risque identifié : L'ajustement des chemins TS pourrait impacter des imports obsolètes, vérifié via build.
