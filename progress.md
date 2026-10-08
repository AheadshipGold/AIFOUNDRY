# AI Foundry - Progress Log

Ce fichier trace toutes les avancées, décisions et implémentations réalisées sur le projet.
**Règle d'or :** Les nouvelles entrées doivent toujours être ajoutées **en haut** de ce fichier (ordre anti-chronologique). Les agents doivent lire ce fichier du bas vers le haut pour comprendre l'historique complet, ou du haut vers le bas pour les dernières mises à jour.

---

## [08 Octobre 2026] - Phase : Déploiement Cloud Global, Vercel Production, Domaine & Stockage R2 (Agent : Antigravity)
**Branche :** `AIFOUNDRYlocrep`

**Accomplissements majeurs : Mise en production officielle de la plateforme sur le Cloud, branchement du domaine et configuration du stockage médias**
1. **Déploiement en Production sur Vercel (`https://www.ojarket.com`) :**
   - Importation et déploiement du monorepo Next.js avec `apps/web` en Root Directory.
   - Liaison réussie avec la base de données Serverless PostgreSQL sur **Neon** (`DATABASE_URL` poolée et `DIRECT_URL`).
   - Compilation et synchronisation automatique du client Prisma lors du post-build.
   - Vitrine publique, console d'administration et catalogue de prestige Kingston Bio 100 % opérationnels en ligne.
2. **Configuration du Nom de Domaine Officiel & DNS :**
   - Domaine de marque **`ojarket.com`** et sous-domaine **`www.ojarket.com`** configurés avec certificats SSL valides.
   - Intégration de la zone DNS et protection CDN sur **Cloudflare**.
3. **Mise en Place du Stockage Objets Médias (Cloudflare R2) :**
   - Création du bucket de stockage dédié **`ojarket-media`** (Western Europe).
   - Génération des identifiants API S3 (`Access Key ID`, `Secret Access Key`) avec droits complets de lecture/écriture (`Object Read & Write`).
   - Configuration des variables d'environnement (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_PUBLIC_DOMAIN`) pour accueillir les uploads des créations artisanales.

---

## [07 Octobre 2026] - Phase : Migration Base Cloud Neon & Unification Full-Stack (Agent : Antigravity)
**Branche :** `AIFOUNDRYlocrep`

**Accomplissements majeurs : Migration intégrale des données réelles vers Neon Cloud et résolution du client API Web**
1. **Migration PostgreSQL vers Neon (Serverless Lakebase) :**
   - Configuration du projet Neon (`aged-sea-96770443`) avec `neon.ts` et le CLI `neonctl`.
   - Transfert sans perte de l'ensemble des données réelles depuis le conteneur Docker local vers Neon : 58 utilisateurs, 7 boutiques marchandes (dont Kingston Bio), 11 produits d'artisanat de luxe, 23 commandes et l'historique de caisse.
   - Préservation stricte du compte administrateur authentique (`damacarre@gmail.com`).
2. **Résolution du Bug API Web & Synchronisation Catalogue :**
   - Correction critique dans `apps/web/src/lib/api.ts` : rectification de `API_BASE_URL` (`/api` au lieu de `/api/v1`) pour éliminer le dédoublement de chemin `/v1/v1` qui provoquait une erreur 404 silencieuse.
   - Réaffichage instantané des créations sur la vitrine Web et parité stricte avec l'application mobile.
   - Test de synchronisation bidirectionnelle validé avec succès (mise à jour du prix du *Chronomètre Heritage* répercutée en base et sur le CMS).
3. **Versionnage & Git :**
   - Commit et push de consolidation réussis sur GitHub (`d8e40f7`).

---

## [01 Octobre 2026 - Soir] - Phase : Câblage Mobile Live, Suite de Preuves T01-T06 & Administration Centrale 03B (Agent : Antigravity)
**Branche :** `codex/ui-design-system-v3`

