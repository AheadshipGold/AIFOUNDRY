# OJARKEY · LUXURY MARKETPLACE & MERCHANT COMMERCE OS

[English](#english) · [Français](#français)

---

<a id="english"></a>
## ENGLISH

### 1. VISION & POSITIONING

Ojarket is a unified commercial infrastructure engineered to elevate African master craftsmanship, designer furniture, high jewelry, and bespoke bespoke creations (D02) to the uncompromising standards of international luxury houses (Cartier, Rolex, Hermès, LVMH).

Targeting West African economic capitals (Cotonou, Abidjan, Bamako, Dakar) and an international discerning clientele, the platform operates across two foundational dimensions:
1. **Prestige Showcase & Bespoke Atelier (B2C & C2C):** Direct purchase of certified master artisan pieces alongside an on-demand bespoke commissioning studio (D02) featuring dynamic custom quotes, mandatory deposits, and milestone tracking throughout the manufacturing journey.
2. **Merchant Commerce OS (B2B SaaS):** A robust operating system for independent merchants and workshops: live physical inventory control, omnichannel payments (West African Mobile Money, Card, Cash), an immutable cashbook, and certified daily accounting closures.

Official Administrator Boutique: **Kingston Bio**.

---

### 2. MONOREPO ARCHITECTURE

The repository is organized as an enterprise-grade monorepo powered by **npm workspaces**:

```text
aifoundry-monorepo/
├── apps/
│   ├── web/                     # Next.js 14 application (App Router)
│   │   ├── src/app/             # Public storefront, /seller, /admin, /p, /shop
│   │   ├── src/app/api/         # API endpoints, Cloudflare R2 media streaming proxy, auth
│   │   └── prisma/              # PostgreSQL database schema & migrations
│   └── mobile/                  # Native mobile app with Expo SDK 57 (React Native 0.86)
│       ├── src/screens/buyer/   # Buyer experience, catalog, product details, bespoke forms
│       ├── src/screens/seller/  # Merchant console, point-of-sale, inventory, orders
│       └── eas.json             # EAS Build compilation profiles
├── packages/
│   ├── shared/                  # Shared TypeScript types, DTOs, bilingual i18n (FR/EN)
│   ├── design-system/           # Noble design tokens, typography, physical haptics
│   └── config/                  # Shared TypeScript and ESLint toolchains
├── Docs/                        # Architecture blueprints, audit reports, UX directives
└── AGENTS.md                    # Master developer directives and non-negotiable standards
```

---

### 3. CORE DOMAINS & KEY CAPABILITIES

#### D01 · Catalog & Direct Sales
- **Strict Review Integrity:** Only buyers with a paid and confirmed order (`verifyPurchase`) are eligible to submit reviews. Default states require zero artificial ratings (`rating: null`, `reviewsCount: 0` until authentic verified reviews exist).
- **New Arrival Badge:** Distinguished high-horology typography in golden small caps paired with a four-point jewelry diamond vector symbol.
- **Real-Time Inventory Guard:** Automatic reservation holds upon order checkout initiation with immediate stock decrement upon verified payment.

#### D02 · Bespoke Commissions & Artisan Matching
- **Structured Buyer Requests:** Comprehensive custom order inquiry forms capturing materials, dimensions, target budget, and desired delivery windows.
- **Detailed Artisan Proposals:** Tailored quotation submissions defining full pricing, required advance deposit, workshop turnaround time, and technical specifications.
- **Split Milestone Financing:** Advance deposit settlement at order placement followed by final balance collection upon artisan milestone validation.

#### Merchant Commerce OS (FinOps S43 - S47)
- **Immutable Cashbook (`CashbookEntry`):** Time-stamped auditing of every cash inflow, expense disbursement, and credit sale.
- **Certified Daily Day Closure (`DayClosure`):** Automated calculation of daily gross sales, actual collections, and variance with audit-grade closure locking.
- **Omnichannel West African Payments:** Native support for MTN Mobile Money, Moov Money, Celtiis Cash, Credit/Debit cards, direct bank wire, and Cash on Delivery (COD).

#### Central Administration & Oversight
- **Merchant KYC Verification:** Systematic onboarding and identity verification pipelines for artisan studios.
- **Deny-by-Default Security Policy (A06):** No payment corridor or monetary transaction can execute without explicitly validated partner routing rules.
- **Immutable Administrative Audit Trail (`AdminAuditLog`):** End-to-end event logging of moderation, financial adjustments, and access decisions.

#### Media Infrastructure & Content Delivery
- **Cloudflare R2 Object Storage:** High-performance storage for catalog photography and artisan banners.
- **Secure Streaming Proxy (`/api/v1/media/[...path]`):** Media delivery routed through the primary `www.ojarket.com` domain, removing external DNS resolution bottlenecks.
- **OpenGraph & WhatsApp Rich Preview Optimization:** Images compressed under 300 KB with strict canonical URLs to ensure pristine card unfurling across WhatsApp, Meta, X, and LinkedIn.

---

### 4. TECHNOLOGY STACK

| Component | Technology | Specification |
| :--- | :--- | :--- |
| **Web Application** | Next.js 14.2 (App Router) | SSR, SSG, Route Handlers, React 18 |
| **Mobile Application** | Expo SDK 57 / React Native 0.86 | Expo Router, Reanimated 4, Phosphor Icons |
| **Database** | PostgreSQL (Neon Database) | Pooled and direct (`DIRECT_URL`) connections |
| **ORM** | Prisma ORM 5.14 | Relational schema, strict typing, migration engine |
| **Authentication** | Better Auth 1.7 / JWT | Multi-factor sessions, role segregation (Buyer, Seller, Admin) |
| **Cloud Storage** | Cloudflare R2 / AWS SDK S3 v3 | Private S3 buckets, presigned URLs, streaming proxy |
| **Mobile Compilation** | EAS Build (Expo Application Services) | `preview` profile generating standalone universal APKs |
| **Design System** | Ojarket Luxury Design Tokens | Noble materials (Silk Ivory, Stone, Deep Emerald, Champagne Gold) |
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

The cloud runner produces a cryptographically signed `.apk` archive available immediately on Expo's CDN.

---

### 8. DESIGN SYSTEM & NOBLE MATERIALS

The visual foundation mirrors high jewelry and luxury watchmaking aesthetics:
- **Light Surfaces:** Silk Ivory (`#FAF9F6`), Noble Stone (`#F4F0EA`).
- **Dark Surfaces:** Deep Night Navy (`#081018`), Emerald Graphite (`#111C1A`).
- **Action & Trust:** Deep Emerald (`#0D4A38`).
- **Accent & Radiance:** Champagne Gold (`#D4B483`).
- **Zero System Emoji Policy:** Strict enforcement of Phosphor Icons and vector SVG strokes (1.5px to 1.75px).
- **Physical Haptics & Micro-interactions:** Gentle cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), hover elevation, and tactile depression on active states.

