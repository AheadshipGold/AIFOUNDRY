# UX/UI BLUEPRINT — PLATEFORME DE COMMERCE ACTIF D01 + D02

**Version : 0.1 — étape 5, structure et parcours, avant design visuel haute fidélité**  
**Date :** 25 septembre 2026.  
**Sources :** PRD v0.4 (FR-01 à FR-70) et architecture v0.2.  
**Nature :** dossier de conception exploitable, **non maquettes visuelles finalisées et non application construite**. Les valeurs commerciales, noms, pays et prestataires non décidés restent des données de test clairement fictives.  
**Obligations :** APK Android produit via Flutter comme stack candidate de référence, acheteur + vendeur dans une même identité, français ET anglais, physique + numérique, accès depuis liens sociaux, pas d'affiliation rémunérée ni d'API sociales.

---

## 1. Idée directrice de l'expérience

L'utilisateur n'a pas à comprendre nos tables `orders`, `reservations`, `payment_intents` et `fulfillment_obligations`. Il doit savoir : **ce que je cherche / ce que je propose / ce que nous avons convenu / ce qui se passe / ce qu'il me reste à faire**.

- **Acheteur :** découverte utile, recherche et expression d'un besoin ; comparaison ; achat éclairé ; réception et réclamation.
- **Vendeur :** activité et décisions du jour ; produits, clients, stocks, demandes pertinentes, commandes, approvisionnement et résultats.
- **Fournisseur :** même système que vendeur, mais relation B2B et confidentialité des marges revendeur.
- **Créateur numérique :** vendeur avec édition fichiers/licences, bibliothèque des acheteurs et traitement des échecs d'accès.
- **Visiteur social :** atterrit sur **la fiche précise**, comprend la proposition avant d'installer ou s'inscrire.

**Règle d'ergonomie :** ne pas multiplier les tableaux de bord génériques, ni afficher comme disponibles des actions bloquées par paiement/corridor. Chaque état doit annoncer un sens et une prochaine action réelle.

---

## 2. Navigation et bascule multi-rôle

### APK : navigation acheteur

```text
Acheter
 ├── Découvrir / Recherche / Catégories
 ├── Fiche offre et boutique
 ├── Comparer / Panier selon modalités admissibles
 └── Exprimer un besoin
Mes demandes
 ├── Mes besoins / réponses / propositions
 └── Comparaison / acceptation / quantité restante
Mes achats
 ├── Commandes / paiements / remise / accès numériques
 └── Incidents / retours / avis facultatif
Moi
 ├── Profil, FR / EN, préférences, confidentialité
 ├── Listes / budgets / achats récurrents
 └── Passer à ma boutique / créer une boutique
```

### APK : navigation vendeur (même compte, contexte de boutique visible)

```text
Ma boutique
 ├── À faire aujourd'hui : commandes, demandes, stock, incidents
 ├── Catalogue / Offres / Variantes / Partage
 ├── Stock / Mouvements / Ventes extérieures
 ├── Demandes pertinentes / Propositions
 ├── Commandes / Exécution / Clients consentants
 ├── Fournisseurs / Achats B2B / Réceptions
 ├── Produits numériques / Fichiers / Licences
 └── Résultats / Marge renseignée / Activité
Moi / Paramètres boutique
 ├── Accès collaborateurs / Vérification
 ├── Politiques / Pays & moyens disponibles
 └── FR / EN / Notifications
```

Une boutique n'apparaît pas comme « compte acheteur différent ». Si l'utilisateur gère plusieurs boutiques, le contexte actif est sélectionné explicitement et affiché dans l'en-tête vendeur. Sur un lien d'offre, le retour après login maintient `offer_id + variant` sans exposer de token personnel dans l'URL.

**Structure mobile à tester :** navigation principale peu profonde, action contextuelle « Exprimer un besoin » depuis recherche ; sur vue vendeur accès rapide « Ajouter produit », « Enregistrer une vente », « Examiner une demande ». Ne pas présumer qu'il faut huit onglets permanents : regrouper dans les espaces d'intention et tester sur écran Android milieu de gamme.

---

## 3. Inventaire des écrans à prototyper

