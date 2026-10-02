# Lot 01 — Design System + Component Gallery

Branche : `codex/ui-design-system-v3`. Référence inchangée : `Design_System_Premium_V1_3.md`, décisions V3. Reprise du 29 septembre 2026.

## État de la reprise

Les tokens, dictionnaires, composants et galerie web ainsi que les composants natifs existaient. La galerie native, son raccordement et les tests manquaient après interruption. Ils ont été ajoutés sans remplacer le Design System. Aucun fichier backend, décision produit ou document normatif n’a été modifié. `progress.md`, provenant du travail parallèle, est conservé sans modification.

## Fichiers du lot

- `packages/design-system/package.json`, `tsconfig.json`, `src/index.ts`, `src/tokens.ts`, `src/messages.ts`, `src/presentation.ts`, `src/fixtures.ts`, `tests/presentation.test.ts` : tokens, FR/EN, modèles de présentation, fixtures isolées et tests.
- `apps/web/src/design-system/provider.tsx`, `components.tsx`, `gallery.tsx`, `styles.css` : composants et galerie web.
- `apps/web/src/app/internal/components/page.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`, `next.config.mjs`, `package.json` : route interne de développement et raccordement du package.
- `apps/web/playwright.config.ts`, `tests/gallery.spec.ts` : tests navigateur et audit axe.
- `apps/mobile/src/design-system/provider.tsx`, `components.tsx`, `gallery.tsx`, `App.tsx`, `src/constants/theme.ts`, `metro.config.cjs`, `package.json` : galerie native, préférences persistées, adaptateur de palette et résolution monorepo.
- `.eslintrc.ui.cjs`, `package.json`, `package-lock.json` : outils de vérification et dépendances. Metro runtime, React Native Web et AsyncStorage alignés sur Expo SDK 51 déjà utilisé, sans migration de stack.
- `Docs/UI_IMPLEMENTATION/LOT_01_PLAN.md` et ce rapport : suivi du lot.

## Composants implémentés sur les deux plateformes

Button, IconButton, TextField, SearchField, Select, Checkbox, Radio, Switch, Card, ProductCard (image et repli), ShopCard, Badge, PaymentStatusBadge, OrderStatusBadge, Avatar, Dialog, BottomSheet, Toast/Snackbar, Tabs, BottomNavigation, Header/AppBar, Loading, Skeleton, EmptyState, ErrorState, OfflineState, ForbiddenState, Price, Currency, Stack et ResponsiveGrid.

Financial Operations : MoneySummaryCard, PaymentSourceBadge, CashbookRow, ReconciliationCard, DayClosePanel, PartialPaymentProgress, SyncStateBadge. Vendu / encaissé / restant / remboursé sont distincts. Confirmation vendeur et vérification prestataire ont des libellés, formes et traitements différents. Les composants affichent les valeurs reçues : ils ne vérifient pas un paiement et ne calculent pas de revenu fictif.

Les galeries présentent les états normal, loading, empty, error, offline et disabled. Les interactions sont locales : formulaires, sélection, thème/langue, onglets, navigation de démonstration, dialogues et notifications. Les scénarios offline/retry et clôture ne sont pas des opérations serveur réelles.

## Vérifications

- Typecheck initial des trois workspaces : réussi.
- Lint final des trois workspaces : réussi, après les finitions.
- Tests unitaires partagés : 5/5 réussis (devises XOF/EUR/KWD, provenance paiement, préférences, parité FR/EN et thèmes, contrastes informatifs).
- Galerie web effectivement ouverte et capture desktop inspectée.
- Test web à 360 px, FR/EN et texte 200 % : réussi.
- Premier audit axe : doublon de nom accessible des navigations ; correction appliquée au sommaire.
- Relance navigateur dans Edge : 2/2 tests réussis, code de sortie 0. Interactions, focus clavier, dialogues, FR/EN, persistance, clair/sombre/système et audit axe clair/sombre : réussis ; aucune violation axe restante dans ce scénario.
- Typecheck final : réussi sur les trois workspaces, code de sortie 0, après toutes les corrections de composants.
- `git diff --check` : réussi (avertissements de conversion LF/CRLF Windows uniquement).
- Build Next de production : non exécuté ; seule la compilation de développement et son exécution navigateur sont validées. Un avertissement de cache Webpack ENOENT a été observé à l’arrêt du serveur, sans échec des tests.
- Export Metro Android : réussi, 547 modules, bundle Hermes de 1,55 MB, `apps/mobile/dist/android-preview` (sortie ignorée par Git). Cet export n’est PAS une exécution Android.
- `adb devices` : aucun appareil. `emulator -list-avds` : aucun AVD.
- Installation npm : 49 vulnérabilités signalées dans l’arbre monorepo (5 faibles, 29 modérées, 13 élevées, 2 critiques). Attribution et correction non réalisées ; pas de `npm audit fix --force` ni migration hors périmètre.

## Relancer les contrôles

Depuis la racine :

```powershell
npm run lint --workspace=@aifoundry/design-system --workspace=@aifoundry/web --workspace=@aifoundry/mobile
npm run typecheck --workspace=@aifoundry/design-system --workspace=@aifoundry/web --workspace=@aifoundry/mobile
npm run test --workspace=@aifoundry/design-system
$env:UI_BROWSER='msedge' # navigateur installé utilisé ici ; omettre pour Chromium Playwright
npx playwright test --config apps/web/playwright.config.ts
```

Le premier lancement peut nécessiter `npx playwright install chromium` si aucun navigateur compatible n’est installé. Next démarre sur le port 3100 pour ces tests ; la galerie est `/internal/components`. En production la route renvoie 404. La galerie native est activée uniquement en développement (`__DEV__`).

Export Android reproductible, depuis `apps/mobile` :

```powershell
$env:CI='1'
npx expo export --platform android --max-workers 2 --output-dir dist/android-preview
```

## Validation Android encore requise

1. Configurer un AVD dans Android Studio ou brancher un téléphone avec débogage USB et accepter sa clé RSA ; vérifier `adb devices`.
2. Depuis `apps/mobile`, lancer `npx expo run:android --device` avec SDK/JDK Android correctement configurés. Cette commande génère/compile le projet natif ; elle n’a pas été exécutée pendant ce lot. Ne pas supposer qu’un Expo Go récent prend en charge cet ancien SDK.
3. Vérifier FR clair/sombre, EN clair/sombre, préférence système et sa persistance après relance, clavier, bouton Retour, dialogues, TalkBack, cibles tactiles, 360/430 dp et police Android 200 %.
4. Vérifier sur appareil les états d’erreur et de chargement, les montants, la navigation et les cartes financières. Les scénarios réseau de la galerie sont simulés, non une synchronisation offline opérationnelle.

## Limites et prochaine étape

Le rendu Android, TalkBack, clavier natif et les performances sur téléphone modeste restent non validés. Les cartes métier RequestCard/ProposalCard/OrderRow, ProductGallery avec zoom et MerchantKPI ainsi que les quatre écrans maîtres ne sont pas implémentés dans cette reprise : ils ne doivent pas être déclarés terminés au titre des primitives du lot 01. Aucun backend ni paiement réel n’est raccordé.

Prochaine étape : fermer les vérifications restantes du lot et valider la galerie sur Android avant toute déclinaison massive des écrans. Les vulnérabilités du monorepo nécessitent un audit séparé, sans modifier silencieusement la stack approuvée.
