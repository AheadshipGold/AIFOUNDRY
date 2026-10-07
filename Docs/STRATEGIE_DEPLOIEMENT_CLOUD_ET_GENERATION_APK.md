# GUIDE STRATÉGIQUE DE DÉPLOIEMENT CLOUD & GÉNÉRATION D'APK AUTONOME
**Projet :** Ojarket (AI Foundry) — Marketplace de Luxe & Merchant Commerce OS
**Date :** 6 octobre 2026
**Statut :** Document de Référence Opérationnel

---

## 1. INTRODUCTION & OBJECTIFS

Ce guide documente la méthodologie complète pour :
1. **Générer un fichier APK autonome (.apk)** installable sur n'importe quel smartphone Android physique (pour tests réels, démonstrations et usage en boutique), sans obligation de passer par le Google Play Store dans l'immédiat.
2. **Déployer l'infrastructure dans le Cloud** (API NestJS, base de données PostgreSQL, vitrine Web Next.js) afin que l'application mobile installée sur un téléphone puisse communiquer avec les données réelles en ligne depuis n'importe où (4G/Wi-Fi).

---

## 2. GÉNÉRATION DU FICHIER APK ANDROID AUTONOME

L'application mobile (apps/mobile) est construite avec Expo (React Native). Vous disposez de **deux méthodes directes** calquées sur vos habitudes du projet S_N (Scriptura).

```
apps/mobile (Expo React Native)
       │
       ▼  (npx expo prebuild --platform android)
Dossier natif android/ généré
       │
       ├──► Méthode 1 : Android Studio (Signature avec Keystore existant)
       │
       └──► Méthode 2 : Ligne de commande directe (./gradlew assembleRelease)
```

---

### Méthode 1 : Via Android Studio (Votre méthode habituelle sur S_N)
1. **Génération du dossier natif :**
   ```bash
   cd apps/mobile
   npx expo prebuild --platform android
   ```
2. **Ouverture dans Android Studio :**
   - Lancez Android Studio.
   - Ouvrez le dossier généré : `apps/mobile/android`.
3. **Génération de l'APK signé :**
   - Menu : `Build` -> `Generate Signed Bundle / APK...`
   - Sélectionnez : **APK** (et non Android App Bundle / AAB qui est réservé au Play Store).
   - Indiquez votre fichier de clés Keystore existant (identifiant, mot de passe de clé).
   - Choisissez le profil : **Release**.
   - Cliquez sur **Create**.
4. **Récupération :**
   Le fichier `.apk` est généré et peut être transféré directement par câble USB, Google Drive ou WhatsApp sur n'importe quel smartphone Android.

---

### Méthode 2 : En Ligne de Commande Locale Rapide
Sans ouvrir l'interface lourde d'Android Studio, vous pouvez compiler directement l'APK en terminal :
```bash
cd apps/mobile/android
./gradlew assembleRelease
```
Le fichier APK final est immédiatement disponible dans :
`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 3. FONCTIONNEMENT RÉSEAU : DU LOCALHOST AU CLOUD

En développement local, l'application mobile et le web communiquent avec `http://localhost:3001/api`.
Dès que l'APK est installé sur un smartphone distant, `localhost` pointe vers le téléphone lui-même et ne peut plus joindre votre ordinateur.

Il est donc nécessaire que l'API et la base de données soient accessibles via une **adresse sécurisée HTTPS publique** :

