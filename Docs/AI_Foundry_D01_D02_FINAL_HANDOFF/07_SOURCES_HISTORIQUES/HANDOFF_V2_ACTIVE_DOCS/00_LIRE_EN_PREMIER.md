# 00 — LIRE EN PREMIER : D01 + D02 V2 MERCHANT-OWNED COMMERCE NETWORK

**Date : 28 septembre 2026**  
**Statut : dossier de référence pour la prochaine implémentation.**  
**Remplace comme source active :** `AI_Foundry_D01_D02_FINAL_HANDOFF_V1_1_AVEC_ADMIN.zip`. V1.1 est conservé sous `07_SOURCES_HISTORIQUES/HANDOFF_V1_1_COMPLET`.

## Ce qui a changé

Nous conservons la marketplace intelligente D01+D02 et l'administration complète, mais nous changeons le modèle de responsabilité : **chaque boutique reste propriétaire de ses ventes, paiements et fulfillment**. La plateforme fournit marketplace, demand network, OS commercial, plans SaaS, sécurité, modération, analytics et intégrations.

Le dossier incorpore :
- audit Take App/Bumpa ;
- modèle merchant-owned payments ;
- plans SaaS Basic/Business/Enterprise + add-ons à tester ;
- Play Billing in-app vs web Mobile Money ;
- custom domains et nouvelles opportunités produit ;
- WhatsApp Business réouvert comme extension ;
- corrections documentaires signalées par Codex ;
- QA Android faible puissance/réseau lent.

## Ordre de lecture obligatoire

1. `00_DECISIONS_FONDATEUR_V2.md`
2. `01_IDEATION/Analyse_D01_D02_V1_0_Merchant_Owned_Network.md`
3. `01_RECHERCHE/Audit_Take_App_Bumpa_vs_D01_D02_V1_0.md`
4. `01_RECHERCHE/Registre_Codex_Corrections_V2.md`
5. `02_PRD/PRD_Construction_V0_7_Merchant_Owned.md`
6. `03_ARCHITECTURE/Architecture_Construction_V0_5_Merchant_Owned.md`
7. `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_1_Merchant_Owned.md`
8. `04_UX_UI/Design_System_Premium_V1_2.md`
9. `04_UX_UI/UX_UI_Specification_Finale_V1_2.md`
10. `05_CONSTRUCTION/Backlog_Final_V1_2.md`
11. `05_CONSTRUCTION/Plan_Tests_Et_Portes_V1_2.md`
12. `06_TRACABILITE/Decisions_Et_Audit_Croise_V2.md`

## Règles de construction

- Ne pas reconstruire un split-payment marketplace ou un escrow par habitude.
- Ne pas supprimer D02 ou réduire le produit à inventaire/catalogue.
- Ne pas considérer Take App comme template UI à copier.
- Ne pas considérer tous ses modules comme scope immédiat ; utiliser la matrice opportunités.
- Ne pas exposer secrets PSP dans APK/web client.
- Ne pas diriger depuis l'APK Play Bénin vers un checkout externe de plan SaaS sans programme autorisé.
- Ne pas marquer `paid` sans source de vérification explicite.
- Ne pas traiter vendeur vérifié comme produit authentique garanti.
- Ne pas prétendre qu'un fichier documenté est déjà implémenté/testé.

## Prototypes

Les HTML V1 sous `04_UX_UI/*_V1_REFERENCE.html` et `03B_ADMINISTRATION/*_V1_REFERENCE.html` restent des références visuelles historiques. La spécification V2 prime pour les nouveaux écrans et flows.
