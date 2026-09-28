# BACKLOG DE CONSTRUCTION — D01 + D02

**Version 0.1 — 25 septembre 2026**  
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
