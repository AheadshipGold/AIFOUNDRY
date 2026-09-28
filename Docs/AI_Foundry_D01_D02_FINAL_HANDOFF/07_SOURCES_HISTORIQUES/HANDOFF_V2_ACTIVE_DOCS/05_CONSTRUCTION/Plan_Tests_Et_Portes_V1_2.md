> **CORRECTION CRITIQUE DU HANDOFF — ADMINISTRATION (25 septembre 2026)** : à la demande explicite du fondateur, l’administration de la plateforme est un **domaine central** et non trois vues génériques. Lire **`03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md`** avant toute conception des permissions, des paiements, des rôles, des modules ou de la mise en production. Cette extension comprend **50 exigences ADMIN-FR, 18 vues admin, 17 tickets et 20 tests**. Elle est normative pour la construction, avec portes financières/contractuelles toujours ouvertes. Les références anciennes à O01–O03 sont conservées comme couverture historique *insuffisante*, non comme limite du panel. Le prototype admin est une **simulation navigateur**, pas un service déployé.

# PLAN DE TESTS, PORTES DE PRODUCTION ET JOURNAL DE PREUVES

**Version :** 1.1 — 2026-09-25  
**Situation à la constitution du ZIP :** aucun POC T01–T12 exécuté comme partie de ce dossier. Tests de fichiers et de prototypes HTML = QA documentaire/navigateur, pas tests Android, PSP, Play ou clients.

## 1. Ordre des preuves

| ID | Objet | Critère de réussite | Trace à conserver | Statut initial |
|---|---|---|---|---|
| T01 | APK + bilinguisme | APK installé sur appareil Android ; acheteur/vendeur FR⇄EN ; paramètres persistants | capt. appareils + logs + APK | **NON EXÉCUTÉ** |
| T02 | Lien offre HTTPS/App Links | même offer_id/variante avec et sans installation, lien ancien à prix réel | URL test, assetlinks vérifié, vidéo | **NON EXÉCUTÉ** |
| T03 | Stock dernier SKU | 100 tentatives simultanées sur 1 unité : 1 seule confirmée, stock ≥0 | test DB concurrence et logs | **NON EXÉCUTÉ** |
| T04 | Isolation boutiques/RLS | A ne voit/modifie ni paiements ni stock/clients de B ; visiteur limité | tests négatifs autorisations | **NON EXÉCUTÉ** |
| T05 | Fake PSP en staging | webhook répété ou tardif, montant faux : ledger sans doublon | logs idempotence sous fake PSP | **NON EXÉCUTÉ** |
| T06 | PSP réel en sandbox | route pays/devise/marchand/reversement/remboursement contractuellement compatible | preuves PSP et sandbox | **NON EXÉCUTÉ** |
| T07 | Numérique & Play | catégorie achat et modèle multivendeur qualifiés, token serveur et entitlement | preuve qualification, sandbox Play si applicable | **NON EXÉCUTÉ** |
| T08 | IA FR/EN | besoin ambigu et photo floue sans invention, fallback en panne, coût mesuré | jeu de cas annotés et logs | **NON EXÉCUTÉ** |
| T09 | Offline vente extérieure | double vente offline puis synchronisation détecte conflit sans prétention de garantie | test offline/reconnexion | **NON EXÉCUTÉ** |
| T10 | Incidents / droit | payé ≠ livré et lien expiré ≠ droit perdu ; remboursement demandé ≠ effectif | tests e2e incidents | **NON EXÉCUTÉ** |
| T11 | Bilinguisme E2E | sept scénarios et erreurs exécutés en FR puis EN, avec thèmes clair/sombre | matrice écran/locale/thème/état | **NON EXÉCUTÉ** |
| T12 | Crash et reprise | tuer processus pendant mutation, relancer sans double écriture ni commande | tests reprise logs outbox | **NON EXÉCUTÉ** |

## 2. Vérifications design et traduction

- D01/D02 : même compte, mais séparation des contextes acheteur/boutique et confidentialité B2B.
- Tous les Screen IDs `S01–S42` listés en UX finale + `O01–O03` : cas normal/vide/erreur/hors connexion ou blocage quand pertinent.
- Tests FR clair, FR sombre, EN clair, EN sombre ; `Système` suit OS ; préférence manuelle persiste ; libellés longs EN et polices Android agrandies.
- Contraste des tokens sur composants réellement rendus ; ne pas présumer qu’un contraste mesuré pour quatre couleurs vaut pour tous les états.
- Test mobile 360dp et 430dp, clavier natif, erreurs paiement/réservation ; pas de contenu important coupé.

## 3. Portes commerciales/juridiques distinctes du build

