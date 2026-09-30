# Lot UI 01 — Design system et galerie V3

Date : 29 septembre 2026. Premier lot uniquement, branche codex/ui-design-system-v3.

Références lues : registre fondateur V3, PRD 0.8, paiements/finops 1.0, Stack 1.0, architecture 0.6, admin 1.2, design/UX/backlog/tests 1.3, audit/corrections V3 et handoff Foundation. Le registre et les annexes V3 priment sur les passages historiques résiduels.

## Comparaison avec le dépôt

Expo 51 / RN 0.74, Next 14, Nest et Prisma existent dans le monorepo npm. Les interfaces sont des placeholders. Les couleurs initiales bleues du mobile seront remplacées par un adaptateur conservant les noms existants mais utilisant les tokens premium. Backend et Prisma restent hors du lot.

## Plan et dossiers

1. packages/design-system : tokens purs, dictionnaires FR/EN, formats monétaires, types de présentation et fixtures isolées ; aucun contrat backend ajouté.
2. apps/web/src/design-system : composants DOM accessibles, provider de préférences, commerce et finance, styles responsive ; galerie /internal/components en développement uniquement.
3. apps/mobile/src/design-system : composants natifs et galerie de développement ; aucune navigation métier du lot 2.
4. Tests UI : typage, lint, monnaie et sources financières, interactions navigateur FR/EN × clair/sombre, 360 px, état système et persistance, démarrage Expo et vérification Android selon disponibilité.
5. Handoff : inventaire, résultats réels, captures, API nécessaires et limites. Arrêt après ce lot.

## Choix

Tokens communs, rendu adapté par plateforme. Polices système sans serif pour UI et serif pour titres éditoriaux (substitutions permises DS 1.3). Confirmation prestataire : badge plein succès ; vendeur : badge contour neutre et symbole distinct. Composants financiers alimentés par props de présentation, aucun encaissement inventé. Préférences de galerie indépendantes du futur compte. Fixtures purement locales sans appel API.
