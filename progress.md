# AI Foundry - Progress Log

Ce fichier trace toutes les avancées, décisions et implémentations réalisées sur le projet.
**Règle d'or :** Les nouvelles entrées doivent toujours être ajoutées **en haut** de ce fichier (ordre anti-chronologique). Les agents doivent lire ce fichier du bas vers le haut pour comprendre l'historique complet, ou du haut vers le bas pour les dernières mises à jour.

---

## [29 Septembre 2026] - Validation & Hardening Backend V3 (Agent : Antigravity)
**Branche :** ntigravity/backend-foundation-v3

**Accomplissements :**
- **Smoke Tests E2E finaux :** Exécution et réussite des tests de validation E2E (script smoke.ts).
- **Validation Better Auth :** Résolution dune erreur de schéma Prisma (ajout de idToken). Les requêtes dinscription, de session, et de déconnexion ont été testées avec succès.
- **Isolation Multitenant prouvée :** Le ShopIsolationGuard a été renforcé avec une vérification de rôles NestJS (@Roles).
- **RLS Logiciel (Prisma Extension) :** Implémentation dune Prisma Client Extension (PrismaService.forShop()) injectant dynamiquement shopId dans toutes les requêtes (Software RLS).
- **Job Queues (Pg-boss) :** Instanciation de Pg-boss vérifiée, enqueue et worker loops fonctionnels.
- **Rapport Final de la Fondation :** Génération du rapport exhaustif prouvant lexécution du Backend avec preuves exécutables. Les autres services Docker (MinIO) nont pas pu être démarrés localement à cause des limites de téléchargement (rate limit) de Docker Hub, mais le code applicatif est prêt.

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

## [29 Septembre 2026] - Phase : UI & Design System V3 (Agent : Codex)
**Branche :** `codex/ui-design-system-v3`

**Accomplissements :**
- **Design System :** Début de l'implémentation du Design System et de l'UX/UI selon les spécifications V3.
- **Création de la branche :** Création de la branche dédiée pour le travail sur l'interface utilisateur, afin de ne pas interférer avec le backend. L'agent Codex travaille actuellement sur le package `design-system`, les tokens UI, et le rendu visuel.

---

## [Début du projet] - Phase : Initialisation
- **Monorepo Setup :** Mise en place de l'architecture Monorepo Turborepo avec les dossiers `apps` (api, mobile, web) et `packages` (design-system, shared, etc.).
- **Hand-off Fondateur :** Ajout des documents fondateurs V3 (Architecture, PRD, Décisions) définissant PostgreSQL, NestJS, Prisma, Better Auth, et Expo comme stack technologique principale.
