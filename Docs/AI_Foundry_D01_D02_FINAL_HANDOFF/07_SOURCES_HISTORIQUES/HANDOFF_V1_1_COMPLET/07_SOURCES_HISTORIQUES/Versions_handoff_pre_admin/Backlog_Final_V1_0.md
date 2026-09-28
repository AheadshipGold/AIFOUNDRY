# BACKLOG FINAL DE CONSTRUCTION — D01 + D02

**Version :** 1.0 — 2026-09-25  
**Mode d’emploi :** indépendant de Cursor et de tout IDE ; suivre les tickets par dépendance, preuves et statut. Flutter + PostgreSQL/Supabase restent une proposition d’ingénierie à éprouver ; aucun POC est déclaré PASS.

## 0. Statuts et obligations

Statuts `TODO → IN_PROGRESS → REVIEW → TESTED → DONE` ; `BLOCKED` = obstacle documenté. **Tous les tickets ci-dessous sont TODO** sauf dossiers documentaires déjà livrés, qui ne sont pas du code. Un test automatisé exécutable et un artefact de preuve sont nécessaires pour fermer un ticket technique. La démonstration HTML est une simulation, pas un APK.

## 1. Séquence critique de démarrage — exécuter sans attendre de nouvelles validations de maquettes

| Ordre | Travail | Résultat de sortie | Dépendances |
|---|---|---|---|
| 1 | Fondation APK FR/EN, thèmes, pipeline build | APK installé et navigable sur téléphone | choix IDE libre, Android SDK |
| 2 | Auth, tenants boutiques, RLS, migrations | session et isolation boutique prouvées | base staging |
| 3 | Produit/offre/stock, pages web HTTPS | S07/S40 liés au même offer_id | HTTPS test et seed fictive |
| 4 | Réservation atomique et mouvements | une seule réservation dernier SKU | transactions Postgres |
| 5 | Demande/proposition/accord | recherche vide→commande versionnée | rôles/offres |
| 6 | Commande/paiement fictif staging/exécution | états distincts, zéro double ledger | offre/réservation |
| 7 | Paiement réel par route + numérique | seulement après preuves PSP/Play | tiers/juridique |
| 8 | QA intégrée et pilote terrain | rapports T01…T12 et tests d’usage | lots précédents |

## 2. Tickets initialement définis (conservés)

> Les tickets ci-dessous sont conservés sans prétendre qu’ils sont exécutés. Le ticket P0-01 est reformulé « environnement choisi par le fondateur » et non Cursor.

# BASE HISTORIQUE V0.1 — TICKETS À REPRENDRE

**Archive fonctionnelle des tickets : état TODO**  
**Sources :** PRD v0.4, architecture v0.2 (T01–T12), UX blueprint v0.1, design system premium v1.0.  
**Non spécifique à un IDE :** aucune dépendance Cursor. Flutter + PostgreSQL/Supabase = proposition technique documentée, à éprouver par POC. Chaque tâche possède un résultat testable. Les POC et tests terrain ne sont **pas** exécutés au seul motif qu'ils figurent dans ce backlog.

## Règle de pilotage

Statuts : `TODO → IN PROGRESS → REVIEW → TESTED → DONE`, ou `BLOCKED` motivé. Aucune tâche critique ne peut passer `DONE` sans preuve de test associée. Ne pas confondre composants démonstratifs du HTML avec code Android prêt à déployer.

## Lot P0 — Preuves en parallèle de l'UX (n'affectent aucun argent réel)