`Screen ID` sert de référence stable entre UX, PRD, backlog et QA ; ce ne sont pas des pages web ou routes techniques obligatoires.

| ID | Écran / intention | Accès | Données | États/erreurs principaux | PRD / preuve |
|---|---|---|---|---|---|
| S01 | Accueil découverte | visiteur/acheteur | offres publiques, catégories | vide, lenteur, hors zone | FR-18/19 T02 |
| S02 | Recherche résultats | visiteur/acheteur | critères, offres | aucune correspondance → demande | FR-18/20 T08 |
| S03 | Besoin guidé IA ou manuel | acheteur | texte libre, champs confirmés | IA indisponible, budget absent | FR-20/24 T08 |
| S04 | Mes demandes | acheteur | état, quantité, propositions | expirée, retirée, satisfaite partiellement | FR-21/23 T11 |
| S05 | Détail demande / réponses | acheteur | besoin, vendeurs, offres | vendeur retire, prix expire | FR-23/26 T11 |
| S06 | Comparer propositions | acheteur | coût, livraison, validité, stock | coût inconnu « à confirmer » | FR-19/23 T11 |
| S07 | Offre publique | tous | prix/devise courants, variantes, conditions | ancien lien, épuisé, sur commande | FR-06…11/48…50 T02 |
| S08 | Boutique publique | tous | données autorisées, offres | suspendue, vide | FR-02/03 T04 |
| S09 | Récapitulatif accord | acheteur | version contrat, frais, langue | modification en cours | FR-27/29/30 T11 |
| S10 | Réservation / paiement | acheteur | qty, route réellement éligible | plus de stock, pending, route impossible | FR-14/32…35 T03/T05 |
| S11 | État commande acheteur | acheteur | paiement, exécution, incident séparés | paiement inconnu, délai dépassé | FR-31/38…41 T10 |
| S12 | Bibliothèque numérique | acheteur | droits licences, accès | URL expirée, téléchargement KO | FR-42…47 T07/T10 |
| S13 | Incident / support | partie autorisée | preuves, état, réponse | refus, réponse attendue | FR-52…55 T10 |
| S14 | Profil / préférences | tous | langue, paramètres confidentialité | permissions | FR-66…70 T01/T11 |
| S15 | Mes besoins récurrents | acheteur | liste et historique | pas de commande automatique | FR-61/62 T11 |
| S20 | Tableau d'action boutique | vendeur | commandes, stock, demandes, incidents | « aucune action », donnée insuffisante | FR-56/57 T11 |
| S21 | Initialiser boutique | vendeur | identité publique, politiques | données non validées / corridor désactivé | FR-01…05 T04 |
| S22 | Catalogue vendeur | vendeur | offres, statuts, variantes | brouillon, rupture, suspendu | FR-06…11 T02 |
| S23 | Créer/éditer offre | vendeur | descriptif, stock, prix, photos, IA draft | champ manquant, IA incertaine | FR-06…11/58 T08 |
| S24 | Stock et mouvements | vendeur autorisé | SKU, reçus, réservés, corrections | dernier SKU, synchro offline | FR-12…17 T03/T09 |
| S25 | Enregistrer vente extérieure | vendeur autorisé | source, quantité, montant déclaré | conflit synchro, pas de preuve PSP | FR-16/36 T09 |
| S26 | Demandes pertinentes | vendeur | besoin visible/critères | confidentialité, non pertinent | FR-22…24 T08 |
| S27 | Préparer proposition | vendeur | conditions, échéance, source stock/fournisseur | insuffisance stock, expiration | FR-25…28 T11 |
| S28 | Commandes vendeur | vendeur | listes, paiement, exécution | payé/non livré ; attente | FR-29…41 T10 |
| S29 | Exécuter physique | vendeur | délai, remise, preuve | impossible de remettre | FR-38…41 T10 |
| S30 | Fournisseurs / commande B2B | vendeur | fournisseur, coûts privés, statut | rupture, délai changé | FR-17/28 T11 |
| S31 | Gestion contenu numérique | vendeur numérique | fichiers, versions, licence, publication | droit non disponible, upload KO | FR-42…47 T07 |
| S32 | Résultats / marges | vendeur | source, coûts, incertitudes | coût absent « incomplet » | FR-57/63/65 T11 |
| S33 | Suivi clientèle | vendeur | historique consenti, suite SAV | pas d'opt-in / aucun contact | FR-52/64 T04 |
| S34 | Membres et permissions | propriétaire | rôles, accès, audit | refus modification sensible | FR-04/05 T04 |
| S40 | Page web d'offre | visiteur externe | offre réelle publique FR/EN | APK absent, supprimé, mis à jour | FR-48…50/70 T02 |
| S41 | Page web boutique | visiteur externe | identité publique/offres | désactivée / non publiée | FR-02/49 T02 |
| S42 | Entrée / login / retour | acheteur | URL retour interne sécurisé | redirection invalide, pas d'APK | FR-01/49 T02 |

