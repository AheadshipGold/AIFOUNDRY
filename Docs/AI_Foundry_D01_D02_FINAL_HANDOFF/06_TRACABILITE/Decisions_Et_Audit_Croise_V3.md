# DÉCISIONS ET AUDIT CROISÉ — V3

## Sources normatives — ordre de préséance
1. `00_DECISIONS_FONDATEUR_V3.md`
2. PRD 0.8
3. Paiements/Abonnements/FinOps 1.0
4. Stack Technique 1.0
5. Architecture 0.6
6. Admin 1.2
7. Design 1.3
8. UX 1.3
9. Backlog 1.3
10. Tests 1.3
11. recherche/audits datés

## Contrôles de cohérence
- D01+D02 conservé : PASS.
- Merchant-owned payments : PASS.
- Paiements manuels/COD/retrait : PASS.
- Automatic PSP onboarding non technique : PASS comme exigence, provider ouvert.
- Moneroo = billing web SaaS orchestration : PASS.
- Play/web entitlement unifié : PASS conceptuel.
- Merchant Financial Operations : PASS dans PRD/architecture/UX/backlog/tests.
- Stack Expo/Next/Nest/Postgres : PASS.
- Docker local + Cloud production : PASS.
- Supabase = PostgreSQL managé cible, pas all-in-one : PASS.
- Better Auth/Prisma/R2/FCM/ZeptoMail/PostHog/Sentry/Pino : PASS.
- Search PostgreSQL, Typesense future : PASS.
- FR/EN + light/dark + design premium : PASS.
- Admin complet : PASS.
- références PRD/arch/design obsolètes actives : corrigées dans versions V3.

## Points ouverts déclarés
SMS provider, PSP automatique vendeur, domaine, prix, catégories pilotes, juridique/taxes, custom domains scale, validation terrain.