| ID | Ticket | Dépendance | Preuve de sortie |
|---|---|---|---|
| P0-01 | Choisir IDE librement et générer APK Flutter test FR/EN | environnement Android | APK installé sur un téléphone, bascule FR/EN |
| P0-02 | Implémenter ThemeMode système/clair/sombre + persistance | P0-01 | apparence OS et surclassement manuel sur APK |
| P0-03 | Configurer domaine HTTPS de test et App Links vérifiés | P0-01 + domaine | même lien avec APK présent/absent, `assetlinks.json` vérifié |
| P0-04 | Base de test : boutiques A/B, SKU et rôles + RLS | PostgreSQL | A ne peut lire/écrire les données privées de B |
| P0-05 | RPC réserver dernier SKU + idempotence | P0-04 | deux appels concurrentiels = un seul succès |
| P0-06 | Sortie IA structurée FR/EN avec entrée manuelle fallback | P0-01 + API test | zéro budget/stock inventé ; panne non bloquante |

## Lot L0 — Fondation

| ID | Ticket | PRD/Screen | Critère de fin |
|---|---|---|---|
| L0-01 | Dépôt, environnements local/test, CI, secrets | NFR | installation reproductible ; secrets hors APK |
| L0-02 | Design tokens Flutter light/dark & typographie | Design system / S01…S42 | rendu cohérent des surfaces/états, tailles texte étendues |
| L0-03 | Catalogue composants boutons/champs/cartes/badges | FR-01…70 | 4 états communs, FR/EN, clair/sombre |
| L0-04 | Navigation acheteur/vendeur même compte | FR-01 / S14/S20 | pas de mélange données ni session |
| L0-05 | Auth, profil, boutique et contrôles de rôle | FR-01…05 / S21 | aucun privilège indu entre boutiques |
| L0-06 | Journal audit, erreurs typées et outbox événements | Arch v0.2 | crash/retry sans mutation contradictoire |

## Lot L1 — Offres et découverte

| ID | Ticket | PRD/Screen | Critère de fin |
|---|---|---|---|
| L1-01 | Modèle produit/offre/SKU/version/stock | FR-06…16 / S22–24 | variation prix n'altère pas commande passée |
| L1-02 | CRUD catalogue et média, politique publication | FR-06…11 / S23 | image absente et produits incomplets traités |
| L1-03 | Fiche offre premium FR/EN light/dark | FR-06…11 / S07 | état courant, variante, coût connu et conditions |
| L1-04 | Découverte, recherche, filtres et état vide | FR-18…20 / S01/S02 | recherche infructueuse ouvre demande |
| L1-05 | Web fiche partageable et lien cible | FR-48…51/70 / S40 | pas redirection générique ni fuite de données |

## Lot L2 — Besoins → propositions → accord

| ID | Ticket | PRD/Screen | Critère de fin |
|---|---|---|---|
| L2-01 | Formulaire besoin FR/EN avec IA facultative | FR-20…24 / S03 | contrôle final par acheteur et fallback |
| L2-02 | Publication, visibilité, retrait, expiration besoin | FR-20…23 / S04/S05 | demande retirée ne reçoit plus de réponse active |
| L2-03 | Correspondance vendeurs et consentement contact | FR-22…24 / S26 | données privées non divulguées |
| L2-04 | Proposition vendeur avec coût/validité/stock | FR-23…28 / S27 | état sur commande explicite |
| L2-05 | Comparaison et acceptation concurrente | FR-19/23/27 / S06/S09 | un achat non voulu jamais accepté |

## Lot L3 — Opérations commerçant

| ID | Ticket | PRD/Screen | Critère de fin |
|---|---|---|---|
| L3-01 | Tableau vendeur « À faire » et commandes | FR-56…58 / S20/S28 | tâches ont destination réelle ; KPI non inventés |
| L3-02 | Stock, réservations, annulations et expiration | FR-12…16 / S24 | stock non négatif et audit |
| L3-03 | Vente extérieure et conflit sync | FR-16/36 / S25 | jamais attribuée au PSP de la plateforme |
| L3-04 | Fournisseurs et commande achat séparée | FR-17/28 / S30 | prix B2B privé ; échec fournisseur répercuté |
| L3-05 | Marge, achats récurrents, budgets et clients | FR-61…65 / S15/S32/S33 | coûts incomplets signalés ; consentement |

## Lot L4 — Commandes / paiement / exécution