**Fonction plateforme opérateur :** gestion pays/politiques, incidents et modération à produire comme espace distinct et fortement autorisé ; ne pas l'exposer sous « ma boutique ». Choix interface interne sécurisé selon faisabilité et ressources, mais l'administration n'est pas un simple accès service-role dans APK public.

---

## 4. Sept parcours UX détaillés et erreurs à rendre visibles

### UX-01 : offre vue depuis un réseau social → acheteur

```text
Lien partagé → S40 offre actuelle FR/EN
 ├─ APK présent → S07 même offre/variante
 └─ APK absent → rester sur fiche publique, action installer/ouvrir si souhaité
S07 → prix/stock/conditions actualisés → S09 → S10 si route éligible → S11
```

L'utilisateur ne voit jamais « paiement garanti » si le corridor est inactif. Prix de l'ancien aperçu social et fiche différents : message « Les conditions ont été actualisées / Offer details have changed » + demande de confirmer. Offre épuisée : « Exprimer un besoin / Post a request » quand autorisé.

### UX-02 : recherche infructueuse → plusieurs vendeurs → commande

```text
S02 zéro offre adaptée → S03 saisie libre
→ champs suggérés IA MAIS modifiables → validation → S04 demande active
→ S05 propositions distinctes → S06 comparaison → S09 accord exact
→ création d'une seule commande du vendeur choisi → S11 suivi
```

Le prix total distingue prix, frais connus et éléments « à confirmer » ; chaque proposition indique expiration et nature en stock/sur commande. Quantité partielle : demande reste ouverte pour la quantité restante selon choix du client ; aucune deuxième acceptation automatique.

### UX-03 : vendeur utilise l'application même sans vente marketplace

```text
S21 boutique → S23 fiche offre → S22 catalogue → Partager
S25 vente physique existante → S24 même stock actualisé
S20 tâche de réapprovisionnement si stock faible → S30 commande fournisseur
```

Une vente cash extérieure porte « déclaré par vendeur / recorded by seller », pas « payé via la plateforme / paid through platform ». Une saisie hors ligne est « en attente de synchronisation / pending sync », sans stock garanti.

### UX-04 : commerçant répond grâce à son fournisseur

```text
S26 demande → S30 vérifier fournisseur/conditions privées
→ S27 proposition « sur commande / made to order » → S09 accord acheteur
→ commande client S28 distincte de commande fournisseur S30
```

Rupture fournisseur : S28 montre « Réponse requise / Response required » ; avenant de délai ou alternative nécessite accord acheteur. Ne jamais rendre public le prix fournisseur.

### UX-05 : produit numérique → droit → bibliothèque

```text
S07 type numérique et licence → S09 licence/conditions → S10 route autorisée
→ S11 paiement confirmé → S12 droit d'accès → téléchargement
```

Si lien expiré : « Générer un nouvel accès / Get a new access link ». Si le paiement est en attente : S12 ne montre pas un accès payé fictif. Produit personnalisé : « date de fourniture / delivery date » au lieu de bouton « télécharger » anticipé. Le cadre de paiement Play/PSP exact reste une porte d'activation, pas une astuce de redirection web.

### UX-06 : paiement/livraison difficile