| Porte | Critère externe avant activation publique | Responsabilité à assigner | État |
|---|---|---|---|
| G01 Marché | segment initial, pays vendeur/acheteur, langues et attentes testés | fondateur / enquête terrain | OUVERT |
| G02 Modèle financier | tarif, commissions, frais PSP, support et marge unitaire démontrés | fondateur / finance | OUVERT |
| G03 Vendeur légal | CGV, entité qui vend, facture, reçoit et rembourse par flux/pays | conseil juridique/finance | OUVERT |
| G04 PSP physique | agréments pays, KYC, reversements, remboursements et contrat signé | PSP + fondateur | OUVERT |
| G05 Play numérique | analyse achats APK, abonnement vendeur, multivendeur et exceptions régionales exactes | conformité Play + juridique | OUVERT |
| G06 Produits numériques | droits d’auteur/licences, stockage et redélivrance | opérateur / juridique | OUVERT |
| G07 Livraison | zones, frais, preuve, responsabilités et SAV | vendeurs/partenaires | OUVERT |
| G08 Sécurité | RLS, secrets, logs, incident response, sauvegardes | ingénierie | OUVERT |

**Ces portes ne bloquent pas la programmation du shell, des modèles, des écrans ni des simulateurs explicitement cantonnés au staging. Elles bloquent l’activation réelle des capacités associées.**

## 4. Journal de preuve pour tickets / tests

```text
ID:
Version / commit:
Environnement:
Date:
Commandes de test:
Jeu de données:
Résultat: PASS | FAIL | BLOCKED
Fichiers logs/captures:
Régression / incident:
Responsable:
```

## 5. Definition of Done du premier APK démontrable

- APK Android installé sur téléphone, FR/EN et trois modes système/clair/sombre ; pas simple aperçu navigateur.
- S01, S02, S03, S07, S20, S23 et S24 reliés à données de test ; vrais rôles isolés.
- Démonstration de demande → proposition → accord → commande simulée, avec états réels du serveur en staging.
- POC stock T03 et sécurité T04 PASS pour les modules présentés ; fake PSP étiqueté non transaction réelle.
- Démonstration honnête, noms et chiffres fictifs explicitement signalés, aucune vente PSP live avant G03…G05.

## 6. Definition of Done de la mise en production

POC et tests de sécurité correspondants PASS, capacité PSP/Play validée par flux, disponibilité/logistique et retours contractualisés, CGV/licences revues, retours utilisateurs observés, support et exploitation prêts. Le ZIP de préparation **n’est pas** la preuve de ce statut.


---
# MATRICE ADMIN — PREUVES ADDITIONNELLES (NON EXÉCUTÉES)

Ajouter les **20 cas ADMIN-T01…ADMIN-T20** du dossier `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md` §8 à T01–T12 (qui demeurent tous non exécutés ici). **ADMIN-T06, T07, T08, T10, T11 et T12** sont des portes spécifiques : aucune activation d'un moyen non éligible, aucune fausse restitution financière et aucune perte des obligations existantes sous suspension. MFA, permissions, séparation des fonctions, fail closed, audit et rollback doivent être démontrés dans un environnement de test avant la première transaction réelle. Les tests admin navigateur ne valent pas QA serveur.


---
# TESTS V2 — MERCHANT-OWNED / SAAS

| ID | Test | PASS indispensable |
|---|---|---|
| V2-T01 | Isolation provider Shop A / Shop B | aucun credential/ref croisé |
| V2-T02 | Paiement automatisé Shop A | provider callback vérifié ; statut provider-confirmed |
| V2-T03 | Paiement manuel | buyer-declared/confirming ≠ provider-paid |
| V2-T04 | Multi-vendeur | 2 shops → 2 orders + 2 payment flows |
| V2-T05 | Refund provider | utilise connexion shop ; asynchrone ; idempotent |
| V2-T06 | Manual refund | jamais présenté comme provider-refunded |
| V2-T07 | Web SaaS Mobile Money | entitlement Business actif dans APK |
| V2-T08 | Play Billing SaaS | entitlement identique ; renouvellement/cancel sync |
| V2-T09 | Play policy Benin | aucun CTA/webview in-app vers checkout externe SaaS |
| V2-T10 | Custom domain | DNS/TLS/redirect/social preview PASS |
| V2-T11 | Market isolation | Bénin discovery n'affiche pas Nigeria par défaut |
| V2-T12 | Proposal → shop order | seller selected owns checkout/payment |
| V2-T13 | Fulfillment seller-led | platform never claims own delivery |
| V2-T14 | Trust badge scope | identity badge cannot imply product authenticity |
| V2-T15 | Offline POS conflict | conflict resolved, no silent overwrite |
| V2-T16 | Low-end Android | 360dp, low RAM, slow network usable |
| V2-T17 | FR/EN + light/dark | V2 screens S35–S39 full parity |
| V2-T18 | Plan quota | Basic limit and upgrade state deterministic |
| V2-T19 | Webhook duplicate | one logical update only |
| V2-T20 | WhatsApp module disabled | core commerce fully usable |

## Validation terrain

Mesurer au minimum : time-to-first-store, products published, links shared, store visits, orders, searches without result, requests posted, proposals received, repeat merchant activity, stock updates, plan upgrade intent/actual purchase, support burden. Ne jamais qualifier le marché de validé sur intentions seules.
