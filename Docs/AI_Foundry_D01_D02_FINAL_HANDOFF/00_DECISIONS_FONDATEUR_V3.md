# REGISTRE DES DÉCISIONS FONDATEUR — D01 + D02 V3 IMPLEMENTATION READY

**Version :** 3.0 — 28 septembre 2026  
**Statut :** source normative la plus haute pour le build. En cas de contradiction avec V2/V1.1, ce registre prime.  
**But :** figer les décisions produit, techniques, paiement et exploitation discutées avant remise à l'agent d'implémentation.

## A. Produit et modèle commercial

**D-V3-001 — Vision conservée.** D01+D02 reste une **marketplace intelligente et dynamique + Merchant Commerce OS**. Elle n'est pas réduite à un inventaire, un catalogue ni un clone de Take App.

**D-V3-002 — Réseau de boutiques autonomes.** Chaque boutique garde la maîtrise de son catalogue, stock, clients, moyens de paiement et fulfillment ; la plateforme relie les boutiques par découverte, recherche, demandes, matching, propositions et comparaison.

**D-V3-003 — D02 reste central.** Recherche globale, découverte, besoin non satisfait, matching, propositions multiples et comparaison sont des capacités différenciantes obligatoires.

**D-V3-004 — Marchés nationaux.** Une seule plateforme technique ; chaque marché national possède sa portée de découverte, devise, catégories, fournisseurs de paiement, règles et intégrations. Le commerce transfrontalier n'est pas activé par défaut.

**D-V3-005 — Produits physiques et numériques.** Les deux restent supportés avec des obligations, paiements et règles de livraison distincts.

**D-V3-006 — Modèle économique SaaS.** Hypothèse principale : **Free/Basic + plan(s) payant(s) + add-ons**, sans commission obligatoire sur les ventes. Les prix locaux restent à valider ; l'architecture doit permettre quotas, fonctionnalités et add-ons pilotés côté serveur.

## B. Paiements des ventes marchandes

**D-V3-007 — Merchant-owned payments.** Pour une vente de produit, notre société ne reçoit, ne conserve ni ne redistribue les fonds par défaut. Le vendeur reste bénéficiaire de son paiement.

**D-V3-008 — Une commande opérationnelle par vendeur.** Un panier multi-vendeur peut être regroupé visuellement, mais persiste en commandes/paiements séparés par boutique ; aucun split-payout improvisé.

**D-V3-009 — Méthodes manuelles de premier niveau.** Une boutique peut accepter Mobile Money direct (ex. MTN MoMo, Moov Money, Celtiis Cash selon marché), virement, cash on delivery et paiement au retrait. Elles ne sont pas traitées comme inférieures ni cachées.

**D-V3-010 — Confirmation manuelle honnête.** `déclaré_par_acheteur`, `confirmé_par_vendeur`, `confirmé_par_PSP` et `paiement_à_la_remise` sont des états/sources distincts. Une capture ou un clic client ne devient jamais une confirmation PSP.

**D-V3-011 — Paiement automatique optionnel.** Un vendeur peut connecter un PSP approuvé. Le parcours grand public ne doit pas exiger de comprendre API keys/webhooks ; privilégier onboarding partenaire/OAuth/connected merchant. La saisie manuelle de clés reste une option avancée uniquement si nécessaire.

**D-V3-012 — PSP vendeur non verrouillé.** FedaPay/CinetPay/PawaPay/autres restent des candidats ; le premier PSP automatique sera choisi selon onboarding marchand simple, règlement direct au vendeur, couverture pays, KYC, limites, Mobile Money/cartes, remboursements, webhooks et contrat partenaire. Aucun PSP n'est déclaré production-ready par ce document.

**D-V3-013 — Frais PSP.** Le vendeur peut supporter ou répercuter des frais seulement si le PSP, le contrat et les règles du marché l'autorisent.

**D-V3-014 — Remboursements.** Un remboursement automatique passe par la connexion du marchand au PSP ; un remboursement manuel reste déclaré/confirmé avec source explicite. Notre société ne rembourse pas une vente marchande depuis ses propres fonds.

