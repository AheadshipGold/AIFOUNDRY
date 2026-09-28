# LIRE EN PREMIER — HANDOFF CORRIGÉ : ADMINISTRATION CENTRALE D01 + D02

**Édition : 1.1 — 25 septembre 2026.** Ce dossier remplace le ZIP `AI_Foundry_D01_D02_FINAL_HANDOFF_READY_FOR_BUILD.zip` qui sous-spécifiait l’administration. Le précédent pack est conservé ici en tant qu'historique, mais ne doit plus être transmis seul à un codeur.

## Conclusion de l'audit de correction

Une plateforme de commerce ne peut être opérée sérieusement avec seulement « trois vues opérateur ». À la demande du fondateur, la console d'administration devient un **domaine produit transversal obligatoire**, et non un supplément décoratif. Les anciennes vues O01–O03 du dossier initial étaient une ébauche ; elles sont désormais **supplantées par A01–A18**, 50 exigences, 17 tickets et 20 tests. Les règles restent des spécifications, non des fonctionnalités exécutées.

## Vision confirmée (inchangée)

Plateforme réunissant acheteurs, commerçants, fournisseurs et produits physiques/numériques. APK Android véritable, expérience FR/EN complète, thème Système/Clair/Sombre, design premium ivoire/nuit/émeraude/champagne ; vision internationale avec disponibilité réelle par corridor. Les produits peuvent être partagés librement vers URL directe ; **pas d'intégration API sociale ni de programme d'affiliation rémunérée** actuellement. Cursor **non imposé**.

## Priorité actuelle et ordre de lecture

| Rang | Document normatif | Usage |
|---|---|---|
| 1 | `06_TRACABILITE/Decisions_Et_Audit_Croise_V1_1.md` | décisions confirmées, limites, correction admin |
| 2 | `01_IDEATION/Analyse_D01_D02_V0_9_Archive_Complete.md` | contexte complet **identique à l'original** |
| 3 | `02_PRD/PRD_Construction_V0_6.md` | 70 exigences clients/vendeurs + extension admin |
| 4 | `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md` | **DOMAINE ADMIN CENTRAL** : RBAC, finance, PSP, pays, offres, 50 ADMIN-FR, A01–A18 |
| 5 | `03_ARCHITECTURE/Architecture_Construction_V0_4.md` | fondations techniques + contrats admin |
| 6 | `04_UX_UI/Design_System_Premium_V1_1.md` | identité de design confirmée, FR/EN clair/sombre |
| 7 | `04_UX_UI/UX_UI_Specification_Finale_V1_1.md` | écrans acheteur/vendeur + panel admin |
| 8 | `05_CONSTRUCTION/Backlog_Final_V1_1.md` | lots initiaux et tickets admin intégrés |
| 9 | `05_CONSTRUCTION/Plan_Tests_Et_Portes_V1_1.md` | T01–T12 + ADMIN-T01–20, portes externes |

`03B_ADMINISTRATION/Console_Admin_Premium_Demo.html` : démonstration navigable des **18 rubriques** de gouvernance en FR/EN et clair/sombre, données **entièrement fictives**, sans serveur ni vraie authentification. Les autres prototypes et images sont également illustratifs. Le nom de marque final n'est pas décidé ; « Atelier » visible dans cette démo n'est pas la marque approuvée.

## Règles non négociables pour l'équipe de construction

1. **Construire ADMIN-L0 en même temps que la fondation du commerce.** RBAC+MFA, audit, politique de capacités de paiement *deny by default* et arrêt ciblé sont des dépendances avant toute première transaction monétaire réelle.
2. La console est privée, **distincte de l'APK public** et ne reçoit pas de clé PSP/Supabase privilégiée dans le navigateur. Chaque action sensible est validée côté serveur, avec scope, MFA, version, motif, audit, et seconde approbation selon risque.
3. Le propriétaire contrôle **ce que la plateforme autorise** mais n'invente pas une éligibilité PSP, un paiement confirmé, une permission légale ou une exception Google Play ; collection, remboursement, reversement, pays, canal et produit ont des capacités séparées.
4. Un switch OFF stoppe les **nouvelles** actions concernées ; le système continue d'honorer/reconcilier les obligations préexistantes selon politique et droit. Suspension vendeur ≠ disparition des commandes payées ; pause numérique ≠ révocation silencieuse des droits.
5. Aucun test POC Android, RBAC admin, PSP, Play, sécurité ou marché n'est passé du statut TODO à PASS par la rédaction de ce pack. Tester T01–12 et ADMIN-T01–20 sur des environnements réels adaptés.
6. Les versions `07_SOURCES_HISTORIQUES/Versions_handoff_pre_admin/` sont historiques, pas les références actives. Les fichiers normatifs des dossiers 01–06 et 03B priment selon le registre.

## Statuts honnêtes

**Préparation documentaire corrigée : livrée. Construction et preuves : non exécutées. Production commerciale : bloquée par portes PSP/Play/corridors/contrats/terrain selon flux.** Ne pas présenter le prototype HTML admin comme panel authentifié.

## Un seul Markdown

`SPECIFICATION_MAITRE_COMPLETE.md` regroupe le contenu des fichiers normatifs courants, **y compris le nouveau domaine d'administration**. En cas de changement, modifier la source du domaine, puis régénérer ce compilé et `MANIFESTE_SHA256.txt` avant de reconstruire le ZIP.
