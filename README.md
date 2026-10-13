# OJARKEY · LUXURY MARKETPLACE & MERCHANT COMMERCE OS

> Plateforme d'artisanat d'exception, créations sur-mesure (D02) et système d'exploitation commercial marchand (Merchant Commerce OS) à destination de l'Afrique de l'Ouest (Cotonou, Abidjan, Bamako, Dakar) et du rayonnement international.  
> Boutique Officielle Administrateur : **Kingston Bio**.

---

## 1. VISION & POSITIONNEMENT

Ojarket est une infrastructure commerciale unifiée conçue pour hisser l'artisanat d'art, le mobilier d'auteur, la haute joaillerie et les créations sur-mesure africaines aux plus hauts standards internationaux du luxe (Cartier, Rolex, Hermès, LVMH).

La plateforme opère sous une double dimension :
1. **Vitrine d'Exception & Sur-Mesure (B2C & C2C) :** Achat direct de pièces de créateurs certifiés et atelier de commandes personnalisées (D02) avec devis dynamiques, acomptes et jalons de confection en temps réel.
2. **Merchant Commerce OS (B2B SaaS) :** Système d'exploitation commercial complet pour marchands et ateliers d'art : gestion des stocks physiques, encaissements omnicanaux (Mobile Money, Carte, Espèces), livre de caisse immuable et clôture comptable journalière certifiée.

---

## 2. ARCHITECTURE DU MONOREPO

Le projet est structuré sous forme de monorepo moderne géré avec **npm workspaces** :

