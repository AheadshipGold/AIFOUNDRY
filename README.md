# OJARKEY · UNIVERSAL MARKETPLACE & MERCHANT COMMERCE OS

[English](#english) · [Français](#français)

---

<a id="english"></a>
## ENGLISH

### 1. VISION & POSITIONING

Ojarket is a universal commercial infrastructure and merchant operating system (Merchant Commerce OS) designed for all retailers, shop owners, and merchants across West Africa (Cotonou, Abidjan, Bamako, Dakar) and international markets.

The platform is built to power any commercial retail business:
- **Consumer Electronics & Smartphones:** Mobile phones, computers, gadgets, and tech accessories.
- **Beauty, Hair & Cosmetics:** Wigs, hair extensions, wellness products, and organic cosmetics (such as our official administrator flagship store, **Kingston Bio**).
- **Home, Furniture & Decor:** Tables, chairs, interior furnishings, and home goods.
- **Fashion & Apparel:** Clothing, shoes, bags, and jewelry.
- **General Retail & Wholesale:** Neighborhood stores, multi-category retailers, and specialty shops.
- **Custom & Bespoke Orders (D02):** Tailored furniture, custom dressmaking, and made-to-order creations with quotation and milestone tracking.

Official Administrator Boutique: **Kingston Bio**.

---

### 2. MONOREPO ARCHITECTURE

The platform is structured as an enterprise monorepo managed with **npm workspaces**:

```text
aifoundry-monorepo/
├── apps/
│   ├── web/                     # Next.js 14 application (App Router)
│   │   ├── src/app/             # Public storefront, /seller, /admin, /p, /shop
│   │   ├── src/app/api/         # REST API endpoints, Cloudflare R2 media proxy, authentication
│   │   └── prisma/              # PostgreSQL database schema & migrations
│   └── mobile/                  # Native mobile app with Expo SDK 57 (React Native 0.86)
│       ├── src/screens/buyer/   # Customer storefront, product catalog, cart, custom orders
│       ├── src/screens/seller/  # Merchant dashboard, mobile POS, inventory, order processing
│       └── eas.json             # EAS Build compilation configuration
├── packages/
│   ├── shared/                  # Shared TypeScript models, DTOs, bilingual i18n (FR/EN)
│   ├── design-system/           # Premium design tokens, typography, physical haptics
│   └── config/                  # Shared TypeScript and ESLint toolchains
├── Docs/                        # Architecture blueprints, technical audits, deployment guides
└── AGENTS.md                    # Core development standards and quality directives
```

---

### 3. CORE DOMAINS & KEY CAPABILITIES

#### D01 · Universal Catalog & Instant Sales
- **Multi-Category Storefront:** Structured catalog supporting electronics, hair & wigs, furniture, fashion, cosmetics, and everyday retail.
- **Verified Review Integrity:** Only buyers with paid, confirmed orders (`verifyPurchase`) can rate and review products. Zero artificial ratings (`rating: null`, `reviewsCount: 0` until authentic purchases occur).
- **Real-Time Inventory & Reservations:** Automatic reservation holds upon checkout initiation to prevent overselling across physical and digital storefronts.
- **New Product Showcase:** High-precision horology typography and clean diamond vector badge to highlight new arrivals.

#### D02 · Custom Inquiries & Made-to-Order Studio
- **Custom Product Requests:** Dedicated inquiry workflow for merchants offering custom dimensions (e.g., custom tables, personalized clothing, specific configurations).
- **Quotation & Deposit Engine:** Merchants submit detailed quotations specifying total pricing, required advance deposit, turnaround time, and specifications.
- **Milestone Financing:** Collection of an upfront advance deposit upon agreement, with the remaining balance collected upon delivery.

#### Merchant Commerce OS (FinOps S43 - S47)
- **Mobile & Desktop POS:** Point-of-sale management for both physical retail locations and online storefronts.
- **Immutable Cashbook (`CashbookEntry`):** Real-time recording of every cash inflow, business expense, and credit sale.
- **Certified Daily Cash Closure (`DayClosure`):** Daily reconciliation balancing total sales, cash collected, mobile money inflows, and variances with audit-grade closure locking.
- **Omnichannel West African Payments:** Native support for MTN Mobile Money, Moov Money, Celtiis Cash, Credit/Debit cards, direct bank transfer, and Cash on Delivery (COD).

#### Central Administration & Platform Supervision
- **Merchant KYC Verification:** Streamlined merchant verification pipeline to build trust and curb counterfeit goods.
- **Deny-by-Default Security Policy (A06):** No payment route or transaction proceeds without explicitly validated corridor rules.
- **Immutable Audit Trail (`AdminAuditLog`):** Complete traceability of administrative actions, account approvals, and financial adjustments.

#### Media Infrastructure & Content Delivery
- **Cloudflare R2 Object Storage:** Reliable cloud storage for merchant banners, store logos, and high-resolution product photography.
- **Integrated Streaming Proxy (`/api/v1/media/[...path]`):** Media routed through the official domain `www.ojarket.com`, preventing external DNS lookup failures.
- **OpenGraph & WhatsApp Optimization:** Product image compression under 300 KB and canonical links for fast, rich previews on WhatsApp, Facebook, X, and LinkedIn.

---

### 4. TECHNOLOGY STACK

| Component | Technology | Specification |
| :--- | :--- | :--- |
| **Web Storefront & Admin** | Next.js 14.2 (App Router) | SSR, SSG, Route Handlers, React 18 |
| **Mobile Application** | Expo SDK 57 / React Native 0.86 | Expo Router, Reanimated 4, Phosphor Icons |
| **Database** | PostgreSQL (Neon Database) | Pooled and direct (`DIRECT_URL`) connections |
| **ORM** | Prisma ORM 5.14 | Relational data schema, type safety, migrations |
| **Authentication** | Better Auth 1.7 / JWT | Multi-factor sessions, roles (Buyer, Seller, Admin) |
| **Media Storage** | Cloudflare R2 / AWS SDK S3 v3 | Private S3 buckets, presigned URLs, streaming proxy |
| **Mobile Compilation** | EAS Build (Expo Application Services) | `preview` profile generating standalone universal APKs |
| **Design System** | Ojarket Design Tokens | Premium palette (Silk Ivory, Stone, Deep Emerald, Champagne Gold) |
| **Internationalization** | Shared i18n package | Native bilingual support (French / English) |

---

### 5. LOCAL SETUP & QUICKSTART

#### Prerequisites
- **Node.js:** Version 20.x or higher
- **npm:** Version 10.x or higher
- **EAS CLI (for mobile builds):** `npm install -g eas-cli`

#### Step 1: Clone Repository
```bash
git clone https://github.com/AheadshipGold/AIFOUNDRY.git
cd AIFOUNDRY
```

#### Step 2: Install Monorepo Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Copy sample configuration templates and supply your local keys:
```bash
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```
*Note: In compliance with security directives, never commit or tamper directly with production `.env` files.*

#### Step 4: Generate Database Client
```bash
npm run prisma:generate
```

#### Step 5: Start Local Development Servers

**Web Storefront & Admin Console:**
```bash
npm --prefix apps/web run dev
# Running on http://localhost:3000
```

**Mobile Application (Expo Metro Bundler):**
```bash
npm --prefix apps/mobile run dev
# Metro bundler listening on http://localhost:8081
```

---

### 6. MONOREPO COMMAND REFERENCE

| Command | Action |
| :--- | :--- |
| `npm run dev` | Concurrently boots development servers across all workspaces |
| `npm run build` | Compiles web application for production |
| `npm run typecheck` | Enforces zero TypeScript errors across all packages and apps |
| `npm run lint` | Runs ESLint static analysis across the monorepo |
| `npm run prisma:generate` | Generates TypeScript definitions and Prisma ORM Client |

---

### 7. MOBILE APPLICATION COMPILATION (EAS BUILD)

To compile a standalone Android APK runnable on any physical device worldwide without Play Store restrictions:

```bash
cd apps/mobile
npx eas build -p android --profile preview --non-interactive
```

The cloud runner produces a signed `.apk` file ready for direct download and global distribution.

---

### 8. DESIGN SYSTEM & VISUAL EXCELLENCE

The design system delivers an elegant, high-end experience for all retail sectors:
- **Light Surfaces:** Silk Ivory (`#FAF9F6`), Noble Stone (`#F4F0EA`).
- **Dark Surfaces:** Deep Night Navy (`#081018`), Emerald Graphite (`#111C1A`).
- **Action & Trust:** Deep Emerald (`#0D4A38`).
- **Accent & Radiance:** Champagne Gold (`#D4B483`).
- **Zero System Emoji Policy:** Exclusively uses Phosphor Icons and sharp SVG vectors (1.5px to 1.75px) for a professional look.
- **Physical Haptics & Micro-interactions:** Fluid transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), hover elevation, and tactile button feedback.

