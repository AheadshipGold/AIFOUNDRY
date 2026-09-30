# Audit court — avant les quatre références

Branche : codex/ui-design-system-v3. Périmètre : code du lot 01, pas un produit complet.

## Sources et arbitrage

Le corpus actif V3 a été lu pendant la construction du lot 01 : décisions fondateur, PRD 0.8, FinOps 1.0, stack 1.0, architecture 0.6, admin 1.2, Design System/UX/backlog/tests 1.3 et registres V3. Pour cette reprise, relecture des décisions, paiements/FinOps, contrats S01/S07/S20/S44 et règles transversales. La spécification maître V3 compile ces mêmes sources.

La nouvelle directive maître fournie par le fondateur prime sur les effets prescrits dans `Docs/AI_Foundry_D01_D02_PRESTIGE_UI_UX_DIRECTIVE.md`. Ce dernier est conservé intact : pas de suppression silencieuse. Ni palette, ni stack, ni règle produit ne sont modifiées.

## Observations sur le code

1. La galerie est un catalogue technique, pas une expérience de commerce : sections et Card génériques ne suffisent pas à établir une hiérarchie acheteur/vendeur.
2. ProductCard utilise un visuel peu dominant et un conteneur identique aux formulaires. Le vendeur apparaît avant le titre et le prix. La référence acheteur doit donner priorité au produit.
3. Les composants financiers sont honnêtes, mais DayClosePanel imbrique des cartes. Une clôture mérite une lecture par totaux, moyens, écarts puis action, sans répétition de cadres.
4. Des valeurs de dimensions et des glyphes sont encore dupliqués entre web et natif. Les tokens existent, mais leur consommation doit être renforcée progressivement ; aucune migration destructive du lot testé.
5. L’absence de photos et l’uniformité des conteneurs donnent un aspect de démonstration. Pas d’abus de glass/glow constaté dans le code ; il serait contre-productif d’en ajouter.
6. Les preuves acquises sont celles du navigateur. Android réel, TalkBack, clavier natif et performances sur appareil modeste restent non validés.

## Intervention limitée

Base : quatre références web Next.js, S01 découverte, S07 offre, S20 aujourd’hui vendeur, S44 clôture. Primitives conservées. Ajout de compositions réutilisables EditorialProduct, FinancialMetric et OrderRow, avec les statuts existants. Toutes les données, images et transactions sont fictives et identifiées. Pas de nouvelle règle métier ni de paiement réel.

## Extension autorisée le 30 septembre

Le fondateur a explicitement levé la limite de quatre écrans. Extension : S03 demande, S06 comparaison, S28 commandes vendeur, S43 caisse/journal. L'autorisation élargit l'UI, pas les permissions de paiement, publication ou mutation du backend. La validation humaine reste utile sans être un verrou artificiel au quatrième écran.
