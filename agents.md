# INSTRUCTIONS MAÎTRES POUR LES AGENTS D'IA (AGENTS.MD)
## Plateforme Ojarket · Marketplace de Luxe & Merchant Commerce OS

> **STATUT DU DOCUMENT : DIRECTIVE ABSOLUE & INVIOLABLE**  
> Ce document s'impose à tout agent d'intelligence artificielle (Antigravity, Claude, Cursor, Copilot, etc.) ou développeur intervenant sur ce dépôt. Toute modification du code source doit se conformer rigoureusement aux principes édictés ci-dessous.

---

## 1. IDENTITÉ DU PROJET & ARCHITECTURE DU MONOREPO

- **Projet :** Ojarket (AI Foundry) — Marketplace d'exception, créations sur-mesure (D02) et système d'exploitation commercial marchand (*Merchant Commerce OS*) ciblant l'Afrique de l'Ouest (Cotonou, Abidjan, Bamako, Dakar) et le rayonnement international.
- **Boutique Officielle Administrateur :** **Kingston Bio**. Tous les produits phares sélectionnés sur la landing page et dans le CMS appartiennent à cette entité officielle.
- **Structure Monorepo (npm workspaces) :**
  - `apps/api` : Backend NestJS, Prisma ORM, PostgreSQL, Redis, architecture événementielle et outbox d'audit.
  - `apps/web` : Application Next.js (App Router), vitrine publique, portail sur-mesure, tableau de bord vendeur et console d'administration supervision OS.
  - `apps/mobile` : Application mobile native Expo (React Native), navigation fluide acheteur/vendeur, mode hors-ligne (*offline sync*).
  - `packages/shared` : Typages TypeScript partagés, contrats DTO, traductions i18n bilingues (FR/EN) et design tokens.

---

## 2. RIGUEUR TECHNIQUE & INTÉGRITÉ DES DONNÉES (ZÉRO DONNÉE "EN L'AIR")

1. **Persistance Réelle en Base de Données :**
   - Aucune statistique ou donnée métier ne doit être inventée en dur. Tout chiffre (ventes, avis, likes, stocks, liquidités en caisse) doit découler des modèles de données Prisma réels (`Review`, `Favorite`, `Order`, `FinOpsEntry`, `CashbookDailyClose`, etc.).
2. **Règle d'Or Amazon & Airbnb pour les Notations :**
   - **Achat Vérifié Uniquement :** Seuls les acheteurs ayant une commande payée et confirmée (`verifyPurchase`) peuvent attribuer une note (1 à 5 étoiles) et un commentaire.
   - **Zéro Note Artificielle :** Si un produit n'a pas encore reçu d'avis vérifié, sa note est strictement `rating: null` et son nombre d'avis `reviewsCount: 0`. Ne jamais afficher de fausse note (comme 4.8 ou 4.9 par défaut).
3. **Protection contre les Crashes de Typage :**
   - Toujours effectuer un contrôle de nullité strict avant toute opération numérique : vérifier systématiquement `if (prod.rating != null)` avant tout `.toFixed(1)`.
4. **Validation Obligatoire Post-Modification :**
   - Tout agent doit obligatoirement valider son code avec `npm run typecheck` sur `apps/web` et `apps/mobile`. Le build doit retourner **0 erreur**.

---

## 3. PARITÉ PARFAITE WEB & MOBILE

- **Symétrie obligatoire :** La vitrine Web (`apps/web`) et la page d'accueil Mobile (`apps/mobile`) sont le reflet exact de la même sélection marchande.
- Chaque fois qu'un composant, une liste de produits phares, une boutique de confiance ou un comportement de commande est enrichi sur l'une des plateformes, l'agent **doit impérativement mettre à jour la seconde plateforme en miroir** avec la même rigueur.

---

## 4. BANISSEMENT ABSOLU DES EMOJIS & STANDARD VECTORIEL PUR

1. **Tolérance Zéro pour les Emojis Système :**
   - Il est formellement interdit d'utiliser des emojis de police système (tels que ✨, ⚡, 👑, 📦, 🔒, 🔔, 💰, ⚠️, 📍, 🟡, 🔵, 💵, etc.). Les emojis système dégradent la crédibilité et confèrent un aspect bas de gamme / enfantin.
2. **Système Vectoriel Mobile (`apps/mobile`) :**
   - Utiliser exclusivement les icônes vectorielles officielles **Phosphor Icons** via le composant maître `<Icon name="..." size={...} color={...} />` (`apps/mobile/src/design-system/Icon.tsx`).
3. **Système Vectoriel Web (`apps/web`) :**
   - Utiliser des composants SVG vectoriels fins (traits de 1.5px à 1.75px, `strokeLinecap="round"`, `strokeLinejoin="round"`), parfaitement alignés avec les jetons de design CSS (`var(--oj-color-action)`, `var(--oj-color-accent)`).
