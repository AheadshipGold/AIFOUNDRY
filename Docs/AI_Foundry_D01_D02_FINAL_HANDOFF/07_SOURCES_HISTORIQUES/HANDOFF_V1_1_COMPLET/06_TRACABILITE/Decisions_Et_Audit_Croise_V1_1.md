> **CORRECTION CRITIQUE DU HANDOFF — ADMINISTRATION (25 septembre 2026)** : à la demande explicite du fondateur, l’administration de la plateforme est un **domaine central** et non trois vues génériques. Lire **`03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md`** avant toute conception des permissions, des paiements, des rôles, des modules ou de la mise en production. Cette extension comprend **50 exigences ADMIN-FR, 18 vues admin, 17 tickets et 20 tests**. Elle est normative pour la construction, avec portes financières/contractuelles toujours ouvertes. Les références anciennes à O01–O03 sont conservées comme couverture historique *insuffisante*, non comme limite du panel. Le prototype admin est une **simulation navigateur**, pas un service déployé.

# REGISTRE DES DÉCISIONS ET AUDIT CROISÉ — D01 + D02

**Version :** 1.1 — 2026-09-25  
**Objet :** vérité opérationnelle pour éviter qu’un agent transforme un exemple ou une préférence passée en obligation actuelle.

## 1. Décisions confirmées par le fondateur

| Sujet | Décision effective |
|---|---|
| Produit | réunir D01 commerce vendeur et D02 achat acheteur, pas D03 comme domaine de l’app |
| Support | véritable APK Android, non web app déguisée ; pages web légères d’offre complémentaires |
| Langues | français et anglais complets dès le premier produit |
| Apparence | système / clair / sombre, tous espaces |
| Visuel | direction premium contemporaine, ivoire/nuit/émeraude/champagne approuvée |
| Commerce | produits physiques et numériques, vision internationale avec activation réelle par route |
| Social | partage libre vers URL précise, sans API réseaux sociaux et sans programme d’affiliation rémunérée pour l’instant |
| Outillage | ne PAS imposer Cursor ; environnement de développement libre |
| Processus | clôturer préparation dans ZIP maître ; ne pas réouvrir idéation sans motif factuel |

## 2. Choix d’ingénierie de référence, pas engagements du fondateur

- Flutter/Dart pour l’APK + PostgreSQL/Supabase/PostgreSQL sous fonctions serveur ; repli si POC échoue.
- Unités monétaires exactes (entiers minor unit + devise), commandes et états distincts, idempotence et réservations atomiques.
- Design system : valeurs hexadécimales de référence ; ajustement admissible uniquement pour accessibilité/QA et cohérence avec direction approuvée.
- IA pour préparer besoins/fiches, jamais confirmer argent, disponibilité ou authenticité ; voie manuelle obligatoire.

## 3. Points réellement ouverts — pas des tâches de palette ni d’idéation

| Sujet | Statut | Condition avant activation |
|---|---|---|
| Nom/identité finale | Ouvert | branding et disponibilité, non bloquant pour compiler une APK de test |
| Pays/corridors | Non confirmés | PSP + contrat + droit + logistique |
| Tarif abonnement/commission | Non confirmé | coûts, tests de prix et compatibilité Play |
| Vendeur légal/fiscalité | Non confirmé | CGV et validation pays/catégorie |
| Paiement PSP | Non confirmé | sandbox et contrat, reversement/remboursement effectifs |
| Play numérique multivendeur | Non confirmé | classement exact et canal autorisé vérifiés |
| Opérations de livraison | Non confirmées par zone | vendeurs/partenaires et responsabilités |
| Marché | cadrage documentaire seulement | entretiens/essais réels et comportement |
| Tests T01–T12 | NON EXÉCUTÉS | rapports d’ingénierie et tests sur appareil |

## 4. Audit contradictions et corrections appliquées dans ce pack

| Risque détecté dans anciennes versions | Correction normativement active |
|---|---|
| Cursor présenté comme IDE dans architecture v0.2/v0.1 | Architecture v0.3 section principale + addendum : IDE libre ; mentions de v0.1 archivées |
| PRD v0.4 n’intègre pas le design final clair/sombre premium | PRD v0.5 annexe D : direction/états/FR-EN confirmés |
| Wireframe v0.2 propose par démo IA budget Cotonou inventé | Prototype parcours premium : simulation IA ne préremplit plus budget/zone absents |
| Design system v1.0 dit que les autres écrans doivent être spécifiés | UX finale v1.0 : toutes les fiches d’écran S01…S42 + opérateur O01…03 définies ; 4 seulement visualisées en haute fidélité |
| Architecture historique indique UX Blueprint à venir | README et v0.3 précisent que UX finale et backlog sont les références actives |
| Nom visuel « Commerce Studio », « Marketplace », « Marché » des images | placeholders et moodboards, aucune marque commerciale arrêtée |
| Badge « vendeur vérifié », logo marque, avis dans les images générées | données fictives interdites comme preuve de confiance, marque ou avis client réels |
| Paiement de démo ou fake PSP | staging uniquement, aucun label de paiement réellement encaissé |
| Dépassement de périmètre via une simple vue web | pages publiques complémentaires, APK principal, pas API sociale |

## 5. Hiérarchie de préséance

1. Décisions explicites du fondateur en cours de conversation et présent registre.
2. `02_PRD/PRD_Construction_V0_6.md` et ses annexes en vigueur.
3. `03_ARCHITECTURE/Architecture_Construction_V0_4.md` sections principales + addendum, annexe H ancienne historique.
4. `04_UX_UI/Design_System_Premium_V1_1.md` + `UX_UI_Specification_Finale_V1_1.md`.
5. `05_CONSTRUCTION/Backlog_Final_V1_1.md` + plan de tests.
6. Dossier d’idéation v0.9 et sources historiques pour compréhension, pas pour annuler les décisions postérieures.

## 6. Passage documentaire

**Handoff pour démarrer la construction en staging : OUI.** Validation du marché, contrat PSP/Play, conformité et production : NON. Rendu haute fidélité de chaque écran en APK : NON. Ces conditions sont des tâches de construction et de lancement clairement assignées.


---
# CORRECTION 2026-09-25 — ADMINISTRATION PLATEFORME EST UN DOMAINE CENTRAL

**Décision explicite du fondateur :** une console admin **sophistiquée** lui donnant la gouvernance des utilisateurs, vendeurs, modules, restrictions, moyens de paiement autorisés/actifs et activités de la plateforme doit être incluse dans le produit. L'assistant assume avoir sous-spécifié ce domaine dans le handoff précédent malgré FR-59 et O01–O03.

**Autorité documentaire actuelle :** `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md` s'ajoute à PRD v0.6, architecture v0.4, UX v1.1, backlog v1.1 et tests v1.1. Gouvernance des permissions, sécurité, audit, configuration, corridors PSP et support sont obligatoires pour préparer la première vente réelle. Les détails de contrôle/conformité sont des solutions de conception de référence ; contrat PSP, fiscalité, réglementations et mise en production restent non prouvés.

**Point de reprise :** développer les fondations ADMIN-L0 parallèlement à l'APK et à la base ; suivre ADMIN-T01–20. Les preuves T01–12 n'ont pas changé de statut.
