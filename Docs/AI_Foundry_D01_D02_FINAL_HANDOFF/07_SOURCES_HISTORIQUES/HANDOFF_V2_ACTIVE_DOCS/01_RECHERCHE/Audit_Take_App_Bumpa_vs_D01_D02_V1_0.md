# AUDIT STRATÉGIQUE — TAKE APP, BUMPA ET TRANSITION D01 + D02

**Version : 1.0 — 28 septembre 2026**  
**Statut :** recherche comparative servant d'entrée normative aux décisions V2 ; les faits de concurrents sont datés et doivent être revalidés avant implémentation commerciale.  
**Règle :** s'inspirer des mécanismes, ne copier ni marque, ni UI, ni textes, ni promesses commerciales.

## 1. Pourquoi cet audit existe

Le blocage principal de D01+D02 n'était pas la difficulté du code mais l'hypothèse implicite selon laquelle une marketplace devait recevoir les fonds des acheteurs, les répartir aux vendeurs, éventuellement les séquestrer jusqu'à livraison et intervenir dans la logistique. Cela augmentait fortement les obligations opérationnelles, financières et de support.

Take App fournit un modèle alternatif : le logiciel structure boutique, catalogue, commande, paiement, livraison et relation client, tandis que le commerçant reste le vendeur et connecte ses propres moyens de paiement. Notre adaptation conserve en plus le réseau D02 : recherche multi-vendeurs, besoins non satisfaits, matching, propositions et comparaison.

## 2. Take App — faits officiels pertinents (revue 28/09/2026)

### Positionnement et responsabilités
- Take App est un logiciel de commerce orienté WhatsApp et boutiques web.
- Ses Conditions indiquent que le Store Owner est le vendeur de ses articles et reste responsable du contenu, du fulfillment et des transactions de sa boutique.
- Take App documente aussi des scénarios de plateforme et de marketplace multi-vendeur dans son offre Build/Platform API.

### Tarification officielle actuelle
- **Basic : 0 USD** ; 50 commandes/mois conservées dans le dashboard ; produits illimités ; 0 % commission ; paiements locaux.
- **Business : 50 USD/mois** après une promotion premier mois au moment de la revue ; commandes illimitées, paiements carte, automatisations WhatsApp, domaine personnalisé, suppression du branding, plusieurs boutiques/collaborateurs.
- **Enterprise :** tarification sur devis / custom build.
- Add-ons pour certaines consommations et capacités supplémentaires.

Les anciennes sources tierces montrant Premium 14 USD / Business 38 USD sont historisées comme **tarification obsolète** et ne doivent pas guider nos prix.

### Paiement
- Le commerçant peut connecter son propre compte auprès de passerelles prises en charge.
- Take App indique ne pas prendre de commission sur les commandes ; les PSP facturent leurs propres frais.
- Les paiements automatiques peuvent mettre à jour le statut de paiement automatiquement ; les méthodes manuelles restent distinguées.
- Leur catalogue d'intégrations indique actuellement de nombreuses passerelles, dont Paystack, Flutterwave, CinetPay, MTN MoMo et PawaPay selon disponibilité.

### Fonctionnalités majeures repérées
**Storefront / web :** boutique mobile, recherche, filtres, catégories, pages, bannières, domaine personnalisé, email de domaine, SEO, image de partage, analytics/pixels, répertoire public optionnel.  
**Produits :** variantes, options/add-ons, coût, stock/SKU, alertes, numérique, booking, abonnement, précommande, CSV/bulk edit, upsell, wishlist, avis, remises/bundles.  
**Commandes :** panier/checkout, champs personnalisés, brouillons, édition/duplication, statuts séparés order/payment/fulfillment, factures, payment links, notes, staff assignment, tracking, PDF/impression, QR ordering/réservations.  
**Paiements :** automatisés, locaux/manuels, preuve de paiement, COD, acompte, pay-later, payment recovery.  
**Livraison :** retrait, livraison marchand, frais zone/distance/poids/code postal, créneaux, capacité, preuve de livraison, suivi, couriers externes.  
**CRM :** profils, tags, imports/exports, membership, rewards/store credit, referrals, accès membres, wholesale pricing.  
**WhatsApp/Instagram :** inbox partagé, broadcasts, workflows, notifications, catalogue WhatsApp, Instagram comments, chatbot IA.  
**POS / omnicanal :** ventes physiques, méthodes cash/QR/link, commandes catalogue, impression Bluetooth, switch multi-store.  
**Intégrations :** API, webhooks signés, Zapier, MCP, Shopify, Wix, WooCommerce, Loyverse, Google Merchant/Instagram Shopping.  
**Analytics :** ventes, traffic, exports, receivables, daily closing.

## 3. Bumpa — pourquoi le benchmark reste utile