4. **Badge Produits Nouveaux (Combinaison A + B) :**
   - Les créations récentes sans avis clients sont valorisées par l'association noble :
     - **Typographie Haute Horlogerie :** Petites capitales dorées avec espacement étendu (`letterSpacing: 0.8px`, `textTransform: uppercase` : `NOUVEAU` / `NEW ARRIVAL`).
     - **Symbole Joaillerie Diamant :** Étoile diamant 4 pointes vectorielle ultra-fine (`IconDiamondSparkle` en Web / Phosphor `sparkle` plein en Mobile).

---

## 5. STANDARD DE LUXE & PRESTIGE INVIOLABLE (DIRECTIVE UTILISATEUR ABSOLUE)

> **RÈGLE FONDAMENTALE DICTÉE PAR LE PROPRIÉTAIRE DU PROJET :**

- **Tolérance zéro pour les éléments basiques ou non finis :**  
  Tout bouton, toute carte, tout menu et toute modale doit être conçu avec une facture visuelle d'élite (matériaux nobles, micro-animations physiques sur le web et si nécessaire sur le mobile). Rien ne doit sembler générique ou hâtif.

- **Interdiction absolue des carrés vides ou placeholders :**  
  Aucun visuel, aucune icône ne doit être laissée vide ou avec un simple carré gris générique. Tout doit être illustré avec élégance, excellence, typographies travaillées et iconographie vectorielle haute précision.

- **Surpasser systématiquement la concurrence :**  
  L'application doit toujours être présentée avec une longueur d'avance technique, fonctionnelle et esthétique (standards visuels inspirés de Cartier, Rolex, Hermès, LVMH et plateformes d'art internationales). Aucun standard inférieur au prestige de premium n'est accepté.

---

## 6. PALETTE CHROMATIQUE & MATÉRIAUX NOBLES

- **Surfaces Claires (Mode Jour) :** Ivoire chaud, lin fin et pierre noble (`#F8F6F0`, `#F5F3ED`). Éviter le blanc clinique `#FFFFFF` sur les grands aplats d'arrière-plan.
- **Surfaces Sombres (Mode Nuit) :** Vert ébène impérial, ardoise profonde et nuit d'atelier (`#0A1210`, `#06241D`, `#0D1F1B`). Bannir le noir pur `#000000` agressif.
- **Couleur d'Action & Confiance :** Vert émeraude profond (`#075D49`, `#10B981`).
- **Couleur d'Accent & Joaillerie :** Or champagne satiné et bronze d'art (`#AD8455`, `#C49A45`, `#D4B483`).

---

## 7. FINOPS & PROTOCOLE DE SÉCURITÉ DENY-BY-DEFAULT

- **Politique Deny-by-Default (A06) :** Aucun mouvement d'argent ni corridor de paiement ne peut être activé sans accord contractuel partenaire vérifié.
- **Livre de Caisse Journalier (S44) :** Chaque boutique effectue une clôture de caisse à balance certifiée, répercutée dans l'outbox d'audit immuable.

---

## 8. COMMANDES LOCALES & CONTRÔLE DE QUALITÉ

Avant de soumettre toute tâche ou de répondre à l'utilisateur, l'agent doit vérifier :

```bash
# 1. Vérification TypeScript stricte sur le Web
cd apps/web && npm run typecheck

# 2. Vérification TypeScript stricte sur le Mobile
cd apps/mobile && npm run typecheck

# 3. Contrôle des serveurs de développement
# - Backend API NestJS : http://localhost:3001/api
# - Vitrine Web Next.js : http://localhost:3000
# - Bundler Metro Mobile : http://localhost:8081
```

---

## 9. GESTION STRICTE DES VARIABLES D'ENVIRONNEMENT (.ENV VS .ENV.EXAMPLE) — RÈGLE ABSOLUE

1. **Interdiction de Modifier le Fichier `.env` :**
   - L'agent a l'interdiction formelle de modifier, écraser ou altérer directement les fichiers `.env` du projet.
2. **Usage Exclusif de `.env.example` :**
   - Lorsque de nouvelles variables d'environnement, clés d'API ou configurations sont introduites, l'agent **doit impérativement et uniquement** mettre à jour les fichiers `.env.example` correspondants avec des commentaires explicatifs.
3. **Mise à Jour Manuelle par l'Utilisateur :**
   - L'utilisateur est le seul gestionnaire de ses fichiers `.env` réels et reporte lui-même ses clés privées d'après le modèle fourni dans `.env.example`.

---

*Toute déviation de ce document sera considérée comme une régression critique.*