## C. Abonnement SaaS de nos commerçants

**D-V3-015 — Google Play Billing.** Un achat de plan/fonctionnalité SaaS initié dans l'APK distribué via Google Play utilise Play Billing lorsqu'il est requis par les règles applicables.

**D-V3-016 — Web billing.** Le site web peut vendre les plans par Mobile Money/carte et activer le même entitlement du compte. Aucun CTA in-app de contournement n'est prévu dans les marchés où il n'est pas autorisé.

**D-V3-017 — Moneroo pour notre propre checkout web.** Moneroo est traité comme **couche d'orchestration/agrégation**, pas comme PSP ou compte marchand. Notre entreprise l'intègre une fois et peut y connecter des passerelles/méthodes compatibles pour encaisser ses propres abonnements SaaS web.

**D-V3-018 — Entitlement multi-source.** Le plan actif est une vérité backend indépendante de sa source (`GOOGLE_PLAY`, `WEB_MONEROO`, `PROMO`, `ADMIN_GRANTED`, etc.).

## D. Merchant Financial Operations — capacité centrale

**D-V3-019 — Vente, paiement, stock séparés.** Chaque opération commerciale produit des objets/événements distincts : commande/vente, encaissement, mouvement de stock.

**D-V3-020 — Le vendeur ne fait plus ses additions de fin de journée.** Le produit doit fournir caisse/journal, ventes, encaissements, montants en attente, ventilation par moyen de paiement, remboursements, créances/solde restant, stock et rapports.

**D-V3-021 — Vente ≠ encaissement.** Une commande de 500 000 XOF avec 200 000 XOF reçus affiche 500 000 vendus, 200 000 encaissés et 300 000 à recevoir.

**D-V3-022 — Clôture de journée.** Le commerçant peut revoir ventes/encaissements/écarts et clôturer sa journée sans recalcul manuel. Les écarts déclenchent une liste de transactions à vérifier.

**D-V3-023 — Rapprochement.** Les montants attendus, confirmés et en attente sont rapprochés par canal/moyen de paiement ; PSP connecté = rapprochement automatisable, manuel = confirmation vendeur.

**D-V3-024 — Journal immuable.** Les corrections financières se font par événements/contre-écritures ; pas d'UPDATE silencieux qui efface l'histoire.

**D-V3-025 — Pas de comptabilité générale complète au premier lot.** Le scope initial est gestion commerciale, caisse, ventes, paiements, créances, remboursements, stock, marge si coût connu, rapports et exports. Comptabilité fiscale complète = extension.

## E. Stack technique finalisée

**D-V3-026 — Mobile : Expo + React Native + TypeScript.** Le choix Flutter/Dart de V2 est remplacé dans la source active. L'objectif reste un vrai APK/AAB Android, pas une webview.

**D-V3-027 — Web/Admin : Next.js + TypeScript.** Site public, boutiques web, checkout web, portail web vendeur et console admin partagent l'écosystème Next.js selon séparation de routes/apps.

**D-V3-028 — Backend : NestJS + Node.js + TypeScript.** Backend métier central modulaire ; les Edge Functions Supabase ne sont plus le cœur architectural.

**D-V3-029 — PostgreSQL validé.** Base transactionnelle relationnelle, ACID, contraintes SQL, verrous, index et RLS défense en profondeur.

**D-V3-030 — Local d'abord avec Docker Compose.** PostgreSQL, MinIO, Mailpit, Caddy et services auxiliaires tournent localement de façon reproductible. Expo/Next.js/NestJS peuvent tourner directement sur la machine pour hot reload.

**D-V3-031 — Caddy local.** Reverse proxy/HTTPS local pour des URLs propres ; les tests nécessitant un domaine public réel passent par staging/tunnel.

