# LIRE EN PREMIER — DOSSIER MAÎTRE AI FOUNDRY D01 + D02

**Édition documentaire finale pour transmission à l’équipe de construction — 2026-09-25**

## En une phrase

Construire une plateforme de commerce actif réunissant acheteurs, vendeurs, fournisseurs et créateurs numériques ; offre existante OU expression de besoin, gestion du commerce y compris ventes extérieures, transactions suivies, partage social sans API sociale, APK Android FR/EN et système/clair/sombre, direction premium approuvée.

## Verdict de clôture

- **Idéation et PRD : clôturés pour la préparation de la construction.** Document d’idéation v0.9 conservé tel quel et PRD v0.5 ajoute la dernière décision de design.
- **Architecture : spécifiée mais POC non exécutés.** Démarrer en staging avec preuves T01–T12 et choisir librement l’IDE (pas Cursor imposé).
- **Design : direction approuvée, tokens et fiches pour tous les écrans définis.** Démo haute fidélité = quatre écrans maîtres seulement ; prototype élargi = simulation parcours ; le rendu Flutter de chaque écran reste à coder et tester.
- **Economique/réglementaire : cadrage documentaire, pas validation terrain ni PSP sous contrat.** Ne pas ouvrir paiements réels/numériques non qualifiés.
- **ZIP = version finale du dossier de préparation à la construction, PAS preuve que l’application est prête à publier.**

## Ordre de lecture obligatoire

| Rang | Fichier | Autorité / usage |
|---|---|---|
| 1 | `06_TRACABILITE/Decisions_Et_Audit_Croise_V1_0.md` | décisions et corrections |
| 2 | `01_IDEATION/Analyse_D01_D02_V0_9_Archive_Complete.md` | contexte et historique de la réflexion |
| 3 | `02_PRD/PRD_Construction_V0_5.md` | besoins, 70 FR, règles métier et design confirmé |
| 4 | `03_ARCHITECTURE/Architecture_Construction_V0_3.md` | services, données, transactions, API et frontières |
| 5 | `04_UX_UI/Design_System_Premium_V1_1.md` | couleur, composants, clair/sombre |
| 6 | `04_UX_UI/UX_UI_Specification_Finale_V1_0.md` | fiches tous écrans et flux |
| 7 | `05_CONSTRUCTION/Backlog_Final_V1_0.md` | lots et tâches dans l’ordre |
| 8 | `05_CONSTRUCTION/Plan_Tests_Et_Portes_V1_0.md` | preuves techniques et activation publique |

## Visualisations : statut exact

- `04_UX_UI/Demo_Premium_4_Ecrans.html` : quatre écrans premium S01, S03, S07, S20 ; simulation sans backend.
- `04_UX_UI/Prototype_Parcours_Complets_Premium.html` : 31 écrans acheteur/vendeur simulés avec palette premium ; pages web S41/S42 et vues opérateur O01–03 documentées dans le MD ; pas des écrans Flutter réels ni une batterie de maquettes haute fidélité définitives.
- `04_UX_UI/References_visuelles/` : images générées pour l’inspiration, parfois avec noms de grandes marques, chiffres et badges entièrement fictifs ; **ne pas copier les marques, badges, photos ou allégations dans l’app finale**.

## Instructions non négociables à l’agent de construction

1. **Ne pas imposer Cursor** ; le fondateur choisit son IDE/agent. Flutter est une proposition de framework compatible APK, non un IDE.
2. Ne pas réduire le produit à un catalogue ou supprimer sans arbitrage besoins, ventes extérieures, approvisionnement, produits numériques, FR/EN ou clair/sombre.
3. Séparer `external sale`, `marketplace order`, `supplier order` ; jamais faire passer la vente enregistrée hors marketplace pour une transaction PSP de la plateforme.
4. Paiement pending ≠ confirmé ; confirmé ≠ livré ; achat numérique ≠ lien téléchargeable ; réservation stock atomique.
5. Google Play et PSP : pas de contournement par page web ni activation d’un pays sans preuves adaptées.
6. Toutes données d’exemple sont fictives ; aucune IA ne devine montant, stock, vendeur vérifié ou disponibilité.
7. Démarrer par POC APK+FR/EN/thèmes, App Links, RLS et réservation stock. Produire des rapports de PASS/FAIL, pas seulement du code.

## Matériel conservé / non conservé

Le pack contient les versions de référence en dossiers 01–06, et en 07 les sources historiques principales et les sources de cartographie D01/D02. Les multiples ZIP provisoires et fichiers `.tmp.md` ne sont pas des pièces normatives et sont exclus. Les références visuelles sont illustratives et non des licences commerciales.

## Un seul Markdown compilé

`SPECIFICATION_MAITRE_COMPLETE.md` rassemble mot pour mot les documents normatifs majeurs afin de lire le projet d’un seul tenant. En cas d’une mise à jour future, modifier d’abord le fichier du domaine concerné puis régénérer le document compilé et le manifeste ; ne pas créer des versions finales contradictoires.

## Prochain premier acte concret

Configurer le dépôt/environnement choisi par le fondateur, créer l’APK de test FR/EN système/clair/sombre, puis enregistrer le verdict T01 ; en parallèle préparer tables/staging et T03/T04. Pas de nouveau brainstorming générique.