| ID | Ticket | PRD/Screen | Critère de fin |
|---|---|---|---|
| L4-01 | Récapitulatif, version conditions et acceptation | FR-29/30 / S09 | accord historique non réécrit |
| L4-02 | Order/service obligations séparées | FR-31/38/42 / S11 | payé ≠ livré |
| L4-03 | Routeur de moyens de paiement et fake PSP staging | FR-32…37 / S10 | corridor interdit = aucun checkout, fake signalé |
| L4-04 | Adaptateur PSP sandbox autorisé et webhook vérifié | FR-33…35 / S10 | double événement = une seule écriture |
| L4-05 | Classification achat numérique et Play sandbox si applicable | FR-43 / S10 | porte conformité du cas exact documentée |
| L4-06 | Produit numérique, droits et accès renouvelable | FR-42…47 / S12/S31 | lien expiré ne retire pas droit |
| L4-07 | Livraison/remise et incident acheteur/vendeur | FR-38…41/52…54 / S11/S13/S29 | commande payée non livrée reste suivie |

## Lot L5 — Qualité et mise en service

| ID | Ticket | Preuve |
|---|---|---|
| L5-01 | Matrice FR/EN × light/dark × 31 écrans + opérateur | aucune info essentielle non traduite, contrastes et focus testés |
| L5-02 | POC T01–T12 et récupération panne | rapports PASS/FAIL explicites, pas hypothèses |
| L5-03 | Essais vendeurs/acheteurs et rentabilité | témoignages séparés des comportements observés |
| L5-04 | PSP/Play/CGV/taxes/retours/pays/livraisons | preuves externes / décision juridique, pas faux PASS |
| L5-05 | Builds signés / tests Android / journal de version | démonstration honnête puis production seulement si portes levées |

**Chaîne critique :** P0-01/04 → L0-01/05 → L1-01 → P0-05/L3-02 → L2-05 → L4-01/02 → L4-03/04 → L5. **Parallélisme :** L0-02/03 et maquettes peuvent avancer pendant P0; P0-03 travaille avec L1-05 ; validation utilisateurs continue indépendamment des POC. Aucune réduction silencieuse des produits numériques, acheteurs, vendeurs ou FR/EN.


## 3. Compléments obligatoires issus de la clôture UX/PRD

