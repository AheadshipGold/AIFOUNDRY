# PAIEMENTS, ABONNEMENTS & MERCHANT FINANCIAL OPERATIONS — V1.0

**Statut :** spécification normative complémentaire au PRD V0.8.  
**Objectif :** séparer les flux d'argent, simplifier le paiement pour les petits commerçants et automatiser leur suivi quotidien sans rendre notre société custodian des ventes.

## 1. Deux systèmes financiers distincts

### 1.1 Vente marchande
Acheteur → moyen de paiement de la boutique → vendeur.  
Notre plateforme orchestre commande, statuts, reçus techniques, journal et rapports ; elle ne garde pas les fonds par défaut.

### 1.2 Abonnement SaaS
Commerçant → notre société.  
APK : Play Billing lorsque requis. Web : checkout propre orchestré via Moneroo et les gateways/méthodes connectées à notre compte.

## 2. Méthodes de paiement d'une boutique

### 2.1 Directes/manuelles — obligatoires au socle
- MTN Mobile Money direct selon marché ;
- Moov Money direct selon marché ;
- Celtiis Cash au Bénin si applicable ;
- virement bancaire ;
- cash on delivery ;
- paiement au retrait.

Le vendeur saisit les instructions du moyen, son titulaire et les informations utiles. Le client peut déclarer le paiement et joindre référence/reçu ; le vendeur confirme après vérification réelle.

### 2.2 Liens/pages de paiement — option intermédiaire
Une boutique peut enregistrer un lien/page de paiement d'un PSP si le provider le permet. Tant qu'aucune connexion backend authentifiée n'existe, le résultat reste semi-automatique et nécessite confirmation vendeur.

### 2.3 Automatique — option professionnelle
Le backend utilise une connexion marchand approuvée, reçoit un webhook signé, revérifie montant/devise/bénéficiaire/référence et marque `provider_confirmed` exactement une fois.

**UX obligatoire :** ne pas demander à un commerçant ordinaire de comprendre API keys ou webhooks. Priorité aux parcours `Connecter mon compte`/partner onboarding. La saisie de credentials est une option avancée, chiffrée côté serveur et jamais réaffichée.

## 3. États et sources de vérification

`payment_status` : `NOT_STARTED`, `DECLARED`, `PENDING`, `PARTIALLY_PAID`, `CONFIRMED`, `FAILED`, `REFUND_PENDING`, `REFUNDED`, `CANCELLED`, `REVIEW_REQUIRED`.

`verification_source` : `PROVIDER`, `SELLER_MANUAL`, `COD`, `PICKUP`, `BANK_MANUAL`, `UNKNOWN`.

Une commande peut être `FULFILLED` sans paiement provider si mode COD ; un paiement confirmé ne signifie pas livraison réussie.

## 4. Paiements partiels et créances

Toute vente possède :
- `gross_sale_amount` ;
- `amount_received` ;
- `amount_outstanding` ;
- `refund_amount` ;
- `net_collected`.

Exemple : vente 500 000 XOF, reçu 200 000, reste 300 000. Le chiffre de vente et l'encaissement ne sont jamais fusionnés.

## 5. Cashbook / journal financier

Chaque encaissement ou correction crée un événement append-only :
- `SALE_CREATED` ;
- `PAYMENT_DECLARED` ;
- `PAYMENT_CONFIRMED` ;
- `PARTIAL_PAYMENT_CONFIRMED` ;
- `COD_COLLECTED` ;
- `REFUND_REQUESTED` ;
- `REFUND_CONFIRMED` ;
- `ADJUSTMENT_POSTED` ;
- `DAY_CLOSED`.

Les erreurs sont corrigées par événement inverse/ajustement, pas par suppression silencieuse.

## 6. Tableau de bord quotidien

Le vendeur voit au minimum :
- ventes du jour ;
- montant encaissé ;
- montant en attente ;
- ventilation MTN/Moov/Celtiis/carte/banque/cash/PSP ;
- remboursements ;
- paiements partiels/créances ;
- nombre d'articles vendus ;
- stock faible/ruptures ;
- transactions à vérifier ;
- ventes par collaborateur, canal et produit lorsque disponible.

## 7. Clôture de journée

Le système calcule les totaux ; le vendeur ne refait pas les additions. Il peut :
- confirmer que les montants correspondent ;
- ouvrir la liste des écarts ;
- ajouter une note/ajustement audité ;
- clôturer la journée.

Une clôture ne verrouille pas illégalement les corrections ultérieures ; les corrections restent auditables.

## 8. Rapprochement

### PSP connecté
Automatique à partir des webhooks + requête de vérification API si nécessaire.

### Mobile Money direct / cash / banque manuelle
Rapprochement basé sur déclarations et confirmations vendeur, avec statut explicite `manual`.

Rapport : `expected`, `confirmed`, `pending`, `difference`, `transactions_to_review`.

## 9. Frais
Le vendeur choisit de supporter ou répercuter les frais seulement lorsque la passerelle et les règles applicables l'autorisent. Le calcul est affiché avant confirmation client.

## 10. Remboursements
- PSP : via connexion du vendeur, confirmation asynchrone ;
- manuel : action externe du vendeur + statut déclaré ;
- notre admin peut suivre/modérer mais ne fabrique pas un remboursement bancaire.

## 11. SaaS billing

### Play
Validation backend du purchase token/subscription ; mapping vers le même entitlement interne.

### Web
Moneroo est la couche d'orchestration de notre entreprise : une intégration, plusieurs gateways/méthodes compatibles selon notre compte et marché. Moneroo n'est pas traité comme PSP ni comme compte marchand vendeur.

### Entitlement
`saas_subscription(shop/account, plan, source, state, current_period_end, external_ref)` ; le client mobile/web lit l'entitlement backend.

## 12. Limite de périmètre
Cette V1 n'est pas un logiciel de comptabilité générale/fiscale. Elle fournit gestion commerciale, caisse, ventes, encaissements, créances, remboursements, stock, marge si coût connu, rapports et exports. Les intégrations comptables avancées pourront venir ensuite.
