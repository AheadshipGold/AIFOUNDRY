# AI Foundry - Progress Log

Ce fichier trace toutes les avancées, décisions et implémentations réalisées sur le projet.
**Règle d'or :** Les nouvelles entrées doivent toujours être ajoutées **en haut** de ce fichier (ordre anti-chronologique). Les agents doivent lire ce fichier du bas vers le haut pour comprendre l'historique complet, ou du haut vers le bas pour les dernières mises à jour.

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
