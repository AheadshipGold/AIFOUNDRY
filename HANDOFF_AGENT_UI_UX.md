# État de Transfert (Handoff State) - Fondation Technique

La fondation technique canonique du projet AI Foundry a été mise en place avec succès selon les spécifications strictes du `00_DECISIONS_FONDATEUR_V3.md`, `Stack_Technique_Final_V1_0.md` et de l'`Architecture_Construction_V0_6_Implementation_Ready.md`.

## Structure Créée

- **Monorepo TypeScript (npm workspaces)** : Configuration avec un `package.json` maître (sécurisé, sans impacter les scripts du niveau système).
- **`apps/mobile`** : Application Expo (React Native) prête. La structure thématique (Light/Dark) et bilingue (FR/EN) a été scellée dans `src/constants/theme.ts` et `src/locales/`. L'application de base l'implémente.
- **`apps/web`** : Application Next.js préparée.
- **`apps/api`** : Backend NestJS initialisé avec son propre `tsconfig` et module maître.
- **`apps/api/prisma`** : Prisma ORM initialisé et configuré pour PostgreSQL.
- **`packages/shared`** : Package partagé pour les contrats, typages et constantes globales.
- **Infrastructure Locale (`docker-compose.yml`)** : Configurée avec PostgreSQL 16, MinIO (+ création automatique du bucket public via `minio-init`), Mailpit, et Caddy en tant que reverse proxy (`Caddyfile` inclus).
- **GitHub Actions** : Workflow de base `.github/workflows/ci.yml` pour Lint, Typecheck et Build.
- **Environnement** : `.env.example` racine regroupant les variables pour DB, MinIO, Mailpit, et ports de service.

## Commandes de Lancement Local

Pour l'agent suivant ou le développeur, voici les commandes de lancement :

1. **Démarrer l'Infrastructure Locale** :
   ```bash
   docker-compose up -d
   ```
   *Accès : PostgreSQL (5432), MinIO (9000/9001), Mailpit (1025/8025).*

2. **Installer les Dépendances** :
   ```bash
   npm install
   ```

3. **Lancer les Applications** :
   - **API (NestJS)** : `npm run dev -w apps/api`
   - **Web (Next.js)** : `npm run dev -w apps/web`
   - **Mobile (Expo)** : `npm run dev -w apps/mobile`

4. **Tests et QA (Typage/Lint)** :
   ```bash
   npm run typecheck
   npm run lint
   ```

## Instructions strictes pour l'Agent UX/UI

- **Interdiction formelle** de modifier l'architecture backend ou le choix des frameworks.
- Vous devez travailler dans `apps/mobile` (Expo) et `apps/web` (Next.js).
- Respectez la structure thématique (`colors.light` / `colors.dark`) et de localisation introduite.
- Conformez-vous scrupuleusement aux règles du **Design System Premium V1.3** et ne substituez pas les écrans métier par des vues génériques.