---

### 9. COMPLIANCE & QUALITY CONTROL

Every contribution must satisfy the directives established in [AGENTS.md](AGENTS.md):
1. **Zero Type Errors:** Mandatory pass on `npm run typecheck` across `apps/web` and `apps/mobile`.
2. **Web & Mobile Parity:** Features and interface enhancements must be reflected symmetrically across both Web and Mobile platforms.
3. **Data Integrity:** No hardcoded metrics; all figures reflect real Prisma database models.

---

### 10. LICENSE & OWNERSHIP

Proprietary platform built for and owned by **Ojarket / AI Foundry**.  
All rights reserved.

---

<a id="français"></a>
## FRANÇAIS

### 1. VISION & POSITIONNEMENT

Ojarket est une infrastructure commerciale universelle et un système d'exploitation pour marchands (Merchant Commerce OS) conçu pour tous les commerçants, boutiquiers et vendeurs indépendants, en Afrique de l'Ouest (Cotonou, Abidjan, Bamako, Dakar) et à l'international.

La plateforme est conçue pour propulser tout type de commerce de détail :
- **Téléphonie & Électronique :** Smartphones, ordinateurs, accessoires et équipements informatiques.
- **Beauté, Perruques & Mèches :** Mèches, perruques, soins capillaires, bien-être et cosmétiques bio (notamment la boutique officielle administrateur, **Kingston Bio**).
- **Maison, Mobilier & Décoration :** Tables, chaises, meubles de salon et articles d'intérieur.
- **Mode & Habillement :** Vêtements, chaussures, sacs et accessoires.
- **Commerce Général & Détaillants :** Boutiques de quartier, quincailleries, épiceries fines et magasins multi-produits.
- **Commandes Spécifiques & Sur-Mesure (D02) :** Meubles personnalisés, confection sur-mesure et commandes nécessitant un devis avec acompte et suivi de fabrication.