---

### 9. COMPLIANCE & QUALITY CONTROL

Every contribution must satisfy the directives established in [AGENTS.md](AGENTS.md):
1. **Zero Type Errors:** Mandatory pass on `npm run typecheck` across `apps/web` and `apps/mobile`.
2. **Web & Mobile Parity:** Catalog features, merchant operations, and UI refinements must be mirrored across both Web and Mobile platforms.
3. **Data Integrity:** No hardcoded metrics; all figures reflect real Prisma database models.

---

### 10. LICENSE & OWNERSHIP

Proprietary platform built for and owned by **Ojarket / AI Foundry**.  
All rights reserved.

---

<a id="français"></a>
## FRANÇAIS

### 1. VISION & POSITIONNEMENT

Ojarket est une infrastructure commerciale unifiée conçue pour hisser l'artisanat d'art, le mobilier d'auteur, la haute joaillerie et les créations sur-mesure africaines (D02) aux plus hauts standards internationaux du luxe (Cartier, Rolex, Hermès, LVMH).

Ciblant les capitales économiques d'Afrique de l'Ouest (Cotonou, Abidjan, Bamako, Dakar) ainsi qu'une clientèle internationale exigeante, la plateforme opère sous une double dimension :
1. **Vitrine d'Exception & Sur-Mesure (B2C & C2C) :** Achat direct de pièces de créateurs certifiés et atelier de commandes personnalisées (D02) avec devis dynamiques, acomptes et jalons de confection en temps réel.
2. **Merchant Commerce OS (B2B SaaS) :** Système d'exploitation commercial complet pour marchands et ateliers d'art : gestion des stocks physiques, encaissements omnicanaux (Mobile Money, Carte, Espèces), livre de caisse immuable et clôture comptable journalière certifiée.

Boutique Officielle Administrateur : **Kingston Bio**.

---

### 2. ARCHITECTURE DU MONOREPO

Le projet est structuré sous forme de monorepo moderne géré avec **npm workspaces** :

```text
aifoundry-monorepo/
├── apps/
│   ├── web/                     # Application Next.js 14 (App Router)
│   │   ├── src/app/             # Routes publiques, /seller, /admin, /p, /shop
│   │   ├── src/app/api/         # Endpoints API, proxy média Cloudflare R2, authentification
│   │   └── prisma/              # Schéma de base de données PostgreSQL & migrations
│   └── mobile/                  # Application native mobile Expo SDK 57 (React Native 0.86)
│       ├── src/screens/buyer/   # Expérience acheteur, catalogue, fiches, sur-mesure
│       ├── src/screens/seller/  # Console marchand mobile, caisse, stock, commandes
│       └── eas.json             # Configuration des profils de compilation EAS Build
├── packages/
│   ├── shared/                  # DTOs, interfaces TypeScript, bilinguisme i18n (FR/EN)
│   ├── design-system/           # Tokens nobles, typographie, élévations, micro-animations
│   └── config/                  # Configurations partagées TypeScript et ESLint
├── Docs/                        # Spécifications métier, audits et directives de prestige
└── AGENTS.md                    # Directives maîtresses de développement et règles d'or
```