```text
S10 PENDING → attente et état stable malgré retour en arrière
 → CONFIRMED OU REVIEW_REQUIRED, jamais auto-succès depuis capture
S11 payé + remis au transporteur + non reçu → S13 incident
 → vendeur S28/S29 répond → résolution selon politique réelle
```

Remboursement `requested` / `processing` / `confirmed` doivent être des libellés distincts. Paiement tardif sur réservation épuisée : message de traitement et dossier, pas promesse automatique de livraison ou de remboursement.

### UX-07 : même transaction, deux langues

Acheteur FR → S03/S06/S09/S11 en français ; vendeur EN → S27/S28 en anglais. `offer_id`, prix, devise, variante et accord restent identiques. Contenu libre saisi par utilisateur reste dans sa langue d'origine **sauf traduction explicitement demandée et identifiée**. La version/langue des conditions acceptées est conservée.

---

## 5. États d'écran standard — à appliquer partout

| État | Comportement UX requis |
|---|---|
| `loading` | squelette/indicateur, pas de flash d'ancien prix |
| `empty` | raison compréhensible et action contextuelle si réelle |
| `ready` | données source + timestamp/confirmation si pertinents |
| `error_retryable` | conserver saisie, réessayer sans dupliquer commande |
| `error_final` | expliquer pourquoi et donner une suite autorisée |
| `offline` | consultation locale éventuellement ; toute action stock/paiement = non confirmée |
| `pending_payment` | informer que traitement continue, ne pas proposer paiement doublon à l'aveugle |
| `stock_conflict` | mise à jour disponibilité et autre choix, pas promesse conservée |
| `policy_blocked` | disponibilité géographique ou catégorie honnête, pas checkout fictif |
| `access_issue` | droit affiché + tentative renouvelée ou support |

Aucune action engageante n'est actionnée par IA ou par simple changement de langue. Les boutons désactivés expliquent la raison ; ne pas utiliser une animation de succès pour une commande en attente.

---

## 6. Wireframes textuels — disposition fonctionnelle, pas style figé

### Fiche d'offre S07 (APK)

```text
[←]                       [Partager]
[Image produit / variantes]
[Titre]                         [Devise + prix actuel]
[En stock selon vendeur | À confirmer | Sur commande]
[Vendeur et indication précise de vérification]
[Choix variante / quantité]
[Frais connus · mode de remise · délai / licence]
[Conditions + version]
[Demander une précision]    [Réserver / Continuer si admissible]
[Autres offres / Exprimer besoin si indisponible]
```

### Recherche sans résultat S02 → S03

```text
[Recherche : « ... »]
[Aucune offre correspondant à tous vos critères]
[Modifier filtres]
[Décrire ce que je recherche]
[Texte libre : FR / EN]
[IA : proposition de critères, champs non déduits laissés vides]
[Mon budget, ma zone, mon délai] [Modifier]
[Confirmer et publier la demande (visibilité expliquée)]
```

### Tableau vendeur S20

```text
[Ma boutique ▼]   [FR/EN] [Notifications]
[Aujourd'hui : 2 commandes à traiter | 1 demande pertinente | 1 incident]
[Ajouter une offre] [Enregistrer une vente]
[À faire : chaque carte ouvre la commande/le besoin exact]
[Catalogue] [Stock] [Commandes] [Approvisionnement]
[Résultats : données réelles / éléments incomplets identifiés]
```

### Résumé avant commande S09 et état commande S11

```text
[Produit, variante, vendeur contractuel]
[Prix dans devise de l'offre / frais connus / montant final ou à confirmer]
[Disponibilité et mode réel de remise ou licence]
[Conditions et langue acceptées]
[Confirmer l'accord]
---- après commande ----
[Commande acceptée] [Paiement : en attente / confirmé / examen]
[Exécution : en préparation / remis / reçu / droit accordé]
[Prochaine action + délais pertinents]
[Ouvrir incident si nécessaire]
```

---

## 7. Design system, bilinguisme et expérience mobile

**Direction visuelle à concevoir :** interface commerciale fiable, claire, premium et mobile-first ; l'élégance doit aider à comparer, accepter et suivre une transaction, pas cacher l'état réel derrière des dégradés ou des cartes décoratives. La charte (marque, palette, typographie, iconographie) n'est pas encore décidée ; ne pas inventer un logo définitif.