| ID | Ticket supplémentaire / écran | Pré-requis | Conditions de réussite |
|---|---|---|---|
| `UX-001` | Système de design tokens clair/sombre et mode système | P0-01 + design system | Aucune couleur métier codée en dur ; statut et focus contrastés |
| `UX-002` | Gamme composants universels : Card/Button/Field/Badge/Navigation/Dialog | UX-001 | États normal, vide, chargement, erreur, interdit ; touch >=48dp |
| `UX-003` | FR/EN : UI, erreur, notification, reçus, web ; conservation de choix | P0-01 | même objet et devise après bascule, couverture screen-state |
| `UX-004` | S01/S02 découverte et recherche sans résultat | UX-002 + L1-04 | offre à jour, branche vers S03, données fictives distinctes en tests |
| `UX-005` | S03/S04/S05 créer, retrouver et retirer besoin | L2-01/L2-02 | formulaire sans IA, consentement, quantité résiduelle visible |
| `UX-006` | S06/S09 comparaison/accord versionné | L2-05 + L4-01 | frais inconnus signalés, acceptation non automatique |
| `UX-007` | S07/S08 et S40/S41 offre et boutique publiques | L1-03/L1-05 | liens exacts, sans compte possible en lecture, historique prix non falsifié |
| `UX-008` | S10/S11 paiement et suivi distincts | L4-02/L4-03 | pending≠paid, aucun CTA lorsque route désactivée |
| `UX-009` | S12/S31 cycle numérique acheteur/vendeur | L4-05/L4-06 | accès persistant sans lien, produit personnalisé distingué |
| `UX-010` | S13/S33 réclamation et relation consentie | L4-07 | remboursement demandé ≠ confirmé ; historique et consentement |
| `UX-011` | S14/S15 profil/récurrence/budget | L0-04/L3-05 | préférence FR/EN/thème stable, achat récurrent pas automatique |
| `UX-012` | S20/S21 tableau et création boutique | L0-05/L3-01 | boutique active, tâches actionnables, corridor fermé expliqué |
| `UX-013` | S22/S23 catalogue/publication/IA assistive | L1-01/L1-02 | aucune photo/attribut inventé, correction obligatoire |
| `UX-014` | S24/S25 stock et vente extérieure | L3-02/L3-03 | stock consolidé, pending sync honnête, pas de revenu PSP inventé |
| `UX-015` | S26/S27 demande vendeur/proposition fournisseur | L2-03/L2-04 | infos privées non exposées, sur commande ≠ en stock |
| `UX-016` | S28/S29 commandes, livraison et incidents vendeur | L4-02/L4-07 | paiement/exécution visibles séparément |
| `UX-017` | S30 fournisseur et prix B2B | L3-04 | commande fournisseur indépendante et prix B2B privé |
| `UX-018` | S32 résultats : sources/marge incomplète | L3-05 | ventes externes et internes non fusionnées |
| `UX-019` | S34 équipe & permissions | L0-05 | non autorisé ne change pas le paiement, audit présent |
| `UX-020` | S42 login/retour et redirections sûres | L0-04/L1-05 | offer_id conservé sans token privé dans URL |
| `UX-021` | O01/O02/O03 interface opérateur séparée | L0-05 + audit | rôles stricts, décisions PSP/politique tracées |
| `UX-022` | Nouveaux jeux de données exemples : produits courants et fichiers numériques | L1-01 | pas de dépendance aux logos/avis des marques des moodboards |
| `QA-001` | Matrice 33 Screen IDs + 3 opérateur × 2 locales × 2 thèmes | UX-001/003/004–021 | aucun état critique manquant, rapports vidéo/capture Android |
| `QA-002` | Test mode système, persistance, barres natives et clavier | UX-001 | pas de flash blanc sombre, pas de CTA caché |
| `QA-003` | Tests accessibilité 360/430dp, police Android x2 | UX-002 | prix, variante, accord, statut, CTA lisibles |
| `QA-004` | Tests origine lien et cookies/consentement visiteur | UX-007/020 | aucune fuite, clic renvoie même objet |
| `QA-005` | Contrôles UX anti-promesse fausse | UX-008/009/014/018 | aucune affirmation de paiement, disponibilité ou identité non prouvée |

## 4. Registre de parallélisme et dépendances externes

- En parallèle du shell APK : UX-001…003, P0-03 App Links, P0-04/05 RLS/stock, tests d’entretiens et cadrage PSP/Play.
- Adapter PSP factice strictement staging **sans effet monétaire** ; une vraie route n’est ouverte que si T06 et le rôle légal du vendeur sont prouvés ; numérique Play seulement si T07 pour le modèle exact.
- Logistique par zone, licences numériques, taxes et droit de rétractation/remboursement : validation nécessaire avant promesse publique, pas avant créer l’architecture.
- Le backlog d’écrans constitue une déclinaison du système approuvé, pas un retrait des fonctions D01/D02.

## 5. Clôture des tâches

Chaque ticket fournit : commit/lien artefact, environnement, tests exécutés, logs, captures FR/EN clair/sombre, résultat, régression, date et éventuel blocage. Les tickets non exécutés sont **TODO** au moment du ZIP.

## 6. Démarrage recommandé par l’agent

Commencer par lire `00_LIRE_EN_PREMIER.md` → `PRD_Construction_V0_5.md` → `Architecture_Construction_V0_3.md` → `Design_System_Premium_V1_1.md` → `UX_UI_Specification_Finale_V1_0.md` → ce backlog → plan de tests. Ne pas imposer un IDE, nom commercial, prestataire de paiement ou corridor à partir des mockups.
