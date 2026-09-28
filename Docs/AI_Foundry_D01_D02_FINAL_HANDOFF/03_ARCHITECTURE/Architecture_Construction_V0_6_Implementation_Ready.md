# ARCHITECTURE TECHNIQUE DE RÉFÉRENCE — D01 + D02 V3

**Version :** 0.6 — Implementation Ready  
**Date :** 28 septembre 2026  
**Normatif avec :** `00_DECISIONS_FONDATEUR_V3.md`, `Stack_Technique_Final_V1_0.md`, PRD 0.8 et spécification paiements/finops 1.0.  
**Statut :** architecture prête à être implémentée ; aucun déploiement, PSP, achat réel ou validation terrain n'est déclaré exécuté par la seule documentation.

## 0. Architecture en une phrase

Un **APK Android Expo/React Native/TypeScript**, un **web Next.js**, un **backend NestJS**, PostgreSQL transactionnel, Better Auth, stockage S3-compatible, jobs PostgreSQL, search PostgreSQL, services externes derrière des interfaces, et un modèle financier merchant-owned où la plateforme orchestre sans détenir les fonds des ventes.

## 1. Composants

```text
Android Expo ───────┐
Next.js Web ────────┼──HTTPS──> NestJS API ───> PostgreSQL
Next.js Admin ──────┘                 │             │
                                      │             ├─ pg-boss jobs
                                      │             └─ RLS/constraints/locks
                                      ├─ Better Auth
                                      ├─ R2 / Cloudflare Images
                                      ├─ EmailProvider -> ZeptoMail
                                      ├─ PushProvider -> FCM
                                      ├─ WhatsAppProvider -> Meta Cloud API
                                      ├─ AIProvider -> Gemini/Claude/OpenAI
                                      ├─ MerchantPaymentProvider adapters
                                      └─ SaaSBilling -> Play / Moneroo web
```

## 2. Environnement local

`docker compose` fournit PostgreSQL, MinIO, Mailpit, Caddy et services auxiliaires. Next.js/NestJS/Expo peuvent tourner directement sur la machine pour hot reload. Les migrations Prisma/SQL sont la source de vérité ; aucune base locale bricolée manuellement.

## 3. Production cible

- Web/admin : Vercel.
- API/worker : Docker images NestJS sur Google Cloud Run.
- PostgreSQL : Supabase Cloud initialement ; aucun coupling Supabase Auth/Storage.
- Fichiers : Cloudflare R2.
- Images/CDN/DNS : Cloudflare.
- GitHub Actions : CI/CD.

Tout fournisseur remplaçable doit être derrière contrat d'interface + config, pas disséminé dans le code métier.

## 4. Modules backend NestJS

```text
auth/
users/
markets/
shops/
memberships/
catalog/
inventory/
search/
requests/
proposals/
orders/
fulfillment/
payments/
merchant-finance/
saas-billing/
customers/
suppliers/
digital/
notifications/
whatsapp/
ai/
analytics/
admin/
audit/
integrations/
```

## 5. Modèle de données essentiel

### Identité/multi-tenant
`users`, `accounts`, `sessions`, `shops`, `shop_memberships`, `markets`, `admin_memberships`.

### Commerce
`products`, `offers`, `offer_variants`, `offer_versions`, `inventory_balances`, `stock_movements`, `reservations`, `purchase_requests`, `seller_proposals`, `orders`, `order_lines`, `fulfillment_obligations`.

### Paiements
`merchant_payment_methods`, `shop_payment_connections`, `payment_intents`, `payment_attempts`, `provider_events`, `refund_cases`.

### Merchant Financial Operations
`financial_events`, `cashbook_entries`, `receivables`, `day_closures`, `reconciliation_runs`, `reconciliation_items`.

### SaaS
`plans`, `plan_features`, `subscriptions`, `subscription_events`, `usage_counters`, `add_ons`.

### Files/numérique
`digital_assets`, `digital_entitlements`, `file_objects`.

### Platform
`feature_flags`, `provider_registry`, `integration_connections`, `audit_events`, `outbox_events`, `incidents`.

## 6. Invariants PostgreSQL

- une commande opérationnelle a un vendeur contractuel ;
- `reserved <= on_hand` quand stock suivi ;
- un événement provider externe est dédupliqué ;
- les montants utilisent unités mineures entières + devise ;
- prix/conditions acceptés sont versionnés ;
- `sale_amount`, `received_amount`, `outstanding_amount` ne sont pas fusionnés ;
- les écritures financières sont append-only/corrigées par contre-écriture ;
- le client ne peut jamais écrire `provider_confirmed` ;
- secrets privés non stockés en clair dans les tables applicatives ;
- aucune lecture inter-boutiques non autorisée.

## 7. Transactions ACID et verrouillage de stock

La réservation critique utilise transaction PostgreSQL + verrou de ligne (`SELECT ... FOR UPDATE`) ou opération atomique équivalente. Aucun appel réseau PSP ne maintient un verrou DB ouvert. Idempotency-Key obligatoire sur mutations critiques.