**D-V3-032 — Production portable.** Next.js cible Vercel ; NestJS est containerisé Docker et cible Google Cloud Run ; PostgreSQL cible initialement Supabase Cloud comme PostgreSQL managé remplaçable ; fichiers Cloudflare R2 ; images Cloudflare Images ; DNS Cloudflare.

**D-V3-033 — ORM : Prisma stable.** Prisma pour CRUD, modèles, migrations et transactions ordinaires ; SQL explicite/fonctions PostgreSQL pour verrous de stock, RLS, pg_trgm, GIN et opérations spécialisées.

**D-V3-034 — Auth : Better Auth.** Méthodes initiales : email/password, Google, téléphone+OTP. WhatsApp n'est pas un mécanisme de login requis. SMS provider reste à sélectionner sur coût/délivrabilité au Bénin.

**D-V3-035 — Offline : Expo SQLite.** Brouillons/cache/opérations locales ; aucune donnée offline non synchronisée ne devient stock global garanti.

**D-V3-036 — Stockage.** Local : MinIO S3-compatible. Production : Cloudflare R2. Fichiers privés par URLs signées temporaires ; images optimisées/distribuées via Cloudflare Images/CDN.

**D-V3-037 — Search.** Lancement : PostgreSQL Full-Text Search + `pg_trgm` + GIN. Pas d'Algolia. Typesense seulement si mesures réelles le justifient, derrière une abstraction `SearchProvider`.

**D-V3-038 — Jobs.** `pg-boss` sur PostgreSQL pour queues, retries, scheduling et jobs ; pas de Redis obligatoire au départ.

**D-V3-039 — Email.** Local : Mailpit. Production transactionnelle : ZeptoMail derrière une interface fournisseur.

**D-V3-040 — Push.** Firebase Cloud Messaging (FCM) pour notifications transactionnelles au départ.

**D-V3-041 — WhatsApp.** Meta WhatsApp Cloud API pour l'intégration officielle future/activable ; le commerce principal reste utilisable sans WhatsApp API.

**D-V3-042 — IA multi-provider.** Vercel AI SDK comme abstraction ; Gemini, Claude et OpenAI configurables depuis l'admin par tâche/modèle, avec fallback et quotas. L'IA ne confirme jamais stock, paiement ou engagement à la place du serveur/utilisateur.

**D-V3-043 — Analytics/erreurs/logs.** PostHog pour analytics produit ; Sentry pour erreurs/crash multi-surface ; Pino pour logs JSON backend.

**D-V3-044 — Git et CI/CD.** GitHub + GitHub Actions ; lint, typecheck, tests, migrations, sécurité, localisation, build Android et déploiements contrôlés.

**D-V3-045 — Secrets.** Local `.env.local` non committé ; production dans les secrets des plateformes (Vercel, Google Cloud Secret Manager/runtime, Cloudflare, GitHub OIDC/secrets). Jamais de clé PSP/IA/service dans le client.

## F. Design, qualité et corrections historiques

**D-V3-046 — Design premium maintenu.** Palette/identité premium validées restent ; optimisation réseau, Android modestes, 360dp, FR/EN, light/dark et actions métier priment sur décoration.

**D-V3-047 — Références documentaires corrigées.** Les anciennes mentions PRD 0.5/0.6, architecture 0.3/0.4, Design System 1.1 et Flutter dans les documents actifs doivent disparaître ou être explicitement archivées.

**D-V3-048 — Codex.** Les remarques utiles sur cohérence documentaire, validation terrain, ordre d'implémentation, Android modestes et distinction vision/build sont intégrées. Les propositions réduisant le produit à stock/catalogue ne sont pas adoptées.

## G. Décisions toujours ouvertes — ne pas inventer

- nom commercial final et domaine ;
- fournisseur SMS/OTP ;
- premier PSP automatique vendeur et contrat/onboarding partenaire ;
- tarifs locaux exacts des plans/add-ons ;
- catégories de lancement prioritaires ;
- politique juridique/CGU/taxes par marché ;
- architecture exacte des custom domains à grande échelle ;
- seuil mesuré déclenchant Typesense ;
- validation terrain et résultats réels.