```
 ┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
 │   Application Mobile (APK Android)     │       │    Vitrine & Console Web (Next.js)     │
 └───────────────────┬────────────────────┘       └───────────────────┬────────────────────┘
                     │                                                │
                     │ HTTPS (https://api.ojarket.com)                │ HTTPS (https://ojarket.com)
                     ▼                                                ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                       API Backend NestJS (Cloud Node.js / Docker)                      │
 └────────────────────────────────────────────┬───────────────────────────────────────────┘
                                              │
                                              │ DATABASE_URL (PostgreSQL Managé)
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                 Base de Données PostgreSQL Managée (Supabase ou Cloud SQL)             │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. COMPARATIF DES 2 ARCHITECTURES CLOUD ÉPROUVÉES

D'après l'analyse de vos projets existants, deux architectures s'offrent à vous :

### Option A — Le Modèle « ZaraMelo » (Vercel + Supabase + Cloudflare)
> **Recommandé pour démarrer vite, avec des coûts initiaux nuls ou minimes.**

* **Base de données :** **Supabase (PostgreSQL Managé)**
  - Création du projet en 1 clic.
  - Compatible 100% avec Prisma ORM via la chaîne `DATABASE_URL="postgresql://..."`.
  - Migration instantanée de toutes les tables avec `npx prisma db push`.
* **Vitrine & Console Web (apps/web) :** **Vercel**
  - Hébergement natif Next.js optimisé.
  - Certificats SSL HTTPS automatiques et gratuits.
  - Connexion automatique au dépôt Git pour mises à jour continues.
* **API Backend NestJS (apps/api) :** **Render** ou **Railway** ou **Fly.io**
  - Hébergement de l'API Node.js en continu.
  - Gestion des variables d'environnement sécurisées.
* **Stockage Médias & Fichiers Numériques :** **Cloudflare R2**
  - 100% compatible AWS S3 / URLs signées temporaires.
  - Zéro frais de bande passante sur les téléchargements.

---

### Option B — Le Modèle « Scriptura / Google Cloud » (Google Cloud Run + Cloud SQL)
> **Recommandé pour une infrastructure d'entreprise unifiée Google Cloud.**

* **API NestJS & Web Next.js :** **Google Cloud Run**
  - Applications encapsulées dans des conteneurs Docker légers.
  - Exécution sans serveur (*serverless*) : mise à l'échelle automatique (0 à plusieurs milliers d'utilisateurs).
  - Facturation à la seconde consommée uniquement lors des requêtes.
* **Base de données :** **Google Cloud SQL (PostgreSQL)** ou **Supabase**.
* **Stockage Médias :** **Google Cloud Storage (GCS)** ou **Cloudflare R2**.

---

## 5. FEUILLE DE ROUTE EN 4 ÉTAPES POUR LE DÉPLOIEMENT LE JOUR J

Quand vous déciderez de passer en production, voici les 4 étapes simples et ordonnées :

### Étape 1 : Provisionner la Base de Données Cloud
1. Créer une instance PostgreSQL sur **Supabase** (ou Google Cloud SQL).
2. Récupérer la chaîne de connexion : `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`.
3. Déployer le schéma de la base depuis votre terminal local :
   ```bash
   cd apps/api
   npx prisma db push
   ```
   *(Toutes les tables, index, relations et modèles d'audit sont immédiatement créés en ligne).* 

### Étape 2 : Déployer l'API Backend NestJS
1. Déployer `apps/api` sur votre hébergeur (Render, Railway ou Google Cloud Run).
2. Renseigner les variables d'environnement de production d'après `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `MONEROO_SECRET_KEY`, etc.).
3. Obtenir l'URL publique de l'API : par exemple `https://api.ojarket.com`.

### Étape 3 : Déployer le Web Next.js
1. Déployer `apps/web` sur Vercel (ou Cloud Run).
2. Renseigner la variable : `NEXT_PUBLIC_API_URL=https://api.ojarket.com`.
3. Obtenir l'URL publique du site : par exemple `https://ojarket.com`.

### Étape 4 : Configurer le Mobile & Générer l'APK Final
1. Dans `apps/mobile`, configurer la variable d'environnement :
   ```env
   EXPO_PUBLIC_API_URL="https://api.ojarket.com"
   ```
2. Lancer la compilation de l'APK (via Android Studio ou `./gradlew assembleRelease`).
3. Installer le fichier `.apk` obtenu sur vos téléphones : l'application fonctionne immédiatement avec les données réelles en ligne.

---

## 6. MATRICE DES VARIABLES D'ENVIRONNEMENT DE PRODUCTION

Conformément à la **Règle 9 du projet**, toutes les variables nécessaires pour le déploiement sont documentées dans les fichiers `.env.example` du dépôt :

| Composant | Fichier Modèle | Variables Clés |
|---|---|---|
| **API Backend** | `apps/api/.env.example` | `PORT`, `DATABASE_URL`, `JWT_SECRET`, `MONEROO_SECRET_KEY`, `R2_BUCKET_NAME`, `GROQ_API_KEY` |
| **Web Frontend** | `apps/web/.env.example` | `NEXT_PUBLIC_API_URL` |
| **Mobile Expo** | `apps/mobile/.env.example` | `EXPO_PUBLIC_API_URL` |

---
*Ce document sert de référence permanente pour toute intervention future liée à la mise en ligne et à la distribution de l'application.*