## 8. RLS et autorisation

Better Auth identifie l'utilisateur ; NestJS vérifie rôle/boutique/permission. RLS PostgreSQL protège en profondeur les tables sensibles. Les opérations privilégiées passent par le backend ; aucun service-role dans Expo/Next client.

## 9. API HTTPS

REST versionnée `/v1` au départ. Montants, rôles, états et stock recalculés serveur. Erreurs structurées avec `code`, `request_id`, `retryable`. OpenAPI généré pour éviter des contrats divergents entre agents.

## 10. Offline mobile

Expo SQLite stocke cache et drafts. Les opérations offline ont `LOCAL_PENDING_SYNC`. Synchronisation idempotente ; conflit stock explicite ; paiement provider et vérité globale exigent réseau.

## 11. Fichiers

Local MinIO et production R2 parlent S3. Buckets/namespaces publics et privés distincts. Les produits numériques utilisent URLs signées temporaires après vérification entitlement. Aucun document KYC/support privé n'a d'URL publique durable.

## 12. Images/CDN

Original dans R2 ; variantes optimisées via Cloudflare Images. Tailles adaptées liste/détail/zoom ; lazy loading, AVIF/WebP selon support, cache edge.

## 13. Search

PostgreSQL FTS + `pg_trgm` + GIN. SearchProvider encapsule l'implémentation. Typesense est une future option self-hostable si p95/charge/pertinence justifient un moteur externe.

## 14. Paiements marchands

### Manuel/direct
Instructions de la boutique ; client déclare ; vendeur confirme ; source visible. COD/retrait supportés.

### Automatique
Adapter provider par boutique. Le parcours grand public privilégie connected account/partner onboarding ; saisie API keys = mode avancé. Webhook signé + vérification API + idempotence ; règlement au vendeur selon contrat PSP.

### Moneroo
N'est pas modélisé comme PSP vendeur par défaut. Il est retenu pour **notre web billing SaaS** en tant que couche d'orchestration vers les gateways/méthodes de notre propre compte.

## 15. Merchant Financial Operations

Chaque événement de vente/paiement/refund alimente le journal. Projections calculées : ventes, encaissé, à recevoir, remboursements, ventilation par moyen, collaborateur, produit, canal. Clôture de journée et rapprochement ne modifient pas rétroactivement l'histoire ; les corrections sont auditables.

## 16. SaaS billing

Play Billing et Web Moneroo produisent le même `subscription entitlement`. Un plan actif est lu depuis backend ; quotas/add-ons sont server-side. Aucun CTA externe interdit dans l'APK.

## 17. Queues/workers

`pg-boss` stocke les jobs dans PostgreSQL. Workers NestJS exécutent emails, push, WhatsApp, webhooks sortants, expirations, imports, rapprochement, exports, processing. Retry exponentiel, dead-letter et idempotence obligatoires.

## 18. Notifications

Email : ZeptoMail ; push : FCM ; WhatsApp : Meta Cloud API derrière feature flag. Tous via interfaces (`EmailProvider`, `PushProvider`, `MessagingProvider`). Un échec de notification ne rollback pas la commande déjà validée.

## 19. IA

Vercel AI SDK + provider registry admin. Tâches autorisées : parse besoin, brouillon offre, résumé, suggestions. Jamais paiement/stock/acceptation autonome. Clés serveur, quotas par boutique/tâche, logs minimisés.

## 20. Analytics/observabilité

PostHog : événements produit. Sentry : erreurs/crashes/performance. Pino : logs JSON corrélés `request_id`. Ne jamais envoyer secrets, pièces KYC ou corps de paiement complet dans analytics/logs.

## 21. CI/CD

GitHub Actions : lint, typecheck, tests, Prisma migration check, SQL/RLS/concurrency tests, web build, Android build, secret scanning, staging. Production après portes et approbation.

## 22. Sécurité

TLS, CSP web, rate limiting, MFA admin, audit, least privilege, rotation secrets, webhook signatures, anti-replay, CSRF selon canal, validation upload, antivirus/scan si requis, backups et restore drills.

## 23. POC techniques avant activation réelle

1. Expo Android FR/EN/light/dark + deep link.
2. Better Auth email/Google/phone OTP dans Expo+Next.
3. Isolation shop A/B NestJS + RLS.
4. Double réservation du dernier SKU : une seule réussite.
5. Offline draft/sale sync conflict.
6. MinIO local -> R2 prod contract compatibility.
7. Manual payment states et seller confirmation.
8. Provider sandbox webhook idempotent pour un marchand test.
9. SaaS web Moneroo sandbox -> entitlement.
10. Play Billing sandbox -> même entitlement.
11. pg-boss retry/dead-letter.
12. Daily close/reconciliation exact sur dataset de test.
13. Next.js social preview + custom domain POC.
14. Android faible RAM / réseau lent.

## 24. Ouvert avant production

SMS provider, premier PSP marchand automatique, tarifs, domaine, custom-domain provider at scale, contrats/CGU/taxes, catégories pilotes, résultats terrain.