---

### 3. DOMAINES MÉTIER & FONCTIONNALITÉS CLÉS

#### D01 · Catalogue & Vente Directe
- **Intégrité stricte des notations :** Seuls les acheteurs avec commande payée et confirmée (`verifyPurchase`) peuvent publier un avis. Zéro note artificielle par défaut (`rating: null`, `reviewsCount: 0` si aucun avis vérifié).
- **Badge Nouveau Produit :** Typographie haute horlogerie en petites capitales et symbole joaillerie diamant vectoriel pour honorer les créations récentes.
- **Gestion des stocks en temps réel :** Réservations automatiques lors de l'initiation de commande et décrémentation instantanée à la validation.

#### D02 · Commandes Sur-Mesure & Ateliers d'Art
- **Expression de besoin acheteur :** Formulaire structuré de demande sur-mesure avec critères de matière, dimensions, budget cible et date limite de livraison.
- **Soumission de devis marchand :** Propositions chiffrées détaillées incluant prix total, acompte obligatoire, délai d'atelier et notes techniques.
- **Paiements échelonnés :** Encaissement de l'acompte à la commande et règlement du solde après validation des jalons de confection.

#### Merchant Commerce OS (FinOps S43 - S47)
- **Livre de caisse immuable (`CashbookEntry`) :** Enregistrement horodaté de chaque encaissement, décaissement et vente à crédit.
- **Clôture journalière certifiée (`DayClosure`) :** Calcul automatique de la balance journalière (total vendu, total encaissé, variance) avec verrouillage audit immuable.
- **Paiements multi-canaux d'Afrique de l'Ouest :** Intégration MTN MoMo, Moov Money, Celtiis Cash, Carte bancaire, virement direct et paiement à la livraison.

#### Administration Centrale & Supervision
- **Contrôle KYC des marchands :** Processus de validation des boutiques, attribution du statut de vérification et gestion des suspensions.
- **Sécurité Deny-by-Default (A06) :** Aucun corridor de paiement ni mouvement de fonds n'est exécuté sans règle contractuelle expressément validée.
- **Journal d'audit administratif (`AdminAuditLog`) :** Traçabilité immuable de chaque action de modération, ajustement ou validation.

#### Infrastructure Médias & CDN
- **Stockage Cloudflare R2 :** Téléversement optimisé des photographies de créateurs et bannières de boutiques.
- **Streaming Proxy Sécurisé (`/api/v1/media/[...path]`) :** Distribution des médias sous le domaine officiel `www.ojarket.com`, neutralisant toute dépendance DNS externe.
- **Optimisation OpenGraph & Partage Social :** Format d'image optimisé (< 300 Ko) et liens canoniques stricts pour garantir l'affichage des aperçus riches sur WhatsApp, Facebook, X et LinkedIn.

---

### 4. STACK TECHNIQUE

| Composant | Technologie | Détails |
| :--- | :--- | :--- |
| **Framework Web** | Next.js 14.2 (App Router) | SSR, SSG, Route Handlers, React 18 |
| **Application Mobile** | Expo SDK 57 / React Native 0.86 | Expo Router, Reanimated 4, Phosphor Icons |
| **Base de Données** | PostgreSQL (Neon Database) | Connexion mutualisée et directe (`DIRECT_URL`) |
| **ORM** | Prisma ORM 5.14 | Modélisation relationnelle, typage strict, migrations |
| **Authentification** | Better Auth 1.7 / JWT | Sessions multi-facteurs, gestion des rôles (Buyer, Seller, Admin) |
| **Stockage Cloud** | Cloudflare R2 / AWS SDK S3 v3 | Bucket privé, URLs signées et proxy de distribution |
| **Assemblage Mobile** | EAS Build (Expo Application Services) | Profil `preview` pour génération d'APK autonome universel |
| **Design & Tokens** | Design System Ojarket propriétaire | Matériaux nobles (Ivoire, Pierre, Vert Émeraude, Or Champagne) |
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

### 8. CHARTE DE DESIGN & MATÉRIAUX NOBLES

Le design system Ojarket respecte les standards de la haute joaillerie et de l'artisanat d'élite :
- **Surfaces Claires :** Ivoire soyeux (`#FAF9F6`), Pierre noble (`#F4F0EA`).
- **Surfaces Sombres :** Bleu Nuit impérial (`#081018`), Graphite émeraude (`#111C1A`).
- **Couleur d'Action :** Vert émeraude profond (`#0D4A38`).
- **Couleur d'Accent :** Or champagne satiné (`#D4B483`).
- **Tolérance Zéro pour les Emojis Système :** Utilisation exclusive de Phosphor Icons et de tracés SVG vectoriels fins (1.5px à 1.75px).
- **Micro-animations tactiles :** Transitions douces (`cubic-bezier(0.16, 1, 0.3, 1)`), élévation au survol et retour haptique visuel à la pression.

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