Bumpa est pertinent comme benchmark africain pour inventaire, commandes, POS, clients, site marchand, paiements, analytics et opérations de petites entreprises. Il prouve qu'un SaaS commerce africain peut exister face à des acteurs globaux. Toutefois, certaines documentations de Bumpa décrivent des flux où les fonds sont d'abord reçus par Bumpa puis remitted au commerçant. Pour notre objectif précis de **ne pas détenir les fonds des ventes**, Take App est un modèle opérationnel plus proche.

## 4. Ce que D01+D02 faisait déjà mieux ou différemment

- Marketplace de découverte multi-vendeur.
- Recherche multicritère et comparaison.
- Recherche infructueuse → demande structurée.
- Matching besoins → vendeurs pertinents.
- Plusieurs propositions à une même demande.
- Continuité demande → proposition → commande.
- Vente extérieure et stock commun avec activité physique/sociale.
- Fournisseurs et approvisionnement B2B plus structurés.
- Panel admin central complet.
- Marchés nationaux configurables.
- Bilingue FR/EN et thèmes clair/sombre dès la conception.

## 5. Matrice de transition

| Domaine | Take App | D01+D02 V1.1 | Décision V2 |
|---|---|---|---|
| Boutique autonome | Fort | Oui | Renforcer |
| Catalogue/stock | Fort | Fort | Conserver |
| Paiement | Compte PSP marchand | Trop orienté marketplace/corridor | Merchant-owned payments |
| Fonds plateforme | Pas de custody par défaut | Possibilité de payout/escrow étudiée | Exclu par défaut |
| Livraison | Merchant-led | Suivi potentiellement trop central | Merchant-led, plateforme outille |
| Commission | 0 % Take App | Option envisagée | Pas obligatoire ; SaaS prioritaire |
| Abonnement | Cœur du revenu | Hypothèse secondaire | Hypothèse principale |
| Domaine custom/SEO | Oui | Sous-spécifié | Ajouter |
| WhatsApp officiel | Très fort | API sociale exclue au départ | Réouvrir comme extension stratégique |
| POS | Oui | Vente externe | Renforcer en POS léger |
| CRM/fidélité | Oui | Partiel | Renforcer |
| API/webhooks | Oui | Architecture prévue | Renforcer |
| Marketplace découverte | Secondaire/variable | Cœur | Garder |
| Demandes/propositions | Pas cœur | Distinctif | Garder absolument |
| Admin central | Différent | Très fort | Garder |

## 6. Opportunités fonctionnelles à explorer — backlog produit, pas scope obligatoire immédiat

### Storefront / marque
- custom domain ;
- emails de domaine ;
- pages et navigation personnalisées ;
- SEO, meta tags, social sharing image ;
- pixels/analytics avec consentement ;
- brand removal selon plan ;
- annuaire public opt-in.

### Commerce
- variantes/options/add-ons ;
- catalog import/export CSV ;
- digital products ;
- booking/rental/subscription/preorder comme types extensibles ;
- bundles/discounts/upsell/wishlist/reviews ;
- wholesale pricing et accès groupes clients.

### Commandes et opérations
- draft order ;
- factures et payment links ;
- notes internes/fichiers ;
- staff assignment ;
- order/payment/fulfillment séparés ;
- impression/packing list ;
- QR/POS ;
- multi-store.

### Customer OS
- profils, tags, historique ;
- fidélité/rewards/referrals ;
- segmentation ;
- consentements de contact ;
- store access réservé/membres.

### Communication
- WhatsApp Business officiel ;
- inbox d'équipe ;
- workflows ;
- broadcasts ;
- catalog sync ;
- Instagram intégration si pertinente ;
- chatbot/IA avec handoff humain.

### Platform / developers
- API ;
- webhooks signés et idempotents ;
- Zapier/automation ;
- connecteurs e-commerce/POS ;
- MCP/agent tools à évaluer plus tard.

## 7. Différenciation candidate de notre V2

**Merchant Commerce OS + Demand Network.**

Le vendeur obtient un système commercial autonome utile même sans trafic marketplace. L'acheteur peut entrer par un lien direct, chercher à l'échelle du marché ou publier un besoin. Lorsqu'une demande trouve un vendeur, elle devient une commande de la boutique sélectionnée. Le paiement et le fulfillment restent sous la responsabilité commerciale de cette boutique, tout en étant suivis par notre logiciel.

## 8. Sources officielles à revalider

Take App :
- https://www.take.app/
- https://www.take.app/pricing
- https://www.take.app/terms
- https://www.take.app/build
- https://www.take.app/integrations
- https://www.take.app/help/category/products
- https://www.take.app/help/category/orders
- https://www.take.app/help/category/delivery
- https://www.take.app/help/category/customers
- https://www.take.app/help/category/whatsapp-business
- https://www.take.app/help/category/website
- https://www.take.app/help/category/analytics
- https://www.take.app/help/category/mobile-pos-app

Google Play :
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://support.google.com/googleplay/android-developer/answer/10281818
- https://support.google.com/googleplay/answer/11174377

**Attention :** les fonctionnalités, prix, pays et règles changent ; ne jamais hardcoder une promesse commerciale parce qu'elle apparaît dans cet audit daté.