Boutique Officielle Administrateur : **Kingston Bio**.

---

### 2. ARCHITECTURE DU MONOREPO

Le projet est structuré sous forme de monorepo moderne géré avec **npm workspaces** :

```text
aifoundry-monorepo/
├── apps/
│   ├── web/                     # Application Next.js 14 (App Router)
│   │   ├── src/app/             # Vitrine publique, /seller, /admin, /p, /shop
│   │   ├── src/app/api/         # Endpoints API, proxy média Cloudflare R2, authentification
│   │   └── prisma/              # Schéma de base de données PostgreSQL & migrations
│   └── mobile/                  # Application native mobile Expo SDK 57 (React Native 0.86)
│       ├── src/screens/buyer/   # Expérience acheteur, catalogue, fiches, panier, commandes
│       ├── src/screens/seller/  # Console marchand mobile, caisse POS, stock, commandes
│       └── eas.json             # Configuration des profils de compilation EAS Build
├── packages/
│   ├── shared/                  # DTOs, interfaces TypeScript, bilinguisme i18n (FR/EN)
│   ├── design-system/           # Tokens de design soignés, typographie, micro-animations
│   └── config/                  # Configurations partagées TypeScript et ESLint
├── Docs/                        # Spécifications métier, audits et directives techniques
└── AGENTS.md                    # Directives maîtresses de développement et règles d'or
```

---

### 3. DOMAINES MÉTIER & FONCTIONNALITÉS CLÉS

