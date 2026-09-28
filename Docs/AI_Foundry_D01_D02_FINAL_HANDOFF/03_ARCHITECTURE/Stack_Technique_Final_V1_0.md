# STACK TECHNIQUE FINAL — D01 + D02 V3

**Statut :** décision de construction.  
**Principe :** local-first, portable, TypeScript-first, PostgreSQL comme source de vérité, dépendances externes limitées et remplaçables.

| Domaine | Décision | Local | Production cible |
|---|---|---|---|
| Mobile | Expo + React Native + TypeScript | Expo dev build | Google Play APK/AAB |
| Web public/merchant/admin | Next.js + TypeScript | Next dev server | Vercel |
| API métier | NestJS + Node.js + TypeScript | process local ou conteneur | Docker image sur Google Cloud Run |
| DB | PostgreSQL | Docker | Supabase Cloud PostgreSQL initialement, remplaçable |
| ORM | Prisma stable | même schéma | même schéma |
| Auth | Better Auth | PostgreSQL local | PostgreSQL prod |
| Auth initiale | email/password, Google, téléphone OTP | provider test | provider SMS à sélectionner |
| Offline mobile | Expo SQLite | appareil | appareil |
| Object storage | S3-compatible | MinIO | Cloudflare R2 |
| Image delivery | abstraction image | local/raw | Cloudflare Images/CDN |
| Search | PostgreSQL FTS + pg_trgm + GIN | PostgreSQL | PostgreSQL ; Typesense seulement si mesures |
| Background jobs | pg-boss | PostgreSQL local | PostgreSQL prod + worker NestJS |
| Email | interface EmailProvider | Mailpit | ZeptoMail |
| Push | FCM | test device | FCM |
| WhatsApp | Meta WhatsApp Cloud API | disabled/mock | feature flag |
| IA | Vercel AI SDK | mock/test | Gemini/Claude/OpenAI configurables admin |
| Analytics | PostHog | dev disabled/isolated | PostHog |
| Errors | Sentry | dev env | Sentry |
| Backend logs | Pino JSON | console | runtime logs + Sentry |
| DNS/CDN | Cloudflare | Caddy local | Cloudflare |
| Reverse proxy local | Caddy | oui | non requis par défaut |
| Repo | GitHub | Git | GitHub |
| CI/CD | GitHub Actions | n/a | tests/build/deploy |
| Secrets | `.env.local` | local | secrets de plateforme/OIDC |

## 1. Docker et portabilité

Docker n'est pas la base de données ni le cloud : il emballe un service dans une image reproductible. `docker compose` orchestre les services locaux. La même image NestJS peut ensuite être exécutée par Cloud Run ou un autre hébergeur compatible container sans réécrire l'application.

## 2. Local-first

Services suggérés dans `docker-compose.yml` :
- PostgreSQL ;
- MinIO ;
- Mailpit ;
- Caddy ;
- éventuellement API/worker pour tests d'intégration.

Expo, Next.js et NestJS peuvent tourner hors conteneur en développement pour hot reload, tout en parlant aux services Docker.

## 3. Caddy local

Caddy donne des URLs locales propres et HTTPS pour router vers Next.js/NestJS/admin. Les tests nécessitant un certificat public/App Links/OAuth réels utilisent staging ou tunnel.

## 4. Supabase rôle limité

Supabase n'est plus « tout le backend ». Il est la cible initiale de **PostgreSQL managé** en production. Better Auth, R2, NestJS et Next.js restent indépendants. Un déplacement futur vers Neon/RDS/autre PostgreSQL ne doit pas casser les contrats métier.

## 5. Prisma + SQL spécialisé

Prisma : modèles, CRUD, migrations, transactions ordinaires.  
SQL PostgreSQL explicite : `FOR UPDATE`, RLS, `pg_trgm`, GIN, contraintes, fonctions critiques.  
Ne pas contourner les invariants transactionnels au nom de l'ORM.

## 6. RLS

Avec Better Auth/NestJS, l'autorisation principale vit côté backend. RLS protège en profondeur les données multi-tenant sensibles. Le backend fixe le contexte utilisateur/boutique de transaction ; DENY par défaut.

## 7. Queues/workers

`pg-boss` évite Redis au lancement. Jobs : email, push, WhatsApp, rapprochement PSP, expiration réservation, import/export, thumbnails, analytics, retries webhook.

## 8. Search

Démarrage : PostgreSQL FTS + `pg_trgm` + GIN. Mesurer p95, CPU, pertinence, autocomplete/facettes. Typesense est le premier moteur externe envisagé seulement si un besoin mesuré apparaît. Algolia n'est pas requis.

## 9. CDN/images

R2 garde l'original ; Cloudflare Images transforme et sert des variantes adaptées (thumbnail/card/detail, formats modernes). Cela réduit le poids réseau pour Android et web.

## 10. CI/CD

GitHub Actions exécute au minimum :
- ESLint ;
- TypeScript typecheck ;
- tests unitaires/intégration ;
- tests Prisma migrations ;
- tests SQL/RLS/concurrence ;
- localisation FR/EN ;
- build Next.js ;
- build Android Expo/EAS ;
- scans de secrets/dépendances ;
- déploiement staging contrôlé.

## 11. Environnements

`local` / `staging` / `production` séparés : DB, buckets, secrets, URLs, app IDs, webhooks, analytics et données.