**Composants communs :** `OfferCard`, `OfferStatus`, `CurrencyAmount`, `PolicyHint`, `VendorSummary`, `NeedCriteria`, `ProposalComparisonRow`, `ReservationCountdown`, `PaymentState`, `FulfillmentTimeline`, `DigitalEntitlementCard`, `ActionRequired`, `ContextError`, `LocaleSwitcher`, `OfflineBanner`.

**Bilinguisme :** FR/EN sur chaque libellé plateforme, état, erreur, notification transactionnelle et écran web ; même code statut API et mêmes identifiants. Ajuster largeur de bouton et coupures de mots. Dates/heures locales, devises de l'offre intactes. Textes contractuels versionnés par langue ; ne jamais mélanger une traduction obsolète à un accord plus récent.

**Accessibilité :** contraste lisible, tailles de toucher adaptées, lecteurs d'écran pour statuts essentiels, ne pas coder les états seulement par couleur, persistance du choix de langue, champs du clavier mobile adaptés (nombre/devise/adresse). Les performances doivent être évaluées sur un téléphone Android milieu de gamme et une connexion variable.

---

## 8. Matrice d'acceptation UX FR/EN

| Vérification | FR | EN | Critère |
|---|---|---|---|
| Offre actuelle depuis lien partagé | À tester | À tester | même offre et mêmes chiffres |
| Besoin créé sans IA | À tester | À tester | IA facultative et champs conservés |
| Besoin créé avec IA | À tester | À tester | données non inventées, validation utilisateur |
| Plusieurs propositions comparées | À tester | À tester | conditions et coûts intelligibles |
| Réservation perdante | À tester | À tester | pas de double vente ni message mensonger |
| Vente extérieure / conflit offline | À tester | À tester | origine et attente visibles |
| Paiement pending / review | À tester | À tester | aucune fausse confirmation |
| Numérique droit/erreur accès | À tester | À tester | droit conservé |
| Livraison échouée / incident | À tester | À tester | paiement et fourniture distincts |
| Contrôle d'accès boutique | À tester | À tester | aucune fuite inter-boutiques |

**Tous les tests sont à exécuter.** La grille ne constitue pas une preuve qu'un prototype visuel, une interview utilisateur ou un APK existent déjà.

---

## 9. Travail immédiatement transmissible à Cursor et aux agents

**Ordre de production :** (1) shell de navigation + design tokens provisoires + i18n ; (2) composants transactionnels et erreurs standard ; (3) S07/S40 ↔ App Link ; (4) S03/S05/S06/S09 demande→offre→commande ; (5) S20/S23/S24/S25 commerce vendeur ; (6) S10/S11/S12/S13 paiement/fourniture/incidents conditionnels ; (7) fonctionnalités fournisseur, récurrence, rapports et accès collaborateurs ; (8) scénarios FR/EN et maquettes de tous les états.

Avant chaque tâche Cursor : renseigner `FR`, `screen_id`, contrat API, entités autorisées, cas normal + erreur, textes FR/EN, tests automatisés et preuve visuelle sur Android. Un agent UI ne doit pas inventer les API ni un agent backend les politiques de paiement ; travailler contre les contrats de l'architecture 0.2.

**Prochaine livraison de design** : maquettes haute fidélité par parcours prioritaires et design system visuel après vérification sur téléphone ; ne pas confondre blueprint et écrans finaux. En parallèle : lancer POC T01–T04 pour confirmer l'architecture et rechercher les preuves PSP/Play des flux monétaires.

---

## 10. Point de progression

- Étape 1 idéation/concept : consolidée.
- Étape 2 économique : cadrage analytique terminé ; preuves terrain/contractuelles en parallèle.
- Étape 3 PRD : v0.4 rédigée, 70 exigences ; portes externes explicites.
- Étape 4 architecture : **v0.2 conçue, non encore démontrée par POC exécutés**.
- Étape 5 UX/UI et préparation build : **blueprint v0.1 rédigé ; maquettes visuelles et backlog d'implémentation détaillé à réaliser**.