#### D01 · Catalogue Universel & Vente Directe
- **Vitrine Multi-Catégories :** Support de tout type d'inventaire (téléphonie, mèches et perruques, tables et mobilier, mode, cosmétiques, commerce général).
- **Intégrité stricte des avis :** Seuls les acheteurs ayant une commande payée et confirmée (`verifyPurchase`) peuvent publier un avis. Zéro note artificielle par défaut (`rating: null`, `reviewsCount: 0` tant qu'aucun achat vérifié n'a été effectué).
- **Gestion des stocks & réservations :** Réservations automatiques lors de l'initiation de commande pour éviter les ruptures et surventes entre boutique physique et boutique en ligne.
- **Mise en valeur des nouveaux articles :** Typographie fine d'horlogerie et symbole diamant vectoriel pour valoriser les nouveaux arrivages.

#### D02 · Commandes Personnalisées & Sur-Mesure
- **Expression de besoins clients :** Formulaire structuré pour les produits nécessitant des dimensions ou personnalisations précises (ex: table sur mesure, confection vestimentaire, articles spéciaux).
- **Moteur de devis marchand :** Propositions chiffrées détaillées incluant le prix total, l'acompte obligatoire, le délai de fabrication et les détails techniques.
- **Paiements échelonnés :** Encaissement de l'acompte à la validation de la commande et règlement du solde à la livraison.

#### Merchant Commerce OS (FinOps S43 - S47)
- **Point de vente (POS) Mobile & Web :** Caisse enregistreuse complète utilisable en magasin physique et en ligne.
- **Livre de caisse immuable (`CashbookEntry`) :** Enregistrement horodaté de chaque encaissement, dépense et vente à crédit.
- **Clôture journalière certifiée (`DayClosure`) :** Calcul automatique de la balance journalière (total vendu, total encaissé en caisse et par Mobile Money, variance) avec verrouillage d'audit.
- **Paiements omnicanaux d'Afrique de l'Ouest :** Intégration MTN MoMo, Moov Money, Celtiis Cash, Carte bancaire, virement bancaire et paiement à la livraison (Cash on Delivery).

#### Administration Centrale & Supervision
- **Vérification KYC des marchands :** Processus de validation des boutiques pour garantir la sécurité et éliminer les fraudes.
- **Sécurité Deny-by-Default (A06) :** Aucun corridor de paiement ni mouvement de fonds n'est exécuté sans règle contractuelle expressément validée.
- **Journal d'audit administratif (`AdminAuditLog`) :** Traçabilité immuable de chaque action de modération, validation de compte ou ajustement financier.

#### Infrastructure Médias & CDN
- **Stockage Cloudflare R2 :** Hébergement cloud des bannières de boutiques, logos et photos de produits en haute résolution.
- **Streaming Proxy Sécurisé (`/api/v1/media/[...path]`) :** Distribution des images via le domaine officiel `www.ojarket.com`, évitant toute panne de résolution DNS externe.
- **Optimisation OpenGraph & Partage Réseaux Sociaux :** Compression des images sous 300 Ko et URLs canoniques pour garantir l'affichage instantané des aperçus riches sur WhatsApp, Facebook, X et LinkedIn.

---

### 4. STACK TECHNIQUE

| Composant | Technologie | Détails |
| :--- | :--- | :--- |
| **Vitrine Web & Console** | Next.js 14.2 (App Router) | SSR, SSG, Route Handlers, React 18 |
| **Application Mobile** | Expo SDK 57 / React Native 0.86 | Expo Router, Reanimated 4, Phosphor Icons |
| **Base de Données** | PostgreSQL (Neon Database) | Connexion mutualisée et directe (`DIRECT_URL`) |
| **ORM** | Prisma ORM 5.14 | Modélisation relationnelle, typage strict, migrations |
| **Authentification** | Better Auth 1.7 / JWT | Sessions multi-facteurs, gestion des rôles (Buyer, Seller, Admin) |
| **Stockage Médias** | Cloudflare R2 / AWS SDK S3 v3 | Bucket privé, URLs signées et proxy de distribution |
| **Assemblage Mobile** | EAS Build (Expo Application Services) | Profil `preview` pour génération d'APK autonome universel |
| **Design & Tokens** | Design System Ojarket propriétaire | Matériaux soignés (Ivoire, Pierre, Vert Émeraude, Or Champagne) |
| **Internationalisation** | Shared i18n | Support bilingue natif Français / Anglais |