```text
aifoundry-monorepo/
├── apps/
│   ├── web/                     # Application Next.js 14 (App Router)
│   │   ├── src/app/             # Routes publiques, /seller, /admin, /p, /shop
│   │   ├── src/app/api/         # Endpoints API, proxy média R2, authentification
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

## 3. DOMAINES MÉTIER & FONCTIONNALITÉS CLÉS

### D01 · Catalogue & Vente Directe
- **Intégrité stricte des notations :** Seuls les acheteurs avec commande payée et confirmée (`verifyPurchase`) peuvent publier un avis. Zéro note artificielle par défaut (`rating: null`, `reviewsCount: 0` si aucun avis vérifié).
- **Badge Nouveau Produit :** Typographie haute horlogerie en petites capitales et symbole joaillerie diamant vectoriel pour honorer les créations récentes.
- **Gestion des stocks en temps réel :** Réservations automatiques lors de l'initiation de commande et décrémentation instantanée à la validation.

### D02 · Commandes Sur-Mesure & Ateliers d'Art
- **Expression de besoin acheteur :** Formulaire structuré de demande sur-mesure avec critères de matière, dimensions, budget cible et date limite de livraison.
- **Soumission de devis marchand :** Propositions chiffrées détaillées incluant prix total, acompte obligatoire, délai d'atelier et notes techniques.
- **Paiements échelonnés :** Encaissement de l'acompte à la commande et règlement du solde après validation des jalons de confection.

### Merchant Commerce OS (FinOps S43 - S47)
- **Livre de caisse immuable (`CashbookEntry`) :** Enregistrement horodaté de chaque encaissement, décaissement et vente à crédit.
- **Clôture journalière certifiée (`DayClosure`) :** Calcul automatique de la balance journalière (total vendu, total encaissé, variance) avec verrouillage audit immuable.
- **Paiements multi-canaux d'Afrique de l'Ouest :** Intégration MTN MoMo, Moov Money, Celtiis Cash, Carte bancaire, virement direct et paiement à la livraison.

### Administration Centrale & Supervision
- **Contrôle KYC des marchands :** Processus de validation des boutiques, attribution du statut de vérification et gestion des suspensions.
- **Sécurité Deny-by-Default (A06) :** Aucun corridor de paiement ni mouvement de fonds n'est exécuté sans règle contractuelle expressément validée.
- **Journal d'audit administratif (`AdminAuditLog`) :** Traçabilité immuable de chaque action de modération, ajustement ou validation.

### Infrastructure Médias & CDN
- **Stockage Cloudflare R2 :** Téléversement optimisé des photographies de créateurs et bannières de boutiques.
- **Streaming Proxy Sécurisé (`/api/v1/media/[...path]`) :** Distribution des médias sous le domaine officiel `www.ojarket.com`, neutralisant toute dépendance DNS externe.
- **Optimisation OpenGraph & Partage Social :** Format d'image optimisé (< 300 Ko) et liens canoniques stricts pour garantir l'affichage des aperçus riches sur WhatsApp, Facebook, X et LinkedIn.

---

## 4. STACK TECHNIQUE

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

## 5. INSTALLATION & DÉMARRAGE RAPIDE

### Prérequis
- **Node.js :** Version 20.x ou supérieure
- **npm :** Version 10.x ou supérieure
- **EAS CLI (pour la compilation mobile) :** `npm install -g eas-cli`

### 1. Clonage du dépôt
```bash
git clone https://github.com/scriptura/AIFOUNDRY.git
cd AIFOUNDRY
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Copier les fichiers d'exemple et renseigner vos variables locales :
```bash
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

*Note : Conformément aux directives de sécurité, ne jamais commiter ni altérer directement les fichiers `.env` en production.*

### 4. Initialisation de la base de données
Générer le client Prisma à partir du schéma officiel :
```bash
npm run prisma:generate
```

### 5. Lancement des applications en développement

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

## 6. COMMANDES DU MONOREPO

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Démarre simultanément tous les workspaces en mode développement |
| `npm run build` | Compile l'application Web pour production |
| `npm run typecheck` | Contrôle de typage TypeScript strict sur l'ensemble du monorepo |
| `npm run lint` | Analyse statique du code (ESLint) |
| `npm run prisma:generate` | Génère les types et le client Prisma ORM |

---

## 7. ASSEMBLAGE DE L'APPLICATION MOBILE (EAS BUILD)

Pour compiler et générer un fichier APK Android autonome distribuable sans dépendance au Play Store :

```bash
cd apps/mobile
npx eas build -p android --profile preview --non-interactive
```

Le build produit un fichier `.apk` universel signé et prêt au téléchargement sur le cloud Expo.

---

## 8. CHARTE DE DESIGN & MATÉRIAUX NOBLES

Le design system Ojarket respecte les standards de la haute joaillerie et de l'artisanat d'élite :

- **Surfaces Claires :** Ivoire soyeux (`#FAF9F6`), Pierre noble (`#F4F0EA`).
- **Surfaces Sombres :** Bleu Nuit impérial (`#081018`), Graphite émeraude (`#111C1A`).
- **Couleur d'Action :** Vert émeraude profond (`#0D4A38`).
- **Couleur d'Accent :** Or champagne satiné (`#D4B483`).
- **Tolérance Zéro pour les Emojis Système :** Utilisation exclusive de Phosphor Icons et de tracés SVG vectoriels fins (1.5px à 1.75px).
- **Micro-animations tactiles :** Transitions douces (`cubic-bezier(0.16, 1, 0.3, 1)`), élévation au survol et retour haptique visuel à la pression.

---

## 9. CONFORMITÉ & RÈGLES DE DÉVELOPPEMENT

Toute intervention sur ce dépôt est régie par le document maître [AGENTS.md](AGENTS.md) :
1. **Zéro Erreur de Typage :** Tout code doit passer `npm run typecheck` avec zéro erreur sur `apps/web` et `apps/mobile`.
2. **Parité Web & Mobile :** Toute mise à jour de fonctionnalité marchande ou de catalogue doit être reflétée de manière symétrique sur les deux plateformes.
3. **Respect des Données Métier :** Aucune métrique inventée en dur ; toutes les statistiques proviennent strictement de la base de données PostgreSQL.

---

## 10. LICENCE & PROPRIÉTÉ

Plateforme développée par et pour **Ojarket / AI Foundry**.  
Tous droits réservés.
