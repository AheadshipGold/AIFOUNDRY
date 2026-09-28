# 00 — LIRE EN PREMIER : D01 + D02 V3 IMPLEMENTATION READY

**Date : 28 septembre 2026**  
**Statut : dossier de référence final avant implémentation.**  
**Remplace comme source active :** Handoff V2 Merchant Network. V2/V1.1 restent historiques.

## Ce qui est maintenant finalisé

- vision D01+D02 conservée ;
- modèle merchant-owned ;
- marketplace/demand network conservé ;
- administration complète ;
- modèle SaaS Free/Payant/Add-ons ;
- paiements vendeurs manuels + automatiques optionnels sans custody ;
- Play Billing vs web billing Moneroo ;
- Merchant Financial Operations (caisse, ventes, encaissements, créances, rapprochement, clôture) ;
- stack technique TypeScript local-first ;
- corrections Codex et références documentaires ;
- backlog/tests d'implémentation.

## Ordre de lecture obligatoire pour un agent

1. `00_DECISIONS_FONDATEUR_V3.md`
2. `02_PRD/PRD_Construction_V0_8_Implementation_Ready.md`
3. `02_PRD/Paiements_Abonnements_Operations_Financieres_V1_0.md`
4. `03_ARCHITECTURE/Stack_Technique_Final_V1_0.md`
5. `03_ARCHITECTURE/Architecture_Construction_V0_6_Implementation_Ready.md`
6. `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_2_Implementation_Ready.md`
7. `04_UX_UI/Design_System_Premium_V1_3.md`
8. `04_UX_UI/UX_UI_Specification_Finale_V1_3.md`
9. `05_CONSTRUCTION/Backlog_Final_V1_3.md`
10. `05_CONSTRUCTION/Plan_Tests_Et_Portes_V1_3.md`
11. `01_RECHERCHE/Registre_Corrections_Finales_V3.md`
12. `06_TRACABILITE/Decisions_Et_Audit_Croise_V3.md`

## Règles absolues

- Ne pas revenir à Flutter/Dart dans le code actif ; Expo/React Native/TypeScript est la décision V3.
- Ne pas reconstruire custody, split-payout ou escrow par habitude.
- Ne pas supprimer D02 ni réduire le produit à inventaire/catalogue.
- Ne pas traiter Moneroo comme PSP vendeur ; il orchestre notre checkout SaaS web.
- Ne pas demander API keys au petit commerçant comme parcours standard.
- Ne pas confondre vente, encaissement et stock.
- Ne jamais présenter seller-confirmed comme provider-confirmed.
- Ne pas considérer un fichier documenté comme implémenté/testé.
- Ne pas utiliser les fichiers historiques comme source active si V3 existe.

## Stack active courte

Expo/React Native + TypeScript ; Next.js ; NestJS ; PostgreSQL ; Prisma ; Better Auth ; Docker Compose ; Caddy ; MinIO local/R2 prod ; Cloudflare Images ; Expo SQLite ; pg-boss ; ZeptoMail ; FCM ; Meta WhatsApp Cloud API ; Vercel AI SDK (Gemini/Claude/OpenAI) ; PostHog ; Sentry ; Pino ; GitHub Actions ; Vercel ; Cloud Run ; Supabase Cloud PostgreSQL cible initiale.

## Ce qui reste ouvert sans bloquer le démarrage local

SMS/OTP provider ; premier PSP automatique vendeur ; domaine/nom ; prix exacts ; catégories pilotes ; CGU/taxes ; custom-domain architecture à grande échelle ; validation terrain.