---

### 5. INSTALLATION & DÉMARRAGE RAPIDE

#### Prérequis
- **Node.js :** Version 20.x ou supérieure
- **npm :** Version 10.x ou supérieure
- **EAS CLI (pour la compilation mobile) :** `npm install -g eas-cli`

#### Étape 1 : Clonage du dépôt
```bash
git clone https://github.com/AheadshipGold/AIFOUNDRY.git
cd AIFOUNDRY
```

#### Étape 2 : Installation des dépendances
```bash
npm install
```

#### Étape 3 : Configuration de l'environnement
Copier les fichiers d'exemple et renseigner vos variables locales :
```bash
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```
*Note : Conformément aux directives de sécurité, ne jamais commiter ni altérer directement les fichiers `.env` en production.*

#### Étape 4 : Initialisation de la base de données
```bash
npm run prisma:generate
```

#### Étape 5 : Lancement des applications en développement

**Vitrine Web & Console d'Administration :**
```bash
npm --prefix apps/web run dev
# Accessible sur http://localhost:3000
```

**Application Mobile Expo :**
```bash
npm --prefix apps/mobile run dev
# Lance le bundler Metro sur http://localhost:8081
```

---

### 6. COMMANDES DU MONOREPO

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Démarre simultanément tous les workspaces en mode développement |
| `npm run build` | Compile l'application Web pour production |
| `npm run typecheck` | Contrôle de typage TypeScript strict sur l'ensemble du monorepo |
| `npm run lint` | Analyse statique du code (ESLint) |
| `npm run prisma:generate` | Génère les types et le client Prisma ORM |

---

### 7. ASSEMBLAGE DE L'APPLICATION MOBILE (EAS BUILD)

Pour compiler et générer un fichier APK Android autonome distribuable sans dépendance au Play Store :

```bash
cd apps/mobile
npx eas build -p android --profile preview --non-interactive
```

Le build produit un fichier `.apk` universel signé et prêt au téléchargement sur le cloud Expo.

---

### 8. CHARTE DE DESIGN & EXPÉRIENCE UTILISATEUR

Le design system Ojarket offre une finition soignée et professionnelle adaptée à tous les commerces :
- **Surfaces Claires :** Ivoire soyeux (`#FAF9F6`), Pierre noble (`#F4F0EA`).
- **Surfaces Sombres :** Bleu Nuit impérial (`#081018`), Graphite émeraude (`#111C1A`).
- **Couleur d'Action :** Vert émeraude profond (`#0D4A38`).
- **Couleur d'Accent :** Or champagne satiné (`#D4B483`).
- **Tolérance Zéro pour les Emojis Système :** Utilisation exclusive de Phosphor Icons et de tracés SVG vectoriels fins (1.5px à 1.75px) pour une crédibilité maximale.
- **Micro-animations tactiles :** Transitions fluides (`cubic-bezier(0.16, 1, 0.3, 1)`), élévation au survol et retour tactile lors de la pression sur les boutons.

---

### 9. CONFORMITÉ & RÈGLES DE DÉVELOPPEMENT

Toute intervention sur ce dépôt est régie par le document maître [AGENTS.md](AGENTS.md) :
1. **Zéro Erreur de Typage :** Tout code doit passer `npm run typecheck` avec zéro erreur sur `apps/web` et `apps/mobile`.
2. **Parité Web & Mobile :** Toute mise à jour de fonctionnalité marchande ou de catalogue doit être reflétée de manière symétrique sur les deux plateformes.
3. **Respect des Données Métier :** Aucune métrique inventée en dur ; toutes les statistiques proviennent strictement de la base de données PostgreSQL.

---

### 10. LICENCE & PROPRIÉTÉ

Plateforme développée par et pour **Ojarket / AI Foundry**.  
Tous droits réservés.