**Accomplissements majeurs : Câblage complet de l'application mobile, validation des 5 tests de preuve officiels et activation de l'administration centrale**
1. **Client API Mobile Universel (`apps/mobile/src/services/api.ts`) :**
   - Implémentation du client HTTP universel adapté au web, simulateur Android (`10.0.2.2`) et terminal physique.
   - Modules typés : `CatalogApi` (D01), `RequestsApi` (D02), `OrdersApi`, `SellerApi` (FinOps & Caisse).
   - Gestion robuste avec fallback gracieux hors-ligne.
2. **Câblage Intégral des Écrans Mobiles sur PostgreSQL :**
   - `BuyerHomeScreen` : Récupération dynamique des produits artisanaux béninois depuis `/v1/products`.
   - `SearchScreen` : Recherche en direct et filtrage par catégorie dans PostgreSQL avec debounce.
   - `PurchasesScreen` : Affichage des commandes réelles et des 3 pistes de suivi (Accord, Paiement Mobile Money USSD, Exécution).
   - `RequestNeedScreen` : Soumission de demandes sur-mesure D02 persistées en direct dans la base de données.
   - `SellerDashboardScreen` : Affichage en direct du triptyque financier (Vendu / Encaissé / Restant) et des KPIs de la boutique.
   - `SellerCashbookScreen` : Consultation du journal de caisse réel et exécution de la clôture journalière transactionnelle.
   - `SellerOrdersScreen` : Gestion des commandes marchandes et mutation dynamique des statuts d'expédition.
