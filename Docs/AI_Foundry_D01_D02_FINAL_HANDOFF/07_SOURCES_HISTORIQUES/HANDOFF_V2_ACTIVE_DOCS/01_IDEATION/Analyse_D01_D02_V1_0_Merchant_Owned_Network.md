# D01 + D02 — CONCEPT PRODUIT V2 : MERCHANT-OWNED COMMERCE NETWORK

**Version conceptuelle : 1.0 — 28 septembre 2026**  
**Base historique :** Analyse D01+D02 v0.9 préservée sans modification.  
**Motif de transition :** réduire les responsabilités financières/logistiques de la plateforme sans perdre la marketplace ni le réseau offre-demande.

## 1. Définition

Une plateforme de commerce intelligente qui combine :

1. **un Merchant Commerce OS** pour que chaque commerçant exploite sa boutique, son catalogue, son stock, ses commandes, ses clients et ses canaux ;
2. **un Demand Network** où les acheteurs découvrent, recherchent, comparent et publient leurs besoins ;
3. **une couche SaaS plateforme** qui orchestre découverte, matching, plans, sécurité, administration, marchés, analytics et intégrations.

La transaction commerciale appartient par défaut à la boutique choisie. La plateforme peut afficher et vérifier des statuts provenant des systèmes connectés sans détenir les fonds ni exécuter la livraison elle-même.

## 2. Proposition de valeur

### Acheteur
- trouver un produit précis dans son marché ;
- ouvrir une boutique fiable à partir d'un lien social ;
- comparer des vendeurs ;
- publier un besoin quand le catalogue ne suffit pas ;
- recevoir plusieurs propositions ;
- commander et payer via les moyens de paiement du vendeur ;
- suivre l'exécution de la commande.

### Commerçant
- gérer produits, stock, commandes, ventes externes et clients ;
- partager des fiches qui restent à jour ;
- disposer d'une boutique web/mobile premium ;
- connecter ses propres moyens de paiement ;
- proposer ses règles de retrait/livraison ;
- accéder à des demandes d'acheteurs pertinentes ;
- convertir une proposition en commande de sa boutique ;
- utiliser CRM, analytics, automatisations et intégrations selon son plan.

### Plateforme
- vendre un logiciel et des capacités SaaS ;
- attirer la demande et faciliter la découverte ;
- protéger l'intégrité du réseau ;
- ne pas confondre orchestration commerciale et détention des fonds.

## 3. Différenciation

**Take App-like merchant autonomy + D02 demand marketplace.**

Le vendeur peut obtenir de la valeur sans trafic marketplace ; l'acheteur peut découvrir des vendeurs sans les connaître auparavant. Si l'offre n'existe pas, la demande peut faire émerger l'offre. Cette boucle demande → proposition → commande de boutique est le mécanisme le plus différenciant à valider.

## 4. Parcours principal — offre trouvée

Acheteur → recherche/partage → fiche d'offre → boutique du vendeur → panier vendeur → checkout vendeur → moyen PSP/manual du vendeur → confirmation technique/déclaration → fulfillment vendeur → suivi.

## 5. Parcours distinctif — demande

Acheteur → besoin structuré → matching → propositions → comparaison → choix du vendeur → création de commande dans sa boutique → checkout de cette boutique → fulfillment.

## 6. Parcours vendeur hors marketplace

Vente physique/sociale → vendeur saisit/POS → stock mis à jour → client/historique → rapport séparant origine interne/externe. La plateforme reste utile même lorsque l'acquisition vient de Facebook, WhatsApp, boutique physique ou autre canal.

## 7. Trust layer

La marketplace publique nécessite plus que les boutiques autonomes :
- vérification de l'identité/entreprise selon marché ;
- badges à périmètre explicite ;
- avis et historique ;
- taux d'annulation/fulfillment factuels ;
- signalement et modération ;
- catégories à risque sous règles spécifiques ;
- preuve de livraison ou tracking si utilisé ;
- politiques vendeur visibles.

Pas de garantie d'authenticité universelle sans procédure et preuve correspondantes.

## 8. Expansion fonctionnelle inspirée de Take App

Le socle doit rester extensible vers : custom domains, SEO, multi-store, staff, CRM, fidélité, POS, wholesale, digital, booking/subscriptions, WhatsApp Business, workflows, API/webhooks, integrations et analytics. Ces fonctions sont évaluées dans l'audit concurrentiel ; elles ne sont pas toutes un prérequis au premier build.

## 9. Modèle économique

SaaS freemium/Business/Enterprise + add-ons. Les paiements de produits ne constituent pas automatiquement un revenu plateforme. Le vendeur paie pour la puissance du logiciel, les capacités avancées et les consommations.

## 10. Marchés

Bénin d'abord commercialement ; architecture multi-marché. Chaque pays active ses PSP, catégories, devises et règles. Un utilisateur peut appartenir à un compte global mais opérer dans un marché explicitement choisi. Le transfrontalier reste une capacité future conditionnelle.

## 11. Ce que V2 retire par défaut

- custody de fonds marchands ;
- escrow géré par la plateforme ;
- split payout multi-vendeur ;
- flotte/logistique propriétaire ;
- responsabilité implicite d'authenticité de tous les biens ;
- commission obligatoire par vente.

Ces capacités pourraient exister un jour uniquement comme modules séparés avec partenaires et cadre adaptés ; elles ne sont plus une hypothèse de fonctionnement de base.