3. **Exécution & Réussite de la Suite de Preuves T01 à T06 (`Plan_Tests_Et_Portes_V1_3.md`) :**
   - Création de `apps/api/test/proof_runner.ts` et commande `npm run test:proof -w apps/api`.
   - **5/5 tests validés avec succès (100% PASS) sur la base de données réelle :**
     - ✅ **T01/T04 (Isolation multi-boutiques) :** Étanchéité absolue entre Shop A et Shop B (0 fuite de données produit, commande ou caisse).
     - ✅ **T02 (Règle Vendu ≠ Encaissé) :** Vente à crédit enregistrée sans gonfler la trésorerie liquide ; encaissement MoMo incrémentant fidèlement le solde.
     - ✅ **T03 (Réservation atomique du dernier SKU) :** 10 requêtes concurrentes simultanées sur 1 unité = exactement 1 succès, 9 rejets, 0 survente.
     - ✅ **T05 (Cycle D02 sur-mesure) :** Demande acheteur -> devis concurrents -> acceptation -> commande formelle créée et devis tiers déclinés.
     - ✅ **T06 (Clôture journalière & détection d'écarts) :** Rapprochement physique vs théorique avec signalement d'écart (`ECART_SIGNALE`) et événement immuable `DAY_CLOSED`.
4. **Activation de l'Administration Centrale (Domaine 03B) :**
   - Création de `AdminModule`, `AdminController` et `AdminService` dans NestJS.
   - Routes activées : `/v1/admin/overview`, `/v1/admin/shops`, `/v1/admin/shops/:id/verification`, `/v1/admin/corridors`, `/v1/admin/corridors/:id/toggle`, `/v1/admin/audit-logs`.
   - Initialisation automatique des 5 corridors de paiement du Bénin (MTN MoMo, Moov Money, Celtiis Cash, Espèces / COD, Virement).
   - Traçabilité immuable vérifiée en base dans `admin_audit_logs` lors de chaque action opératrice.
5. **Vérification Globale :**
   - `npm run typecheck --workspaces` : **0 erreur** sur mobile, api, web, shared, design-system.

---

## [01 Octobre 2026] - Phase : PostgreSQL & Real Database Foundation (Agent : Antigravity)
**Branche :** `codex/ui-design-system-v3`

**Accomplissements majeurs : Sortie définitive du mode Mock vers la base de données réelle PostgreSQL**
- **Infrastructure Docker PostgreSQL :** Démarrage du conteneur Docker `aifoundry-postgres` (PostgreSQL 16 Alpine) sur le port 5432, avec healthcheck actif et persistance des volumes.
- **Synchronisation du Schéma Prisma :** Exécution réussie de `prisma db push` sur la base `aifoundry`. L'ensemble des tables (utilisateurs, boutiques, adhésions, produits, variantes d'offres, demandes d'achat, propositions vendeurs, commandes, lignes de commande, connexions de paiement, écritures de caisse, clôtures journalières, événements financiers) sont synchronisées.
- **Peuplement Réaliste du Marché Béninois (`prisma/seed.ts`) :** Exécution du script de seed via `tsx` créant :
  - 4 utilisateurs réels (Amina Diop, Koffi Mensah, Maître Ganvié, Maître Adjaho).
  - 4 ateliers/boutiques authentiques (Maison Ganvié & Fils à Cotonou, Fonderie Royale d'Abomey, Ébénisterie de la Lagune à Porto-Novo, Tissages Précieux de Bohicon) avec connexions de paiement (MTN MoMo, Moov Money, Espèces / COD).
  - 4 produits emblématiques artisanaux avec variantes et gestion des stocks (Sac Cabas Grand Marché, Collier Danxomé bronze, Console Assoba Iroko, Cape Kanvo).
  - Demande sur-mesure D02 avec proposition artisan chiffrée.
  - Commande test `OJK-2026-0891` avec instructions de paiement Mobile Money USSD générées dynamiquement.
  - Écritures de caisse FinOps conformes à la règle Vendu ≠ Encaissé et clôture journalière équilibrée.
- **Remplacement Intégral des Services Mock par Prisma ORM :**
  - `CatalogService` : Requêtes Prisma réelles avec filtres texte/catégorie et réservation atomique de stock.
  - `RequestsService` : Persistance réelle des demandes sur-mesure et propositions avec transactions Prisma.
  - `OrdersService` : Création de commandes transactionnelles avec réservation de stock, liaisons acheteur/boutique et création d'événements financiers `SALE_CREATED` et `PAYMENT_CONFIRMED`.
  - `SellerService` : Calcul dynamique des KPIs marchands, agrégation de caisse, enregistrement d'encaissements/décaissements et clôture journalière transactionnelle avec calcul d'écart.
- **Compilation & Qualité :**
  - Configuration de `rootDir: "src"` et `include: ["src/**/*"]` dans `tsconfig.json` pour garantir une structure d'artefact propre sans collision.
  - `npm run typecheck -w apps/api` : **0 erreur**.
  - `npm run build -w apps/api` (`nest build`) : **0 erreur**.
- **Serveur API en direct & Validation Endpoints :**
  - Serveur NestJS démarré sur le port 3001 connecté en direct à PostgreSQL (`✅ [PrismaService] Connected to database`).
  - Validation HTTP des 5 routes principales (`/v1/products`, `/v1/requests`, `/v1/orders`, `/v1/seller/cashbook`, `/v1/seller/dashboard`) avec renvoi des données réelles de la base.

---

## [29 Septembre 2026] - Phase : Backend Foundation V3 (Agent : Antigravity)
**Branche :** `antigravity/backend-foundation-v3` (Worktree séparé)

**Accomplissements :**
- **Compilation & Validation :** L'API NestJS (`apps/api`) a été compilée avec succès, vérifiant l'intégrité des types et des dépendances.
- **Jobs & Storage :** Mise en place d'une abstraction pour la gestion des files d'attente avec `pg-boss` (`jobs.service.ts`) et la gestion des fichiers avec MinIO (`storage.service.ts`).
- **Isolation Multitenant (Shops) :** Implémentation du module `ShopsModule` et de `ShopIsolationGuard` pour s'assurer que les requêtes sont isolées de manière sécurisée par boutique (vérification des rôles via Better Auth et Prisma).
- **Authentification :** Implémentation du module `AuthModule` intégrant `better-auth` avec l'adapteur Prisma pour gérer les sessions et les identités.
- **Architecture Core NestJS :** Configuration de l'architecture centrale (`CoreModule`) avec journalisation structurée JSON (`nestjs-pino`), validation globale (`ValidationPipe`), et accès partagé à la base de données (`PrismaService`).
- **Base de données (Prisma) :** 
  - Définition du schéma de la base de données (`apps/api/prisma/schema.prisma`) incluant les modèles pour l'authentification (Better Auth) et le domaine central (Markets, Shops, Products, Inventory).
  - Génération du client Prisma et exécution de la première migration (`init_foundation_v3`) sur l'instance PostgreSQL locale.
- **Shared Contracts :** Création du module `packages/shared/src/types` définissant les interfaces TypeScript (DTOs) partagées entre le frontend et le backend.
- **Environnement & Docker :** 
  - Démarrage de l'instance PostgreSQL locale via Docker Compose.
  - Configuration sécurisée des variables d'environnement (`.env` et `.env.example`) incluant les accès pour PostgreSQL, MinIO, et Mailpit.
- **Fix Application Mobile :** Résolution des erreurs de démarrage de l'application Expo (Web). Ajout du point d'entrée `index.js`, installation de `react-native-web` et `@expo/metro-runtime` pour permettre la visualisation de l'application sur le navigateur.
- **Création du Worktree Backend :** Déploiement d'un git worktree séparé (`c:\S_S\AI_F\AIFOUNFRYAPP_backend`) branché sur `antigravity/backend-foundation-v3` pour isoler complètement les modifications Backend de celles du Design System (UI).

---

## [30 Septembre 2026] - Phase : UI & Design System V3 (Agent : Codex)
**Branche :** `codex/ui-design-system-v3`

**Accomplissements :**
- **Design System Partagé (`packages/design-system`) :** Implémentation complète des tokens de design V1.3 (palettes Ivoire Pierre `#FAF9F6`, Ardoise Nuit `#0B141A`, Émeraude `#075D49`, Or Champagne `#D4AF37`), dictionnaires bilingues stricts FR/EN, logique de formatage monétaire (XOF/EUR/KWD) et mappers de statuts. 5/5 tests unitaires passants.
- **Bibliothèque de Composants Web (`apps/web/src/design-system`) :** Plus de 25 primitives accessibles (Button, Card, ProductCard, ShopCard, Dialog, BottomSheet, Toast, Tabs, Inputs, etc.) et composants d'opérations financières marchandes (MoneySummaryCard, PaymentSourceBadge, CashbookRow, DayClosePanel, PartialPaymentProgress).
- **Galerie & Écrans de Référence Web (`apps/web/src/reference`) :** Construction de la Component Gallery (`/internal/components`) et de 8 écrans de référence commerce (`/internal/references`) : 4 écrans acheteur (S01 Découvrir, S07 Fiche produit, S03 Exprimer un besoin, S06 Comparer) et 4 écrans vendeur (S20 Dashboard Aujourd'hui, S28 Commandes, S43 Caisse & Journal, S44 Clôture journalière).
- **Qualité & Accessibilité :** Validation Playwright Edge avec audit Axe-core (zéro violation) sur les formats 360px, 430px et 1280px en modes clair et sombre.
- **Portage Mobile Expo (`apps/mobile/src/design-system`) :** Portage des tokens et primitives sur React Native, persistance AsyncStorage et export Metro Android (bundle Hermes 1.55 MB).

---

## [Début du projet] - Phase : Initialisation
- **Monorepo Setup :** Mise en place de l'architecture Monorepo Turborepo avec les dossiers `apps` (api, mobile, web) et `packages` (design-system, shared, etc.).
- **Hand-off Fondateur :** Ajout des documents fondateurs V3 (Architecture, PRD, Décisions) définissant PostgreSQL, NestJS, Prisma, Better Auth, et Expo comme stack technologique principale.
