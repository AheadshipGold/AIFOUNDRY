# AI FOUNDRY — ANALYSE COMBINÉE DES DOMAINES D01 + D02
## Commerce, vente et distribution de produits × Achats, consommation et recherche de bonnes affaires

**Version documentaire :** 0.9 — document de référence évolutif  
**Date de création :** 24 septembre 2026  
**Statut :** analyse initiale conservée ; hypothèse de produit à approfondir, non validée commercialement  
**Référentiel :** `Atlas_AI_Foundry_V4_48_Domaines_Premium.html`, domaines D01 et D02 ; consultation croisée de `Cartographie_36_domaines_activites_actions_frictions.md` pour les intitulés et frictions.  
**Contexte :** recherche d'une application Android native pour AI Foundry, avec ambition de bâtir un produit utile, différenciant, durable et commercialisable.  
**Nature du document :** analyse structurée et registre de suivi, accompagnés en ANNEXE A de la première réponse de conversation demandée par Abraham et en ANNEXE B de la nouvelle évaluation détaillée sur la différenciation, et en ANNEXE C de l’évaluation suivante portant sur les huit dimensions, les propositions de mécanismes et la synthèse en trois systèmes. L’ANNEXE D conserve l’évaluation corrigée de l’ouverture de la marketplace aux réseaux sociaux, sans affiliation rémunérée ni connexions API sociales à ce stade. Les ANNEXES E, F et G consignent respectivement la progression annoncée, les cinq parcours commerciaux examinés et les mécanismes de continuité entre opérations ; l’ANNEXE H audite leur cohérence à la v0.6. L'ANNEXE I prolonge l'analyse par cinq cas difficiles, l'ANNEXE J consigne la feuille de route resserrée jusqu'à la construction, l'ANNEXE K clarifie les statuts à la v0.7, l'ANNEXE L consolide le concept produit, l'ANNEXE M commence l'évaluation commerciale et économique et l'ANNEXE N finalise le cadrage économique pré-PRD sans inventer des preuves de marché ou d'accord contractuel. Ce n'est ni un PRD approuvé, ni une étude de marché terminée, ni une liste figée de fonctionnalités.

> **Mise à jour prioritaire v0.5 :** le fondateur a corrigé le périmètre de la réflexion sur les réseaux sociaux : reconnaître leur rôle et faciliter le passage d’une offre partagée vers le commerce, **sans programme d’affiliation à codes/commissions et sans connexion API aux réseaux sociaux pour le moment**. Voir annexe D ; ses corrections explicites priment sur les hypothèses antérieures ou les propositions orales incompatibles.

> **Mise à jour prioritaire v0.6 (25 septembre 2026) :** intégration groupée des trois développements depuis la v0.5, à la demande du fondateur : feuille de progression (annexe E), épreuve de cinq parcours (F), mécanismes de continuité métier (G), contrôle de cohérence (H). **L'état le plus récent et le prochain travail figurent en H.4 ; les anciens « points de reprise » sont conservés comme jalons historiques et ne doivent pas être suivis à la place de H.4.** Aucune intégration API sociale, affiliation rémunérée ou découpe artificielle de V1 n'est réintroduite.

> **Mise à jour prioritaire v0.7 (25 septembre 2026) :** ajout des règles proposées pour cinq échecs ou conflits de parcours (annexe I), de la feuille de route en cinq étapes vers le développement (annexe J) et d'un contrôle de statut et de cohérence (annexe K). **Le point de reprise en vigueur figure en K.4**, qui remplace H.4 comme jalon courant sans supprimer l'historique. L'analyse des incidents est conceptuelle ; les règles financières, juridiques et techniques restent à établir et à tester.

> **Mise à jour prioritaire v0.8 (25 septembre 2026) :** l’ANNEXE L consolide la définition conceptuelle après la v0.7 ; l’ANNEXE M commence immédiatement l’étape 2 (validation commerciale et économique) par des éléments documentaires vérifiés, des hypothèses de clientèle, une stratégie d’amorçage, les modèles de revenus à tester, les dépendances de paiement et un protocole terrain exécutable. **Le point de reprise en vigueur est M.9** ; K.4 est conservé comme jalon historique, pas comme prochaine étape à répéter. La consolidation de l’idéation ne vaut pas validation commerciale ; les hypothèses nouvelles de M ne sont pas des décisions produit du fondateur.

> **Mise à jour prioritaire v0.9 (25 septembre 2026) :** l'ANNEXE N audite le volet économique avant PRD et ajoute les coûts unitaires, revenus réellement gagnés, responsabilités financières, détails publics de FedaPay et leurs limites, règles Google Play pour les produits numériques, fiscalité internationale et protocole de validation. **Le point de reprise en vigueur est N.10 : étape 3 — PRD**, sans prétendre que des clients ont été interrogés, que la tarification est approuvée ou qu'un prestataire de paiement s'est engagé. Les points de reprise de M et antérieurs sont conservés comme jalons historiques.

> **Principe de conservation :** lors de chaque évolution, préserver les observations antérieures, distinguer les décisions confirmées des propositions et des hypothèses, dater les ajouts et expliquer les corrections. Ne pas réécrire rétroactivement une hypothèse comme si elle avait déjà été validée.

---

# 1. L'intuition de départ : une seule application, deux côtés d'une même économie

L'idée initiale du fondateur est de rapprocher deux domaines qui constituent des parties complémentaires de l'activité commerciale :

- **D01 — Commerce, vente et distribution de produits :** tout ce qui permet au commerçant de préparer, organiser, vendre, encaisser, livrer et entretenir son activité.
- **D02 — Achats, consommation et recherche de bonnes affaires :** tout ce qui permet au consommateur d'exprimer un besoin, de trouver une offre, de comparer, d'acheter et de recevoir un produit.

Le domaine 1 ressemble à l'espace de gestion du vendeur dans une application de commerce, mais il couvre davantage qu'un simple « back-office » : il constitue le moteur opérationnel du commerce. Le domaine 2 ressemble à l'expérience visible par l'acheteur, mais il couvre davantage qu'un catalogue : c'est le parcours complet qui mène d'un besoin réel à un achat satisfaisant.

**Question centrale :** pourquoi ne pas concevoir une seule application dans laquelle les besoins des acheteurs et le fonctionnement réel des vendeurs se répondent, jusqu'à former un système commercial cohérent ?

### Hypothèse de produit à approfondir

**Une plateforme de commerce qui fait fonctionner ensemble l'achat et la vente.**

- **Pour le vendeur :** gérer son activité commerciale et accéder à des clients.
- **Pour l'acheteur :** trouver ce dont il a besoin, choisir une offre adaptée et acheter dans de bonnes conditions.
- **Pour les deux :** disposer d'un parcours commun, depuis la recherche ou la publication d'un produit jusqu'à la transaction, la remise et le suivi.

**Statut :** proposition conceptuelle issue de l'analyse D01 + D02 ; elle ne constitue pas encore une décision de construire cette application, ni une validation de son marché.

---

# 2. Ce que représente réellement le domaine D01

## D01 — Commerce, vente et distribution de produits

Le vendeur ne cherche pas seulement à poster une annonce. Il cherche à **faire fonctionner et développer un commerce**.

Le référentiel décrit dix activités :

| Référence | Activité exacte de l'Atlas |
|---|---|
| D01-A01 | Choisir une gamme de produits |
| D01-A02 | Rechercher et sélectionner des fournisseurs |
| D01-A03 | Commander et recevoir du stock |
| D01-A04 | Fixer et réviser les prix |
| D01-A05 | Présenter et publier un produit |
| D01-A06 | Répondre et conseiller les clients |
| D01-A07 | Enregistrer et exécuter une commande |
| D01-A08 | Encaisser et rapprocher les ventes |
| D01-A09 | Organiser une livraison ou remise |
| D01-A10 | Gérer retours réclamations et fidélisation |

### Traduction possible en expérience commerçant

Un commerçant pourrait, dans un même espace :

1. Créer sa boutique et son catalogue.
2. Organiser ses produits, variantes, quantités et prix.
3. Gérer ses fournisseurs et réapprovisionnements.
4. Recevoir les demandes et conseiller les acheteurs.
5. Négocier, réserver et confirmer une commande.
6. Suivre les paiements, remises et livraisons.
7. Traiter les retours et retrouver ses clients.
8. Comprendre quels articles se vendent, lesquels manquent et lesquels intéressent les acheteurs.

### Ce que révèlent les frictions du domaine vendeur

Parmi les difficultés possibles répertoriées, on trouve notamment : un produit encore publié après sa vente ; une demande commerciale perdue dans les messages ; un même article réservé ou vendu deux fois ; un paiement difficile à rapprocher de la vente correspondante ; des erreurs de variante ; des informations contradictoires ; des difficultés à gérer livraison et réclamation.

**Interprétation de travail :** ces difficultés touchent le fonctionnement du commerce, pas uniquement la visibilité des articles. Une application réduite à « créer une boutique et publier un produit » ne représenterait donc pas toute la logique du D01.

> Les frictions de l'Atlas sont des hypothèses à confronter à la réalité de différents profils de commerçants. Elles ne démontrent pas encore leur fréquence, leur gravité ou leur coût.

---

# 3. Ce que représente réellement le domaine D02

## D02 — Achats, consommation et recherche de bonnes affaires

De son côté, l'acheteur ne veut pas, en premier lieu, « utiliser une marketplace ». Il cherche à obtenir un produit dont il a besoin, à un coût et dans des conditions qui lui conviennent.

Le référentiel décrit huit activités :

| Référence | Activité exacte de l'Atlas |
|---|---|
| D02-A01 | Définir un besoin d'achat |
| D02-A02 | Rechercher des produits et vendeurs |
| D02-A03 | Comparer prix et valeur réelle |
| D02-A04 | Vérifier un vendeur avant paiement |
| D02-A05 | Négocier et réserver un article |
| D02-A06 | Payer un achat |
| D02-A07 | Recevoir et contrôler un achat |
| D02-A08 | Gérer budget d'achat récurrent |

### Traduction possible en expérience acheteur

L'acheteur pourrait, dans le même produit numérique :

1. Rechercher un produit ou exprimer précisément ce qu'il cherche.
2. Découvrir des vendeurs et des boutiques accessibles.
3. Connaître le prix, les caractéristiques et la disponibilité.
4. Comparer le coût total, y compris le transport et les frais pertinents.
5. Vérifier les informations du vendeur et les conditions d'achat.
6. Poser des questions, négocier ou réserver.
7. Payer, retirer ou se faire livrer.
8. Suivre ses achats, ses éventuelles réclamations et ses besoins réguliers.

### Ce que révèlent les frictions du domaine acheteur

L'Atlas attire l'attention sur les offres invisibles hors d'un réseau personnel, les informations dispersées, l'incertitude sur le stock, les produits difficilement comparables, l'authenticité incertaine, l'identité ou la fiabilité du vendeur, les frais ajoutés tardivement, les réservations contestées, les problèmes de paiement, de remise et de réclamation.

**Interprétation de travail :** la découverte du produit n'est qu'un moment du parcours. Le résultat attendu est l'obtention du bon produit, selon un accord compréhensible, avec un suivi suffisant jusqu'à la réception et la résolution d'éventuels incidents.

---

# 4. Le point central : les activités des deux domaines se répondent

L'application envisagée n'est pas la juxtaposition d'un produit pour vendeurs et d'un produit pour acheteurs. Elle peut être **un système commercial partagé** dans lequel une même offre, une même demande ou une même transaction est comprise par les deux parties, chacune depuis son espace.

| Côté vendeur — D01 | Côté acheteur — D02 | Ce que l'application pourrait relier |
|---|---|---|
| Choisir les produits à vendre | Exprimer ses besoins | Les demandes des acheteurs et les décisions d'approvisionnement |
| Gérer le stock | Rechercher un produit disponible | Les quantités réellement déclarées et les offres visibles |
| Fixer les prix | Comparer les prix et coûts | Le prix du produit, les frais et les conditions |
| Présenter et publier | Rechercher et vérifier | Les informations du vendeur et du produit |
| Répondre et conseiller | Poser des questions et négocier | Une conversation liée à une offre précise |
| Enregistrer une commande | Réserver et acheter | Un accord commun sur l'article, le prix et le délai |
| Encaisser | Payer | Un paiement associé à une commande identifiable |
| Organiser la remise | Recevoir et contrôler | Le suivi de la même transaction des deux côtés |
| Gérer les réclamations | Signaler un problème | Un dossier commun avec les faits et les échanges |

### Lecture de ce tableau

Chaque ligne représente une connexion possible entre des activités qui existent déjà dans les deux domaines. Ce n'est pas une obligation de construire immédiatement neuf modules distincts. C'est une manière d'identifier les **relations de données et de travail** qu'une application pourrait rendre plus fluides.

L'information ne devrait pas être ressaisie de façon incohérente par le vendeur, l'acheteur et éventuellement le livreur. Les acteurs peuvent conserver leurs interfaces propres, mais partager une référence commune pour le produit, la commande, le paiement et la remise lorsque ces opérations sont prises en charge.

---

# 5. Ce qui pourrait rendre le produit plus intéressant qu'une simple application de petites annonces

### Situation illustrative

Une personne à Cotonou cherche un appareil précis. Elle ne sait pas quelle boutique le possède. Plutôt que de dépendre uniquement des annonces déjà vues et de contacts isolés, voici le parcours possible dans l'application envisagée.

1. **L'acheteur décrit le produit recherché.** Il peut préciser son budget, son quartier et ses exigences.
2. **L'application recherche les offres correspondantes.** Elle présente les vendeurs qui déclarent proposer ce produit, avec les informations disponibles ; ne pas confondre « déclaré disponible » et « stock confirmé ».
3. **Si aucune offre ne convient, la demande peut rester ouverte.** Des commerçants concernés pourraient recevoir cette demande et y répondre seulement s'ils sont capables de la satisfaire.
4. **Le vendeur répond depuis son espace commercial.** Il confirme le produit, la variante, le prix, la disponibilité et les possibilités de remise.
5. **L'acheteur compare et décide.** Il pose des questions, choisit une proposition, réserve ou achète.
6. **Les deux suivent la transaction.** Commande, paiement et remise sont reliés au lieu de dépendre uniquement d'une succession de messages sans suivi commun.
7. **Le commerçant apprend quelque chose de la demande.** Même une recherche non satisfaite pourrait donner une indication sur les produits recherchés qui manquent à son catalogue.

### La double circulation de l'information

**Offre → Demande :** un vendeur publie un article et trouve des acheteurs.  
**Demande → Offre :** un acheteur exprime un besoin et les vendeurs concernés peuvent y répondre.  
**Transactions → Amélioration :** achats, demandes non satisfaites et ruptures de stock peuvent aider les commerçants à mieux organiser leur activité.

Cette dernière connexion rapproche directement l'activité **D01-A01 — Choisir une gamme de produits** de l'activité **D02-A01 — Définir un besoin d'achat**.

**Hypothèse d'innovation :** la plateforme ne servirait pas uniquement à vendre ce qui est déjà affiché ; elle pourrait aussi rendre visibles les besoins auxquels les commerçants ne répondent pas encore et les aider à agir sur cette information.

**Statut :** idée à comparer aux plateformes existantes et à tester auprès de vendeurs et acheteurs. Aucune exclusivité technologique ni différenciation concurrentielle n'est démontrée à ce stade.

---

# 6. Reconnaître les solutions qui existent déjà

La combinaison « espace vendeur + espace acheteur » correspond à une forme connue de **marketplace / place de marché**. En soi, la présence des deux rôles n'est pas une innovation démontrée.

Des exemples examinés dans la discussion :

| Plateforme | Description publique utile à notre comparaison | Source | Réserve |
|---|---|---|---|
| GoMarket | Se présente comme un marché local au Bénin pour acheter, vendre et échanger, notamment par petites annonces. | https://www.gomarket.bj/ | Fonctionnalités et niveau d'adoption à éprouver dans l'application réelle ; ne pas reprendre sans contrôle les statistiques affichées par l'éditeur. |
| Zafara | Annonce des espaces acheteur, vendeur et livreur, ainsi que catalogue, commandes, paiement Mobile Money et livraison. | https://zafarabenin.fr/ | Description de l'éditeur, pas une vérification indépendante de chaque parcours en production. |
| CoinAfrique | Plateforme africaine de petites annonces ayant une présence indiquée au Bénin. | https://www.coinafrique.com/contactez-nous/ | Examiner les parcours locaux, fonctionnalités effectives et pratiques des utilisateurs avant d'affirmer une lacune. |

**Conséquence pour notre analyse :** réunir des vendeurs et des acheteurs ne suffit pas à constituer notre différence. Le travail d'innovation doit porter sur des écarts précis et vérifiables.

### Écarts à rechercher, sans les présenter encore comme acquis

- Disponibilité réelle et mise à jour soutenable des offres.
- Découverte et traitement des demandes non satisfaites.
- Passage entre boutiques physiques et commerce numérique.
- Suivi des accords, réservations, paiements et transactions.
- Utilisation des informations d'achat pour améliorer l'approvisionnement et les décisions commerciales.

Nous ne devons pas affirmer qu'aucun concurrent ne couvre ces besoins sans tests comparatifs réels.

---

# 7. Une application commune, des expériences adaptées

## Espace « Acheter »

Recherche, comparaison, demandes d'achat, réservations, commandes, paiements et suivi.

## Espace « Vendre »

Boutique, produits, stock, clients, demandes, commandes, encaissements et suivi commercial.

Ces deux espaces pourraient fonctionner dans **la même application Android**, sur un système de données relié. Un même compte pourrait avoir les deux rôles : un commerçant est aussi parfois acheteur, notamment lorsqu'il cherche des fournisseurs pour son réapprovisionnement.

La logique n'est pas d'obliger un commerçant à abandonner sa boutique physique ou ses habitudes pour utiliser le produit. L'application pourrait l'aider à faire fonctionner un commerce existant tout en lui ouvrant un canal d'achat et de vente numérique.

**Conclusion de cette section :** c'est plus large qu'une simple vitrine en ligne ; c'est une proposition de continuité entre activités commerciales physiques et numériques.

---

# 8. Les quatre questions décisives avant de conclure à une véritable opportunité

### 8.1 Disponibilité

Comment s'assurer que les offres présentées correspondent aux stocks réels, sans imposer au commerçant une charge de mise à jour qu'il abandonnera ? Une déclaration de stock ne constitue pas à elle seule une preuve ; prévoir la différence entre information fournie, information confirmée et information périmée.

### 8.2 Confiance et exécution

Comment vérifier les informations pertinentes, organiser les paiements et traiter les incidents sans faire de promesses que la plateforme ne peut pas tenir ? La responsabilité réelle de chaque acteur et les moyens de preuve devront être définis.

### 8.3 Adoption

Pourquoi un vendeur et un acheteur utiliseraient-ils cette application plutôt que de continuer seulement avec leurs contacts, Facebook ou leurs boutiques habituelles ? Quelle amélioration concrète justifie l'effort d'inscription, de publication, de suivi et de changement d'habitude ?

### 8.4 Viabilité commerciale

Quelle valeur les vendeurs retireraient-ils du système ? Quels revenus pourraient financer durablement l'exploitation, les paiements éventuels, le support et la croissance ? Ne pas confondre volonté déclarée d'utiliser l'application et volonté réelle de payer.

### La difficulté des deux populations

Une plateforme qui relie deux populations doit réunir des offres suffisamment utiles pour attirer les acheteurs **et** une demande suffisamment réelle pour attirer les vendeurs. Son démarrage est donc un problème produit et commercial à étudier autant que ses fonctionnalités.

---

# 9. Synthèse du concept D01 + D02

## Une application qui connecte les besoins d'achat au fonctionnement réel des commerces

**Promesse côté acheteur :**

> « Trouve ce dont tu as besoin, découvre des offres adaptées et va jusqu'à l'achat avec des informations claires. »

**Promesse côté vendeur :**

> « Fais fonctionner ton commerce, découvre ce que les clients recherchent et transforme les demandes en ventes que tu peux suivre. »

**Vision commune :**

> Faire circuler l'information entre les besoins, les produits, les commerçants et les transactions, au lieu de laisser chacun chercher, publier, négocier et s'organiser séparément.

Il existe une cohérence dans l'association de ces deux domaines, car elle ouvre la voie à un produit commercial complet avec une proposition de valeur identifiable pour les deux parties. **Cette cohérence n'est pas une garantie d'innovation, d'adoption ni de viabilité : ce sont des hypothèses à vérifier.**

Le domaine **D03 — Marketing, publicité, prospection et acquisition de clients** reste volontairement de côté pour l'instant. Sa relation avec ce concept, notamment l'acquisition de clients, est évidente ; toutefois, le fondateur a demandé de comprendre pleinement ce que peuvent produire D01 et D02 ensemble avant de décider d'un rapprochement supplémentaire.

---

# 10. Registre initial des décisions, observations et hypothèses

Ce registre permet de ne pas confondre ce que le fondateur a confirmé, ce que l'analyse propose et ce qu'il reste à prouver.

| ID | Élément | Statut au 24/09/2026 | Origine / commentaire |
|---|---|---|---|
| DEC-001 | Étudier **D01 + D02 comme un ensemble**, plutôt que sélectionner une seule activité pour générer une application. | **CONFIRMÉ — orientation de recherche** | Demande explicite du fondateur. |
| DEC-002 | Mettre l'analyse du **D03 en pause** pour approfondir D01 + D02. | **CONFIRMÉ — ordre de travail** | Demande explicite du fondateur. |
| DEC-003 | Conserver cette analyse dans un **document Markdown évolutif** à mettre à jour au fil des observations et décisions acceptées. | **CONFIRMÉ — méthode documentaire** | Demande explicite du fondateur. |
| DEC-004 | Ne pas utiliser « V1 » comme prétexte pour livrer une coquille vide ou retrancher arbitrairement les activités du système envisagé. | **CONFIRMÉ — principe de discussion** | Correction explicite du fondateur ; n'implique pas que toutes les fonctionnalités soient déjà approuvées. |
| DEC-005 | Ne pas borner a priori la portée commerciale à l'Afrique de l'Ouest ; inclure l'hypothèse des produits physiques et numériques et des utilisateurs internationaux dans les investigations. | **CONFIRMÉ — cadrage de recherche** | Demande explicite du fondateur ; les modalités de paiements, de fiscalité et de desserte restent à vérifier. |
| DEC-006 | Préserver intégralement la nouvelle évaluation concurrentielle et les neuf axes avant de lancer l'étape de vérification. | **CONFIRMÉ — méthode documentaire** | Demande explicite du fondateur. Les neuf axes ne sont PAS acceptés comme décisions de produit. |
| DEC-007 | Reconnaître les réseaux sociaux comme espaces de découverte sans isoler la marketplace. | **CONFIRMÉ — intention de conception** | Correction du fondateur ; détails à évaluer dans l’annexe D. |
| DEC-008 | Pas de programme d’affiliation rémunérée à codes/commissions pour le moment. | **CONFIRMÉ — exclusion actuelle** | Le partage ordinaire d’un produit n’implique pas d’affiliation. |
| DEC-009 | Pas de connexions API aux réseaux sociaux pour le moment. | **CONFIRMÉ — exclusion actuelle** | Ne pas rendre l’application dépendante de l’automatisation de WhatsApp, Facebook, Instagram ou TikTok. |
| DEC-010 | Ne pas déduire de la métaphore des « mondes » l’obligation de créer un réseau social interne ou une régie publicitaire. | **CONFIRMÉ — clarification d’intention** | Voir annexe D. |
| HYP-001 | Construire une plateforme commerciale commune avec espaces acheteur et vendeur. | **PROPOSITION À APPROFONDIR** | Résulte du rapprochement de D01 et D02. |
| HYP-002 | Mettre en relation non seulement les offres existantes mais aussi les besoins d'achat non encore satisfaits. | **HYPOTHÈSE PRODUIT** | Parcours illustratif à comparer aux solutions existantes. |
| HYP-003 | Lier les demandes, le stock, les commandes, les paiements et les remises pour les deux parties. | **HYPOTHÈSE PRODUIT / TECHNIQUE** | Cohérence métier à vérifier et à définir. |
| HYP-004 | Les données de recherche et de vente aideraient les commerçants à ajuster leur catalogue et leurs approvisionnements. | **HYPOTHÈSE DE VALEUR** | Ne pas promettre des prévisions exactes sans données ni validation. |
| HYP-005 | Différencier la plateforme par la continuité du parcours « besoin → recherche → offre → accord → transaction → exécution → connaissance → décision » et les neuf axes de l'annexe B. | **HYPOTHÈSE STRATÉGIQUE NON ADOPTÉE** | Nouvelle évaluation conservée pour examen ; aucune capacité de l'annexe B ne devient automatiquement une exigence approuvée. |
| VAL-001 | Différence réelle avec GoMarket, Zafara, CoinAfrique et autres pratiques locales. | **À VÉRIFIER** | Comparaison fonctionnelle et tests d'usage nécessaires. |
| VAL-002 | Fréquence, gravité et coût des frictions D01/D02 chez divers types d'utilisateurs. | **À VÉRIFIER** | La cartographie décrit des frictions potentielles, non une enquête achevée. |
| VAL-003 | Modèle d'adoption, de lancement et de revenus soutenable. | **À VÉRIFIER** | Les deux côtés de la plateforme doivent trouver leur intérêt. |

**Aucune décision de développer cette plateforme n'est présumée du seul fait que son évaluation a été bien accueillie.**

---

# 11. Annexe — Inventaire intégral des frictions initiales D01 et D02

Cette annexe ne modifie pas l'évaluation : elle garde sous les yeux les **72 frictions potentielles** (40 côté D01, 32 côté D02) que nous devons rapprocher, tester ou écarter au fur et à mesure. Les titres et libellés ci-dessous reproduisent le référentiel ; ils ne sont pas des constats de terrain confirmés.

## D01 — 10 activités × 4 frictions

| Activité | Action | Friction potentielle du référentiel |
|---|---|---|
| D01-A01 Choisir une gamme de produits | Observer les demandes | Avis dispersés et biaisés |
| D01-A01 | Comparer les articles | Confusion entre popularité et marge |
| D01-A01 | Tester de petites quantités | Risque d'invendus |
| D01-A01 | Décider du renouvellement | Décision fondée sur la mémoire |
| D01-A02 Rechercher et sélectionner des fournisseurs | Recenser des sources | Contacts incomplets |
| D01-A02 | Demander les conditions | Prix et minimums peu comparables |
| D01-A02 | Évaluer la fiabilité | Qualité incertaine et fraude possible |
| D01-A02 | Choisir un fournisseur | Arbitrages opaques entre prix et délai |
| D01-A03 Commander et recevoir du stock | Évaluer les besoins | Ruptures ou surstock |
| D01-A03 | Passer commande | Variantes et quantités mal transmises |
| D01-A03 | Suivre l'acheminement | Retards non signalés |
| D01-A03 | Contrôler la réception | Manquants ou défauts détectés tard |
| D01-A04 Fixer et réviser les prix | Calculer le coût complet | Transport et pertes oubliés |
| D01-A04 | Observer les prix alternatifs | Références peu comparables |
| D01-A04 | Choisir un prix | Marge ou demande mal anticipée |
| D01-A04 | Réviser le tarif | Étiquettes et annonces incohérentes |
| D01-A05 Présenter et publier un produit | Préparer le produit | État ou variante mal précisé |
| D01-A05 | Créer photos et description | Photos floues et détails manquants |
| D01-A05 | Diffuser l'offre | Publications éparpillées ou oubliées |
| D01-A05 | Actualiser disponibilité | Article vendu toujours affiché |
| D01-A06 Répondre et conseiller les clients | Recevoir une demande | Messages noyés parmi d'autres |
| D01-A06 | Comprendre le besoin | Mauvaise variante recommandée |
| D01-A06 | Expliquer conditions et usage | Réponses répétitives ou contradictoires |
| D01-A06 | Relancer sans insister | Intéressés perdus de vue |
| D01-A07 Enregistrer et exécuter une commande | Confirmer produit et quantité | Malentendus sur la variante |
| D01-A07 | Relever coordonnées | Adresse imprécise |
| D01-A07 | Réserver l'article | Double vente d'un même stock |
| D01-A07 | Confirmer le délai | Promesses incompatibles avec la logistique |
| D01-A08 Encaisser et rapprocher les ventes | Annoncer le montant | Remises et frais contestés |
| D01-A08 | Accepter le moyen de paiement | Canal indisponible ou frais inattendus |
| D01-A08 | Vérifier réception | Fausse preuve ou paiement en attente |
| D01-A08 | Reporter la vente | Entrées oubliées ou dupliquées |
| D01-A09 Organiser une livraison ou remise | Choisir le mode de remise | Coût ou distance mal évalués |
| D01-A09 | Préparer le colis | Erreur de produit ou emballage insuffisant |
| D01-A09 | Coordonner l'itinéraire | Destinataire absent ou introuvable |
| D01-A09 | Confirmer la remise | Litige sans preuve claire |
| D01-A10 Gérer retours réclamations et fidélisation | Recevoir la réclamation | Client renvoyé d'un interlocuteur à l'autre |
| D01-A10 | Vérifier les faits | Preuves dispersées |
| D01-A10 | Proposer une issue | Règles imprécises ou perçues comme injustes |
| D01-A10 | Recontacter après résolution | Client oublié ou sollicité abusivement |

## D02 — 8 activités × 4 frictions

| Activité | Action | Friction potentielle du référentiel |
|---|---|---|
| D02-A01 Définir un besoin d'achat | Constater le besoin | Achat impulsif ou besoin mal formulé |
| D02-A01 | Évaluer l'urgence | Achat reporté malgré nécessité |
| D02-A01 | Fixer les contraintes | Budget et caractéristiques flous |
| D02-A01 | Établir les priorités | Choix concurrents désorganisés |
| D02-A02 Rechercher des produits et vendeurs | Choisir des sources | Offres non visibles hors réseau personnel |
| D02-A02 | Formuler la recherche | Termes et catégories variables |
| D02-A02 | Contacter des vendeurs | Absence de réponse ou disponibilité fictive |
| D02-A02 | Rassembler les offres | Informations réparties entre conversations |
| D02-A03 Comparer prix et valeur réelle | Relever les prix | Tailles et qualités non équivalentes |
| D02-A03 | Ajouter transport et frais | Prix affiché trompeur sur coût final |
| D02-A03 | Évaluer la qualité | Difficulté à vérifier l'authenticité |
| D02-A03 | Arbitrer | Choix précipité ou paralysie |
| D02-A04 Vérifier un vendeur avant paiement | Identifier l'interlocuteur | Usurpation ou identité peu claire |
| D02-A04 | Contrôler l'offre | Promesse irréaliste |
| D02-A04 | Examiner les conditions | Garantie et retour absents |
| D02-A04 | Choisir la remise | Paiement anticipé risqué |
| D02-A05 Négocier et réserver un article | Exposer ses contraintes | Malentendu sur le budget |
| D02-A05 | Discuter prix et accessoires | Frais ajoutés tardivement |
| D02-A05 | Fixer le lieu et l'heure | Rendez-vous manqués |
| D02-A05 | Confirmer la réservation | Article revendu ou acompte contesté |
| D02-A06 Payer un achat | Choisir le canal | Frais ou plafond inattendu |
| D02-A06 | Vérifier le bénéficiaire | Erreur de numéro ou fraude |
| D02-A06 | Exécuter le paiement | Connexion ou service interrompu |
| D02-A06 | Conserver la preuve | Reçu perdu ou peu lisible |
| D02-A07 Recevoir et contrôler un achat | Suivre l'arrivée | Manque de visibilité |
| D02-A07 | Vérifier identité du colis | Remise à un tiers imprévu |
| D02-A07 | Inspecter qualité et quantité | Défaut constaté après départ |
| D02-A07 | Signaler un écart | Litige tardif ou non documenté |
| D02-A08 Gérer budget d'achat récurrent | Lister les achats réguliers | Postes oubliés |
| D02-A08 | Estimer la dépense | Prix variables |
| D02-A08 | Planifier les achats | Dépenses concentrées un mauvais jour |
| D02-A08 | Contrôler le réalisé | Dépassement invisible |

---

# 12. Historique des mises à jour

| Version | Date | Nature | Décision ou changement conservé |
|---|---|---|---|
| 0.1 | 2026-09-24 | Création | Analyse structurée D01 + D02 ; ajout des sources, des 72 frictions et du registre des états. |
| 0.2 | 2026-09-24 | Ajout sans suppression | Annexe A : reproduction intégrale de la réponse D01 + D02 explicitement citée par Abraham, y compris les neuf correspondances vendeur/acheteur, l’exemple de Cotonou, le parcours bidirectionnel, les concurrents, les questions et la synthèse. |
| 0.3 | 2026-09-24 | Ajout sans suppression | Annexe B : évaluation complète de la différenciation, neuf axes, concurrents internationaux, produits physiques et numériques, portée mondiale, huit questions de vérification et point de reprise. Hypothèse stratégique expressément NON adoptée comme décision produit. |
| 0.4 | 2026-09-24 | Ajout sans suppression | Annexe C : nouvelle évaluation des huit dimensions, propositions d’exécution, résultats attendus pour acheteur/vendeur, synthèse des trois systèmes et quatre parcours à examiner. Analyse conservée, sans validation implicite des mécanismes proposés. |
| 0.5 | 2026-09-24 | Ajout et clarification, sans suppression des analyses antérieures | Annexe D : évaluation complète de la convergence avec la découverte sociale, corrigée selon les instructions du fondateur ; refus à ce stade du programme d’affiliation rémunérée et des API sociales ; partage libre d’offres et continuité vers l’achat ; registre de corrections et prochaines vérifications. |
| 0.6 | 2026-09-25 | Ajout groupé des trois développements et audit, sans supprimer les versions antérieures | Annexe E : progression des six évaluations ; annexe F : cinq parcours de bout en bout ; annexe G : six objets métier, assistance en trois niveaux, transactions distinctes et actions contextuelles ; annexe H : vérification de cohérence, clarification des statuts, point de reprise après v0.6. |
| 0.7 | 2026-09-25 | Prolongement documenté, sans suppression | Annexe I : cinq cas difficiles et mécanismes de traitement envisagés ; annexe J : feuille de route en cinq étapes jusqu’à la construction ; annexe K : contrôle de cohérence, décisions réellement confirmées, points non résolus et reprise à la consolidation du concept produit. |

| 0.8 | 2026-09-25 | Consolidation conceptuelle + lancement du cadrage économique | Annexes L et M : produit, clientèle à tester, revenus hypothétiques, stratégie d’amorçage et protocole terrain ; marché non validé. |
| 0.9 | 2026-09-25 | Audit économique pré-PRD sans effacer les annexes précédentes | Annexe N : segmentation des payeurs, économie unitaire, frais et remboursements, rôle du prestataire, règlement Play pour produits numériques, fiscalité transfrontalière, risques et matrice des preuves ; passage au PRD avec dépendances ouvertes. |

## Modèle pour une future mise à jour

**Version / date :**  
**Nouvelle observation ou preuve :**  
**Source de l'information :**  
**Ce qui change dans l'analyse :**  
**Décision explicitement acceptée par le fondateur :**  
**Hypothèses qui restent ouvertes :**  
**Sections affectées :**  
**Prochaine question ou vérification utile :**

---

# Sources et règles de preuve

1. **Référence principale de l'Atlas :** `Atlas_AI_Foundry_V4_48_Domaines_Premium.html`, D01 et D02, document de travail partagé par le fondateur.
2. **Référence de contrôle des libellés :** `Cartographie_36_domaines_activites_actions_frictions.md`, sections D01 et D02. Cette source décrit des *frictions potentielles*, non des faits validés.
3. **GoMarket :** https://www.gomarket.bj/ — description éditoriale de la plateforme, consultation du 24 septembre 2026.
4. **Zafara Bénin :** https://zafarabenin.fr/ — description éditoriale de la plateforme, consultation du 24 septembre 2026.
5. **CoinAfrique :** https://www.coinafrique.com/contactez-nous/ — présence du Bénin indiquée sur le site, consultation du 24 septembre 2026.

**Règle de fond :** ne jamais convertir silencieusement une annonce d'un concurrent, une supposition de l'Atlas, une observation individuelle ou une proposition de l'assistant en fait commercial validé. Les décisions appartiennent au fondateur et seront inscrites comme confirmées seulement après son accord explicite.

---

# ANNEXE A — TRANSCRIPTION INTÉGRALE DE LA RÉPONSE D01 + D02 DEMANDÉE PAR ABRAHAM

**Nature :** reproduction de la réponse de conversation fournie par Abraham, conservée dans son déroulement et sans remplacer les analyses et annexes précédentes. La présentation des encadrés de la conversation a été transposée en titres et citations Markdown pour permettre sa lecture dans un fichier `.md`.

Abraham, oui. Et je comprends mieux ce que tu cherches à construire.

Tu ne veux pas que nous découvrions une petite difficulté, puis que nous nous contentions de créer un outil qui la résout. Tu veux que nous examinions tout le fonctionnement du commerce, du côté de celui qui vend comme du côté de celui qui achète, pour imaginer une application dans laquelle les deux peuvent réellement accomplir leurs activités.

Je laisse donc de côté le débat sur ce qu'il faudrait retirer ou conserver dans une « V1 ». Ce n'est pas la question que tu me poses.

Après avoir repris les deux domaines dans notre Atlas, voici ce que je vois.

## D01 + D02 : une seule application, deux côtés d'une même économie

**Hypothèse de produit à approfondir**

### Une plateforme de commerce qui fait fonctionner ensemble l'achat et la vente

**Pour le vendeur :** gérer son activité commerciale et accéder à des clients.

**Pour l'acheteur :** trouver ce dont il a besoin, choisir une offre adaptée et acheter dans de bonnes conditions.

**Pour les deux :** disposer d'un parcours commun, depuis la recherche ou la publication d'un produit jusqu'à la transaction, la remise et le suivi.

### 1. Ce que représente réellement le domaine 1

Tu as décrit le domaine 1 comme le côté « admin » d'une application de commerce. Cette image est pertinente, avec une précision : il ne s'agit pas seulement d'un tableau de bord administratif. C'est le moteur qui permet au vendeur d'exercer son commerce.

Notre Atlas y recense dix activités : choisir ses produits, rechercher des fournisseurs, gérer le stock, fixer les prix, publier les produits, conseiller les clients, traiter les commandes, encaisser les ventes, organiser les livraisons et gérer les réclamations ainsi que la fidélisation.

**D01 — Espace commerçant**

### « Je veux faire fonctionner et développer mon commerce. »

Le commerçant pourrait notamment :

- créer sa boutique et son catalogue ;
- organiser ses produits, variantes, quantités et prix ;
- gérer ses fournisseurs et réapprovisionnements ;
- recevoir les demandes et conseiller les acheteurs ;
- négocier, réserver et confirmer une commande ;
- suivre les paiements, remises et livraisons ;
- traiter les retours et retrouver ses clients ;
- comprendre quels articles se vendent, lesquels manquent et lesquels intéressent les acheteurs.

Cette représentation regroupe les dix activités du domaine en une expérience commerciale cohérente.

Une chose m'intéresse particulièrement dans l'Atlas : le vendeur peut publier un produit qui a déjà été vendu, perdre une demande dans ses messages, réserver deux fois le même article ou avoir du mal à rapprocher un paiement d'une vente.

Ces frictions concernent le fonctionnement du commerce, pas simplement la visibilité du produit.

### 2. Ce que représente le domaine 2

De l'autre côté, l'acheteur ne veut pas « utiliser une marketplace ». Il veut obtenir quelque chose dont il a besoin, à un prix et dans des conditions qui lui conviennent.

Notre Atlas décrit huit activités : définir son besoin, chercher des produits et vendeurs, comparer les offres, vérifier un vendeur, négocier et réserver, payer, recevoir et contrôler l'achat, puis gérer ses achats récurrents.

**D02 — Espace acheteur**

### « Je veux trouver et obtenir le bon produit. »

L'acheteur pourrait notamment :

- rechercher un produit ou exprimer précisément ce qu'il cherche ;
- découvrir des vendeurs et boutiques accessibles ;
- connaître le prix, les caractéristiques et la disponibilité ;
- comparer le coût total, y compris le transport ;
- vérifier les informations du vendeur et les conditions d'achat ;
- poser des questions, négocier ou réserver ;
- payer, retirer ou se faire livrer ;
- suivre ses achats, ses éventuelles réclamations et ses besoins réguliers.

Cette représentation regroupe les huit activités du domaine autour du résultat que recherche l'acheteur.

Et c'est ici que les deux domaines commencent à devenir intéressants ensemble.

### 3. Le point important : les activités du vendeur et celles de l'acheteur se répondent

Regarde cette correspondance :

| Côté vendeur — D01 | Côté acheteur — D02 | Ce que l'application pourrait relier |
| --- | --- | --- |
| Choisir les produits à vendre | Exprimer ses besoins | Les demandes des acheteurs et les décisions d'approvisionnement |
| Gérer le stock | Rechercher un produit disponible | Les quantités réellement déclarées et les offres visibles |
| Fixer les prix | Comparer les prix et coûts | Le prix du produit, les frais et les conditions |
| Présenter et publier | Rechercher et vérifier | Les informations du vendeur et du produit |
| Répondre et conseiller | Poser des questions et négocier | Une conversation liée à une offre précise |
| Enregistrer une commande | Réserver et acheter | Un accord commun sur l'article, le prix et le délai |
| Encaisser | Payer | Un paiement associé à une commande identifiable |
| Organiser la remise | Recevoir et contrôler | Le suivi de la même transaction des deux côtés |
| Gérer les réclamations | Signaler un problème | Un dossier commun avec les faits et les échanges |

Ces rapprochements découlent des parcours détaillés dans les deux domaines de l'Atlas.

Ce tableau est probablement le cœur de ce que tu cherchais à m'expliquer.

Nous ne sommes plus en train d'imaginer une application pour les vendeurs à côté d'une autre application pour les acheteurs.

Nous commençons à imaginer un système commercial partagé : une même transaction est visible et compréhensible pour les deux parties, chacune à travers l'interface adaptée à son rôle.

### 4. Maintenant, comment ce produit pourrait-il devenir plus intéressant qu'une simple application de petites annonces ?

Prenons une situation.

Une personne à Cotonou recherche un appareil précis. Elle ne sait pas quelle boutique le possède.

**Exemple de fonctionnement envisagé**

### L'acheteur exprime son besoin. Le commerce peut y répondre.

- **L'acheteur décrit le produit recherché.**

  Il précise éventuellement son budget, son quartier et ses exigences.

- **L'application recherche les offres correspondantes.**

  Elle présente les vendeurs qui déclarent proposer ce produit, avec les informations disponibles.

- **Si aucune offre ne convient, la demande peut rester ouverte.**

  Des commerçants concernés peuvent alors recevoir cette demande et proposer une offre s'ils sont réellement capables d'y répondre.

- **Le vendeur répond depuis son espace commercial.**

  Il confirme le produit, la variante, le prix, la disponibilité et les possibilités de remise.

- **L'acheteur compare et décide.**

  Il peut poser des questions, choisir une proposition, réserver ou acheter.

- **Les deux suivent la transaction.**

  La commande, le paiement et la remise sont reliés, au lieu de dépendre uniquement d'une succession de messages sans suivi commun.

- **Le commerçant apprend quelque chose de la demande.**

  Même les recherches qui n'aboutissent pas pourraient lui indiquer quels produits sont recherchés mais absents de son catalogue.

Ce dernier point m'intéresse particulièrement : l'application ne servirait pas uniquement à vendre ce qui est déjà affiché. Elle pourrait aussi rendre visibles les besoins auxquels les commerçants ne répondent pas encore.

Cela relie directement l'activité « Choisir une gamme de produits » du domaine 1 à l'activité « Définir un besoin d'achat » du domaine 2.

La possibilité existe donc d'un fonctionnement dans les deux sens :

**Offre → Demande :** un vendeur publie un article et trouve des acheteurs.

**Demande → Offre :** un acheteur exprime un besoin et les vendeurs concernés peuvent y répondre.

**Transactions → Amélioration :** les achats, les demandes non satisfaites et les ruptures de stock peuvent aider les commerçants à mieux organiser leur activité.

Ce n'est pas encore une innovation prouvée. C'est une hypothèse de fonctionnement à comparer sérieusement aux solutions existantes.

### 5. Il faut néanmoins reconnaître ce qui existe déjà

La combinaison « espace vendeur + espace acheteur » porte un nom connu : une marketplace, ou place de marché.

Et au Bénin, nous trouvons déjà des propositions de ce type. Par exemple, GoMarket présente une application permettant d'acheter et vendre localement. Zafara annonce des espaces pour les acheteurs, vendeurs et livreurs, avec paiement Mobile Money et livraison. CoinAfrique permet notamment de découvrir des annonces au Bénin et de contacter les vendeurs.

Cela signifie que réunir des vendeurs et des acheteurs ne suffit pas, en soi, à constituer notre différence.

La recherche devra porter sur ce que nous voulons faire fonctionner de manière plus complète : la disponibilité réelle, les demandes non satisfaites, le passage entre boutique physique et commerce numérique, le suivi des accords et transactions, ou l'utilisation des informations d'achat pour aider les commerçants à prendre de meilleures décisions.

Nous devons vérifier ces écarts au lieu de supposer qu'aucun concurrent ne les couvre.

### 6. Une seule application, mais pas une seule expérience identique

Sur le plan du produit, je vois bien ton idée ainsi :

### Une plateforme commerciale commune

Même application Android, données reliées, espaces adaptés aux utilisateurs.

**Acheter**

Recherche, comparaison, demandes, réservations, commandes, paiements et suivi.

**Vendre**

Boutique, produits, stock, clients, demandes, commandes, encaissements et suivi commercial.

Un même compte pourrait avoir les deux rôles. Un commerçant est aussi parfois acheteur, notamment lorsqu'il cherche des fournisseurs pour se réapprovisionner.

Et il y a une distinction importante : le commerçant ne devrait pas nécessairement devoir abandonner sa boutique physique ou ses habitudes pour utiliser le produit.

L'application pourrait l'aider à faire fonctionner un commerce qui existe déjà, tout en lui ouvrant un canal d'achat et de vente numérique.

C'est plus large qu'une simple vitrine.

### 7. Les questions qui détermineront si cette idée peut réellement devenir une entreprise

Je vois quatre questions décisives à investiguer, sans limiter arbitrairement le produit :

- **La disponibilité :** comment garantir que les offres présentées correspondent aux stocks réels, sans imposer au commerçant une charge de mise à jour qu'il abandonnera ?

- **La confiance et l'exécution :** comment vérifier les informations pertinentes, organiser les paiements et traiter les incidents sans faire de promesses que la plateforme ne peut pas tenir ?

- **L'adoption :** pourquoi un vendeur et un acheteur utiliseraient-ils cette application plutôt que de continuer uniquement avec leurs contacts, Facebook ou leurs boutiques habituelles ?

- **La viabilité commerciale :** quelle valeur les vendeurs retireraient-ils du système, et quels revenus pourraient financer durablement son exploitation, ses paiements éventuels, son support et sa croissance ?

La difficulté particulière d'une plateforme qui relie deux populations est qu'il faut des offres utiles pour attirer les acheteurs et une demande réelle pour attirer les vendeurs. Il faudra donc penser à son démarrage autant qu'à ses fonctionnalités.

### Ma synthèse pour notre travail AI Foundry

**Concept issu de la combinaison D01 + D02**

### Une application qui connecte les besoins d'achat au fonctionnement réel des commerces

**La promesse côté acheteur :**

« Trouve ce dont tu as besoin, découvre des offres adaptées et va jusqu'à l'achat avec des informations claires. »

**La promesse côté vendeur :**

« Fais fonctionner ton commerce, découvre ce que les clients recherchent et transforme les demandes en ventes que tu peux suivre. »

**La vision commune :**

Faire circuler l'information entre les besoins, les produits, les commerçants et les transactions, au lieu de laisser chacun chercher, publier, négocier et s'organiser séparément.

Oui, Abraham, je vois une cohérence réelle dans l'association de ces deux domaines. Pas parce qu'elle garantit une application extraordinaire, mais parce qu'elle nous donne une base pour concevoir un produit commercial complet, avec une valeur identifiable pour les deux côtés.

Et je garde le domaine 3 de côté, comme tu l'as demandé. Sa relation avec ce concept est évidente — notamment l'acquisition de clients — mais nous n'avons pas besoin de mélanger les trois domaines avant d'avoir pleinement compris ce que peuvent produire D01 et D02 ensemble.

---

# ANNEXE B — ÉVALUATION COMPLÈTE SUR LA DIFFÉRENCIATION DE D01 + D02

**Nature de cette annexe :** conservation détaillée de la réponse de conversation qui suit l'analyse initiale D01 + D02. L'organisation en encadrés de la conversation a été transposée en titres, citations et tableaux Markdown. Les références aux plateformes correspondent aux exemples évoqués pendant cette évaluation : elles ne constituent pas ici une nouvelle étude concurrentielle exhaustive.

**Statut :** **HYPOTHÈSES STRATÉGIQUES À INVESTIGUER — NON VALIDÉES COMME DÉCISION PRODUIT.** Le fondateur a explicitement demandé de conserver l'évaluation avant de poursuivre la vérification. L'ajout au document ne signifie ni approbation des neuf axes comme fonctionnalités finales, ni adoption du concept, ni limitation à un pays, ni réduction du périmètre sous prétexte d'une « V1 ».

Abraham, oui. Et maintenant, nous arrivons à une étape beaucoup plus intéressante de notre réflexion.

Nous avons déjà conçu la base : une plateforme où le commerçant peut exercer son activité et où l'acheteur peut trouver, comparer et acheter des produits. Nous avons également compris que les deux espaces doivent fonctionner ensemble.

**Mais avoir toutes les fonctionnalités d'une marketplace ne suffit pas à expliquer pourquoi les gens devraient choisir la nôtre plutôt qu'une autre.**

Ce que nous cherchons maintenant, c'est une proposition de valeur qui transforme réellement l'expérience du commerce.

J'ai confronté notre concept à plusieurs plateformes existantes, y compris des acteurs africains et internationaux. Voici ce que cette comparaison nous apprend et, surtout, ce que nous pouvons en tirer pour notre projet AI Foundry.

## 1. D'abord, ce que nous ne devons pas confondre avec notre innovation

Il existe déjà des systèmes commerciaux très complets.

### Ce que les plateformes savent déjà faire

**Amazon**

Son espace vendeur permet notamment de gérer les produits, les prix, les commandes, les stocks, les retours et les performances commerciales.

**Shopify**

Shopify permet aux commerçants de vendre sur plusieurs canaux et de synchroniser catalogues, stocks et commandes avec des marketplaces compatibles.

**Square et Odoo**

Ces solutions rapprochent déjà le commerce physique, les stocks, les achats fournisseurs, les commandes, les paiements et la vente en ligne.

**Jumia**

Jumia associe marketplace, vendeurs, logistique et paiements dans plusieurs marchés africains. Son rapport annuel 2025 décrit également des services d'accompagnement des vendeurs et des capacités commerciales au-delà du simple catalogue.

Cela nous donne une leçon importante : **ni un espace commerçant complet, ni la synchronisation des stocks, ni même l'association de la vente physique et numérique ne constituent automatiquement une innovation nouvelle.**

Ces capacités peuvent faire partie de notre application. Mais il faut aller plus loin dans la valeur que nous apportons.

## 2. Le véritable changement de perspective que je propose

Regarde la différence entre ces deux visions.

### Vision classique

> « Voici les produits disponibles. Cherchez et achetez. »

Le vendeur publie.

L'acheteur consulte.

La plateforme facilite la transaction.

### Notre hypothèse de vision

> **« Dites-nous ce que vous cherchez à obtenir ou à vendre ; le système vous aide à atteindre ce résultat. »**

L'acheteur peut rechercher un produit, mais aussi exprimer un besoin auquel aucune offre ne répond encore.

Le vendeur peut publier des produits, mais aussi découvrir des besoins, adapter son offre et organiser son activité.

La plateforme relie la demande, l'offre, l'exécution et les enseignements tirés des transactions.

Ce ne serait donc pas uniquement un lieu où les produits sont exposés.

Ce serait un **système commercial orienté vers les résultats**, dans lequel l'information circule dans les deux sens.

Et c'est à partir de cette vision que je vois plusieurs axes à approfondir.

## 3. Les neuf axes sur lesquels nous pouvons capitaliser

Ce sont des pistes de différenciation, pas encore des affirmations selon lesquelles aucun concurrent ne les possède.

### Axe 1 — Le commerce déclenché par les besoins, pas seulement par les annonces

C'est une extension directe de notre première analyse.

Imaginons qu'une personne recherche un produit introuvable dans le catalogue.

Une marketplace classique peut lui afficher une page sans résultat ou lui proposer des produits voisins.

Notre système pourrait conserver sa demande, identifier les commerçants susceptibles d'y répondre et leur permettre de soumettre une proposition.

Mais allons plus loin.

Le commerçant pourrait également découvrir que plusieurs personnes recherchent des produits qu'il ne vend pas encore.

Il disposerait alors de signaux lui permettant d'envisager un approvisionnement, plutôt que de choisir uniquement ses produits à partir de ses intuitions.

**La valeur recherchée :**

> Transformer des besoins non satisfaits en opportunités d'achat pour les consommateurs et en opportunités commerciales pour les vendeurs.

Attention : Alibaba.com propose déjà un mécanisme de demandes de devis, ou RFQ, dans lequel des acheteurs décrivent leur besoin et reçoivent des propositions de fournisseurs. Ce principe n'est donc pas inédit.

Notre différenciation éventuelle devra venir de la manière dont nous l'intégrons à l'expérience globale, notamment entre particuliers, petits commerces, boutiques physiques et fournisseurs.

### Axe 2 — Une disponibilité qui reflète réellement l'activité du commerçant

C'est un problème que nous avions déjà identifié dans l'Atlas.

Une chose est de voir un produit annoncé.

Une autre est de pouvoir l'acheter réellement.

L'intérêt serait de relier les ventes effectuées en boutique physique, les commandes numériques, les réservations et les modifications de stock.

Par exemple, lorsqu'un commerçant vend le dernier exemplaire dans sa boutique, l'offre numérique devrait pouvoir être actualisée.

Inversement, si un acheteur réserve un article, le vendeur devrait voir immédiatement que cette quantité n'est plus librement disponible.

La synchronisation des stocks existe déjà chez Square, Shopify et d'autres solutions.

**La question à résoudre n'est donc pas simplement de développer une fonction de stock.**

C'est de permettre à des commerçants de différentes tailles d'utiliser cette fonction sans qu'elle devienne une charge supplémentaire.

Je vois ici une possibilité intéressante : distinguer clairement un stock suivi automatiquement, une disponibilité récemment confirmée par le vendeur et une disponibilité qui doit encore être vérifiée.

Ainsi, nous ne présenterions pas une simple déclaration ancienne comme une garantie.

### Axe 3 — Une recherche qui comprend réellement ce que l'acheteur veut

Aujourd'hui, imaginons un acheteur qui recherche une pièce informatique, un produit de beauté, un appareil ménager ou un vêtement particulier.

Il peut connaître le nom exact du produit, mais aussi ne disposer que d'une description, d'une image ou d'un usage recherché.

Notre application pourrait lui permettre de rechercher de plusieurs manières.

#### Exemple : chercher un produit sans connaître son nom exact

L'acheteur pourrait dire :

> « Je cherche un chargeur pour cet ordinateur. »

Il ajoute une photo de l'appareil ou de son ancien chargeur.

Le système aide à identifier les caractéristiques à confirmer, trouve les offres correspondantes et distingue celles dont la compatibilité reste incertaine.

**Résultat recherché :** moins de recherches infructueuses et moins d'achats inadaptés.

L'IA pourrait être utile ici pour interpréter les descriptions, reconnaître certaines caractéristiques visibles, rapprocher des termes locaux et aider à comparer les offres.

Mais elle ne devrait pas inventer une compatibilité technique ni certifier l'authenticité d'un produit sur une simple photo.

L'innovation serait dans l'amélioration de la décision d'achat, pas dans le fait d'ajouter un chatbot.

### Axe 4 — La comparaison des offres selon leur valeur réelle

Le prix affiché ne suffit pas toujours à déterminer si une offre convient.

Un acheteur peut trouver un article moins cher, mais devoir payer davantage pour le transport.

Une autre offre pourrait être plus chère tout en comprenant une garantie ou une remise immédiate.

Je verrais donc un système de comparaison qui aide à comprendre :

| Information | Ce que l'acheteur cherche à savoir |
|---|---|
| Prix du produit | Combien coûte exactement l'article ? |
| Frais supplémentaires | Quel sera le montant total ? |
| Disponibilité | Puis-je réellement l'obtenir ? |
| Localisation | Où se trouve le vendeur ? |
| Livraison ou retrait | Comment recevrai-je le produit ? |
| Délai | Quand puis-je l'obtenir ? |
| État et caractéristiques | Est-ce bien le produit recherché ? |
| Conditions commerciales | Quels recours sont prévus en cas de problème ? |

Le véritable résultat serait de réduire le travail nécessaire pour passer de plusieurs offres dispersées à une décision éclairée.

### Axe 5 — Une confiance fondée sur les faits et les transactions

C'est un axe que je considère comme particulièrement important à étudier.

Un badge « vendeur vérifié » ne devrait pas signifier que tous ses produits sont authentiques ou que toutes ses transactions réussiront.

Nous pourrions distinguer plusieurs informations :

- l'identité ou l'existence commerciale vérifiée ;
- les produits et caractéristiques effectivement confirmés ;
- la fiabilité des informations de stock ;
- les commandes exécutées ;
- les délais réellement respectés ;
- la manière dont les réclamations ont été traitées.

Le but serait que l'acheteur sache **ce qui a été vérifié, ce qui est simplement déclaré et ce qui demeure inconnu**.

Cela pourrait aussi profiter aux commerçants sérieux qui ne disposent pas encore d'une grande réputation numérique.

### Axe 6 — Une application réellement adaptée aux produits physiques ET numériques

Tu as raison d'insister là-dessus. C'est un élément important de la portée que nous envisageons.

Il ne faudrait pas construire toute l'architecture autour des colis et découvrir plus tard que nous voulons aussi permettre de vendre des livres numériques, formations, modèles, fichiers graphiques, logiciels ou autres produits téléchargeables.

Cependant, vendre des fichiers numériques n'est pas, en soi, une innovation : Etsy prend en charge les téléchargements immédiats et les créations numériques sur commande ; Shopify et Gumroad proposent également des mécanismes de vente et de livraison numérique.

Ce que nous pouvons capitaliser, c'est une architecture commerciale commune qui sait gérer correctement plusieurs natures de produits.

#### Une même plateforme, deux modes d'exécution

| Produit physique | Produit numérique |
|---|---|
| Stock, variante, adresse, retrait, expédition, livraison, retour. | Fichier, version, licence, accès, téléchargement, mise à jour, droits d'utilisation. |

**Leur point commun :** une offre, un acheteur, des conditions, une transaction et une obligation de livraison ou de fourniture.

Cela permettrait à une personne au Bénin de vendre un produit numérique à un acheteur en Europe, sous réserve que les moyens de paiement, les règles de vente et les modalités fiscales concernés soient effectivement pris en charge.

Et un même commerçant pourrait proposer, par exemple, un appareil physique accompagné d'un guide numérique.

### Axe 7 — Un véritable outil commercial pour le vendeur, même en dehors de la marketplace

Voici une distinction qui mérite beaucoup d'attention.

Pourquoi un commerçant adopterait-il notre système alors qu'il n'y a pas encore beaucoup d'acheteurs inscrits ?

Une possibilité serait que l'application lui soit déjà utile pour exercer son activité habituelle.

Il pourrait gérer ses produits, ses prix, ses stocks, ses commandes et ses ventes physiques, même si ces ventes ne proviennent pas de notre marketplace.

Ainsi, son intérêt ne dépendrait pas entièrement des clients que nous lui apportons.

La marketplace deviendrait un canal commercial supplémentaire **intégré à son fonctionnement quotidien**.

Des solutions telles que Square et Odoo proposent déjà des approches de gestion commerciale intégrée.

Nous devons donc rechercher la différence dans l'expérience concrète proposée à nos commerçants cibles, notamment la simplicité, le temps de prise en main, les coûts et l'intérêt de relier cette gestion à une demande commerciale visible.

### Axe 8 — Une intelligence commerciale alimentée par l'offre ET la demande

C'est peut-être l'un des rapprochements les plus intéressants entre D01 et D02.

Imagine que la plateforme puisse aider un vendeur à examiner les questions suivantes :

« Quels articles me demande-t-on souvent alors que je ne les vends pas ? »

« Quels produits sont consultés, mais rarement achetés ? »

« Quels articles se vendent régulièrement, mais sont souvent en rupture ? »

« Quelles demandes ai-je perdues parce que mon prix, mon délai ou ma disponibilité ne convenaient pas ? »

« Quels produits devrais-je examiner avant mon prochain réapprovisionnement ? »

Il ne s'agit pas simplement de produire des graphiques de ventes.

Il s'agit de transformer les observations en **possibilités de décisions commerciales**, sans présenter les recommandations comme des certitudes.

Et l'acheteur pourrait bénéficier indirectement de cette intelligence lorsque les commerçants adaptent leurs offres à des besoins réellement exprimés.

### Axe 9 — Une plateforme internationale dans sa conception, locale dans son fonctionnement

Je retiens entièrement ta correction : nous ne concevons pas une application réservée au Bénin ou à l'Afrique de l'Ouest.

La vision peut être mondiale.

Mais une application accessible mondialement ne signifie pas automatiquement que chaque vendeur peut encaisser et être payé dans tous les pays. À titre d'exemple, Stripe distingue les pays dans lesquels les entreprises peuvent ouvrir un compte de paiement et les pays des clients auprès desquels elles peuvent accepter des paiements.

Je verrais donc deux couches :

**Une couche commerciale commune :** identité, catalogue, offres, demandes, commandes, produits numériques, conversations et suivi des transactions.

**Une couche adaptée au pays et au contexte :** langues, devises, moyens de paiement, règles fiscales, livraison, identité commerciale et conditions de vente.

Ce découpage permettrait d'envisager une croissance internationale sans supposer que toutes les transactions fonctionnent partout de manière identique.

---

## 4. Mais alors, quelle serait réellement notre différence ?

Je voudrais rassembler tout cela en une seule idée, sans la déclarer validée prématurément.

### Hypothèse stratégique D01 + D02 — Du catalogue commercial au système qui relie les besoins aux résultats

**Une marketplace classique :**

Elle aide les vendeurs à présenter des offres et les acheteurs à effectuer des transactions.

**Notre direction possible :**

Une plateforme dans laquelle les besoins des acheteurs, les offres des vendeurs, les activités commerciales et les résultats des transactions sont reliés pour aider chacun à mieux acheter, mieux vendre et mieux décider.

**La différence recherchée ne serait pas une fonctionnalité isolée.**

Elle résiderait dans la continuité entre :

> **Besoin → Recherche → Offre → Accord → Transaction → Exécution → Connaissance → Nouvelle décision.**

Cette continuité permettrait à l'application de devenir utile avant, pendant et après une transaction.

Et surtout, elle pourrait produire de la valeur même lorsqu'une première recherche n'aboutit pas immédiatement à un achat.

## 5. Ce qu'il nous reste à vérifier pour savoir si cette direction est réellement différenciante

Je ne voudrais pas que nous répétions une erreur fréquente en idéation : imaginer une fonctionnalité séduisante et affirmer aussitôt qu'aucune autre application ne la possède.

Nous avons désormais assez de matière pour mener une investigation concurrentielle précise.

| Ce que nous devons confronter | Ce que nous cherchons à établir |
|---|---|
| Les demandes d'achat non satisfaites | Comment les plateformes existantes permettent-elles aux vendeurs d'y répondre ? |
| Le commerce physique et numérique | Quelle expérience proposent-elles aux petits commerçants qui vendent déjà hors ligne ? |
| Les stocks et réservations | Comment les plateformes gèrent-elles la fiabilité des disponibilités ? |
| La confiance | Quelles vérifications et protections existent réellement ? |
| Les produits numériques | Quelles catégories, licences, modes de livraison et possibilités internationales sont couverts ? |
| L'intelligence commerciale | Les données de recherche et de demande servent-elles à améliorer les décisions des vendeurs ? |
| L'expérience internationale | Quels pays, paiements, langues et modes de livraison sont pris en charge ? |
| L'adoption et les revenus | Quelle valeur justifierait de quitter ou de compléter les outils déjà utilisés ? |

C'est la recherche que je considère maintenant nécessaire pour passer de notre **hypothèse de produit** à une **proposition de différenciation documentée**.

---

## Ce que je voudrais retenir de notre échange

Abraham, nous ne cherchons plus simplement à créer une marketplace avec un bon espace commerçant et un bon espace acheteur.

Nous envisageons une plateforme commerciale qui aide les deux parties à obtenir leurs résultats, qui rapproche l'offre et la demande dans les deux sens, et qui transforme les activités commerciales en informations utiles pour les décisions suivantes.

**La question décisive n'est donc plus : « Quelles fonctionnalités pouvons-nous ajouter ? »**

Elle devient :

> **Qu'est-ce que notre application permettra réellement à un acheteur ou à un vendeur d'accomplir avec moins d'incertitude, moins d'effort ou de meilleurs résultats que ses solutions actuelles ?**
>
> Et comment les différentes capacités de l'application travailleront-elles ensemble pour produire cette valeur ?

Voilà la direction que je propose d'approfondir pour D01 + D02.

Je ne la considère pas encore comme une décision produit définitivement acceptée : **c'est notre nouvelle hypothèse stratégique à examiner ensemble avant de l'intégrer comme décision confirmée dans le document Markdown.**

---

# POINT DE REPRISE — PROCHAINE ÉVALUATION À MENER

**Statut de l'évaluation conservée :** la présente annexe B sert de matériau de travail pour investigation ; elle n'est pas un cahier des charges approuvé ni une liste de fonctions garanties.

**Prochaine étape demandée par le fondateur :** confronter précisément les huit dimensions du tableau de la section 5 aux solutions existantes, en distinguant à chaque fois : (a) capacité déjà disponible chez un concurrent ; (b) écart éventuel documenté ; (c) hypothèse restant à tester chez les utilisateurs ; (d) valeur potentielle pour l'acheteur et le vendeur. Tenir compte des biens physiques, des produits numériques, du commerce local et de la portée internationale. Ne pas présumer une décision de développement à partir de la seule conservation de cette évaluation.

---

# ANNEXE C — NOUVELLE ÉVALUATION D01 + D02 : DES HUIT DIMENSIONS À UN SYSTÈME COMMERCIAL COHÉRENT

**Date de l'échange :** 24 septembre 2026.  
**Version d'ajout :** 0.4.  
**Nature :** conservation détaillée de la réponse suivant l'annexe B. Les encadrés ont été transformés en titres, listes et tableaux Markdown, tout en préservant l'ensemble des idées, exemples, nuances et conclusions.  
**État de validation :** **ÉVALUATION ET HYPOTHÈSES DE CONCEPTION — AUCUNE APPROBATION AUTOMATIQUE D'UN CONCEPT, D'UNE ARCHITECTURE, D'UN FOURNISSEUR OU D'UNE LISTE DE FONCTIONNALITÉS.** Le fondateur a demandé de documenter l'étape avant de passer à la suivante. La base de travail D01 + D02 et le domaine D03 maintenu de côté ne sont pas remis en question.

**Note sur les références concurrentielles :** les descriptions de services et rapports cités ci-dessous correspondent aux éléments discutés dans la réponse d'origine. Elles constituent la trace de l'analyse, non une nouvelle vérification indépendante réalisée pour cette annexe. Pour prendre une décision technique ou commerciale, confirmer les disponibilités, les pays et les conditions directement dans les documentations à jour des plateformes.

Abraham, nous allons maintenant entrer dans une nouvelle phase de notre idéation : **la recherche de notre véritable avantage commercial et fonctionnel**.

Et je retiens ta correction : nous n'avons pas besoin d'inventer une fonctionnalité que personne au monde n'a jamais créée. Nous pouvons réunir des capacités qui existent séparément, les faire travailler ensemble et concevoir une expérience qui apporte davantage de valeur.

Mais nous devons aller plus loin que simplement additionner les fonctionnalités de plusieurs plateformes.

**Une application peut être très complète sans être suffisamment convaincante. Ce qui nous intéresse, c'est la manière dont toutes ses capacités vont permettre aux utilisateurs d'obtenir des résultats qu'ils ont encore du mal à obtenir aujourd'hui.**

Je vais donc répondre aux huit points que nous avions laissés ouverts.

# Évaluation D01 + D02 — Phase suivante

> **Nouvelle phase d'idéation : De la marketplace complète à un système commercial capable d'agir sur l'offre et la demande**
>
> **Notre base acquise :** un espace commerçant complet, un espace acheteur complet et un parcours commercial commun.
>
> **Notre travail actuel :** découvrir les mécanismes qui feront de cet ensemble un produit réellement utile, attractif, durable et commercialisable.
>
> **Statut :** analyse stratégique à examiner ensemble, non décision produit définitive.

## 1. Les demandes d'achat non satisfaites

### Ce que j'ai vérifié lors de l'analyse

Alibaba.com dispose déjà de son système *Request for Quotation* : un acheteur décrit un produit recherché, puis les fournisseurs peuvent lui faire des propositions. Le mécanisme concerne notamment les besoins d'approvisionnement et les produits personnalisés.

De son côté, Shopify permet aux commerçants d'identifier les recherches effectuées dans leur boutique qui n'ont produit aucun résultat.

Donc, deux choses existent déjà : recevoir une demande d'achat et analyser les recherches infructueuses.

### Ce que nous pouvons construire au-delà

Je voudrais que nous examinions un mécanisme plus complet :

#### La demande d'achat devient une opportunité commerciale exploitable

1. L'acheteur exprime ce qu'il souhaite obtenir, avec ses exigences.
2. Le système recherche d'abord parmi les offres réellement disponibles.
3. Si aucune offre ne convient, l'acheteur peut publier une demande active.
4. Les commerçants capables d'y répondre peuvent présenter une proposition.
5. Le commerçant qui ne possède pas le produit peut éventuellement consulter ses fournisseurs avant de répondre.
6. L'acheteur peut comparer les propositions et conclure une transaction.
7. Les demandes restées sans réponse peuvent alimenter une analyse commerciale agrégée, sans exposer inutilement les informations personnelles des acheteurs.

Le point particulièrement intéressant est que **le produit recherché n'a pas nécessairement besoin d'être déjà publié pour qu'une opportunité de transaction existe**.

Ce mécanisme peut aussi fonctionner pour les produits numériques personnalisés : logo, document, modèle graphique, livre personnalisé ou autre création conforme aux catégories autorisées par la plateforme.

Notre hypothèse de différenciation serait donc la continuité entre une demande, les propositions reçues, l'éventuel approvisionnement et la transaction finale.

---

## 2. Le commerce physique et le commerce numérique

### Ce qui existe déjà

Shopify POS relie les ventes en magasin, les commandes en ligne, les produits, les clients et les stocks.

Il serait donc incorrect de présenter la vente physique et numérique réunies comme une invention de notre projet.

### Ce que nous devons chercher à améliorer

Notre question est plus intéressante :

**Comment un commerçant peut-il utiliser notre application pour exercer son commerce quotidien tout en participant à une place de marché commune ?**

Imaginons trois situations.

#### Trois situations, un même espace commercial

**Situation A — Boutique physique**

Le commerçant vend un produit à un client qui se présente sur place. Il enregistre la vente, et la disponibilité publiée sur la marketplace est mise à jour.

**Situation B — Client de la marketplace**

Un acheteur découvre le produit en ligne, le réserve et choisit de venir le retirer dans la boutique.

**Situation C — Vente extérieure à la marketplace**

Le commerçant reçoit une commande par téléphone ou par un canal externe. Il peut l'enregistrer dans son système commercial sans prétendre que la vente provient de notre plateforme.

Ces situations permettent d'imaginer une application qui reste utile au commerçant même lorsque tous ses clients ne passent pas par notre marketplace.

**L'avantage recherché : l'utilisateur ne gère plus deux commerces séparés, l'un physique et l'autre numérique.**

---

## 3. La disponibilité réelle et la réservation

C'est ici que je vois une condition fondamentale de notre proposition de valeur.

Un acheteur n'a pas seulement besoin de découvrir un produit. Il doit pouvoir comprendre s'il peut réellement l'obtenir.

Shopify suit déjà plusieurs états de stock, notamment les quantités disponibles, engagées dans des commandes, indisponibles ou en cours d'acheminement.

La nouveauté de notre projet ne peut donc pas être simplement d'afficher une quantité.

### Mon hypothèse : introduire une disponibilité commercialement exploitable

#### Ce que l'acheteur pourrait voir

| État affiché | Signification proposée |
|---|---|
| **Disponible** | Le stock est suivi et la quantité permet l'achat. |
| **À confirmer** | Le vendeur doit confirmer la disponibilité actuelle. |
| **Sur commande** | Le vendeur peut rechercher ou préparer le produit dans un délai annoncé. |
| **Indisponible** | L'acheteur peut demander une notification ou déposer une demande d'achat. |

Nous pourrions relier cela aux réservations, aux ventes physiques et aux commandes.

Le véritable défi sera de produire une information fiable **sans obliger chaque vendeur à effectuer des dizaines de manipulations quotidiennes**.

Une disponibilité confirmée manuellement ne devra jamais être présentée comme un stock automatiquement vérifié.

---

# 4. La confiance : passer de la réputation à une transaction documentée

Je voudrais être particulièrement attentif à cette dimension.

Sur les marketplaces, la confiance dépend souvent de la réputation du vendeur, des avis, des informations commerciales et des protections de paiement.

Alibaba distingue déjà plusieurs formes de vérification des fournisseurs et propose notamment Trade Assurance pour certaines transactions éligibles.

Nous ne devons donc pas promettre une sécurité extraordinaire simplement parce que nous avons ajouté des badges.

Je vois une autre direction : **chaque transaction importante devrait produire un dossier commercial compréhensible par les deux parties.**

### Le dossier de transaction commun

Imaginons qu'un acheteur négocie un ordinateur avec un vendeur.

Au lieu que toutes les informations restent dispersées entre messages et captures d'écran, le système peut réunir :

- le produit et sa variante ;
- les caractéristiques convenues ;
- le prix final et les frais ;
- les conditions de garantie ou de retour annoncées ;
- la réservation et son expiration ;
- le paiement et son état vérifié ;
- les conditions de livraison ou de retrait ;
- la confirmation de réception ;
- les éventuels incidents et leur résolution.

Ce dossier servirait au vendeur, à l'acheteur et, dans la mesure des responsabilités effectivement assumées par la plateforme, au service d'assistance.

**La valeur ne serait pas de supprimer tous les litiges. Elle serait de rendre les engagements plus explicites et les incidents plus faciles à comprendre et à traiter.**

Pour les produits numériques, le dossier devrait également préciser la nature du fichier, la licence accordée, les éventuelles restrictions et les modalités d'accès.

---

# 5. Les produits numériques et la portée internationale

Tu as insisté sur une chose que nous devons conserver : **le produit ne doit pas être limité géographiquement par son concept**.

Prenons la vente de fichiers numériques.

Etsy prend déjà en charge les fichiers disponibles immédiatement et les créations numériques réalisées sur commande. Ses instructions indiquent toutefois que le téléchargement ne s'effectue pas directement dans l'application mobile Etsy : l'acheteur passe par son navigateur ou son ordinateur.

Shopify propose également une application permettant de vendre des fichiers et des liens d'accès à des contenus numériques.

Nous pouvons donc aller plus loin dans la conception d'une expérience commune aux deux catégories de produits.

### Un produit physique et un produit numérique ne se livrent pas de la même manière

| Produit physique | Produit numérique |
|---|---|
| Stock, emballage, destination, transport, retrait, remise et retour. | Fichier, droits d'accès, téléchargement, licence, version et éventuelle livraison personnalisée. |

Mais nous pouvons conserver une structure commune : produit, offre, accord, paiement, exécution et assistance.

Cela ouvre aussi des possibilités commerciales intéressantes : un vendeur peut proposer un produit physique, un produit numérique ou une combinaison des deux.

Pour l'international, nous devons cependant distinguer trois choses : être accessible depuis un pays, accepter le paiement d'un acheteur dans ce pays et pouvoir reverser légalement les fonds au vendeur concerné. Stripe Connect, par exemple, prend en charge des paiements et reversements internationaux, mais les possibilités exactes dépendent des pays, des types de comptes et des fonctionnalités disponibles.

Notre architecture peut être mondiale sans que nous annoncions prématurément toutes les transactions comme disponibles partout.

---

# 6. L'intelligence commerciale : une observation importante issue de la recherche

Abraham, sur ce point, notre investigation nous oblige à être plus précis que dans l'analyse précédente.

Nous avions envisagé que les recherches sans résultat puissent aider les commerçants à savoir quels produits proposer.

**Or Shopify dispose déjà d'un rapport montrant les recherches qui n'ont donné aucun résultat**, précisément pour aider le marchand à examiner les produits recherchés par ses visiteurs.

Cela ne détruit pas notre idée. Cela nous indique où nous devons aller au-delà.

La différence potentielle serait de ne pas nous arrêter à un rapport d'analyse.

### De l'observation à une action commerciale

**Observation :** plusieurs acheteurs recherchent un produit qui n'est pas disponible.

↓

**Compréhension :** quels modèles, quantités, budgets, lieux et délais sont réellement demandés ?

↓

**Possibilité d'action :** le commerçant examine ses fournisseurs ou propose une alternative.

↓

**Nouvelle offre :** il peut publier le produit ou répondre aux demandes concernées.

↓

**Résultat :** le système distingue les demandes satisfaites, non satisfaites et les ventes effectivement conclues.

↓

**Apprentissage :** le commerçant peut réexaminer ses décisions à partir de résultats observés.

La différence que nous cherchons n'est pas « l'application possède des données ».

C'est : **l'application aide les utilisateurs à transformer des informations commercialement utiles en actions, puis à comprendre les résultats de ces actions.**

---

# 7. La question de l'adoption : pourquoi un vendeur viendrait-il chez nous ?

C'est une question économique autant que fonctionnelle.

Une marketplace a besoin de vendeurs pour attirer les acheteurs et d'acheteurs pour intéresser les vendeurs.

Je ne veux pas que nous supposions que de belles interfaces suffiront à résoudre cette difficulté.

Voici une piste de raisonnement.

### Le commerçant reçoit une valeur avant même sa première vente sur notre marketplace

Il peut utiliser son espace pour organiser son commerce habituel.

Il peut présenter une boutique numérique et partager ses offres.

Il peut enregistrer des commandes issues de ses propres clients.

Il peut suivre ses ventes, stocks et réservations.

Ensuite, la marketplace lui apporte potentiellement une valeur supplémentaire : l'accès à des acheteurs et à des demandes qu'il n'aurait pas découverts seul.

Ce modèle présente une logique d'adoption intéressante, même s'il faudra en vérifier l'attrait réel.

Mais je souhaite ajouter une deuxième possibilité : **un commerçant pourrait être simultanément vendeur, acheteur professionnel et distributeur.**

Shopify Collective relie déjà des détaillants et fournisseurs, et permet à une entreprise de jouer les deux rôles sous certaines conditions d'éligibilité et de pays.

Pour notre système, cette relation pourrait éventuellement permettre à un vendeur qui ne possède pas un article recherché de consulter un fournisseur partenaire et de répondre à la demande de l'acheteur, sans prétendre posséder physiquement ce qu'il n'a pas.

Cela ouvre une dimension supplémentaire : **les commerçants pourraient également participer à la résolution des besoins des autres commerçants**.

---

# 8. La viabilité commerciale : qu'est-ce qui justifierait réellement un paiement ?

Abraham, nous devons identifier ce que les utilisateurs seraient prêts à rémunérer, au lieu d'imaginer des abonnements simplement parce que nous développons une application.

J'entrevois plusieurs sources de valeur à tester :

| Valeur produite | Bénéficiaire | Modèle économique à examiner |
|---|---|---|
| Gestion quotidienne du commerce | Vendeur | Abonnement ou offre de gestion |
| Accès à de nouveaux acheteurs | Vendeur | Commission sur transaction conclue |
| Accès à des demandes pertinentes | Vendeur | Offre commerciale adaptée, sans facturer des contacts inutiles |
| Services de transaction | Acheteur et vendeur | Frais transparents associés à un service réel |
| Gestion avancée de plusieurs boutiques | Entreprise | Abonnement professionnel |
| Vente de produits numériques | Créateur et commerçant | Commission ou formule commerciale |
| Analyse et assistance commerciale | Vendeur | Fonctionnalités professionnelles, si leur valeur est démontrée |

Ce tableau présente des modèles à étudier, pas des tarifs ou des revenus déjà validés.

Je serais attentif à une question particulière : **un vendeur acceptera-t-il de payer notre plateforme pour une valeur qu'il estime déjà pouvoir obtenir gratuitement avec ses outils actuels ?**

La réponse dépendra de la valeur réellement apportée, de l'effort économisé et des ventes ou décisions que le système l'aide à réaliser.

---

# 9. Maintenant, ce que cette évaluation fait apparaître

Nous avons répondu aux huit dimensions précédentes. Et je vois émerger une structure de produit beaucoup plus précise.

## Nouvelle hypothèse architecturale et commerciale : trois systèmes qui travaillent ensemble

### 1. Le moteur commercial

Il permet aux commerçants de gérer leurs produits, leurs approvisionnements, leur stock, leurs commandes, leurs ventes et leurs relations clients.

**Valeur :** faire fonctionner le commerce.

### 2. Le réseau d'offre et de demande

Il permet de découvrir des produits, publier des besoins, recevoir des propositions, comparer des offres et mettre en relation acheteurs, commerçants et éventuellement fournisseurs.

**Valeur :** créer de nouvelles possibilités commerciales.

### 3. Le moteur de transaction et d'amélioration

Il relie les accords, les paiements, les livraisons, les accès numériques, les incidents et les résultats commerciaux.

Il peut ensuite aider les utilisateurs à comprendre ce qui s'est passé et à prendre de meilleures décisions.

**Valeur :** transformer les possibilités en résultats et apprendre de l'expérience.

Ces trois ensembles forment une proposition plus cohérente qu'une succession de modules indépendants.

Et c'est là que nous pouvons commencer à formuler notre différence potentielle :

> **Une plateforme qui ne se contente pas de présenter le commerce : elle aide à le faire fonctionner.**
>
> Elle relie les besoins aux offres. Les offres aux accords. Les accords aux transactions. Les transactions aux résultats. Et les résultats aux prochaines décisions commerciales.

# 10. Pour nous assurer que ce produit dépasse réellement l'effet « belle idée »

Je voudrais maintenant traduire notre vision en résultats observables.

| Pour l'acheteur | Pour le vendeur |
|---|---|
| Trouver davantage d'offres pertinentes | Recevoir davantage de demandes pertinentes |
| Réduire les recherches sans issue | Repérer des besoins auxquels il pourrait répondre |
| Éviter les déplacements inutiles | Réduire les annonces et informations périmées |
| Comparer des propositions complètes | Mieux choisir ce qu'il propose et approvisionne |
| Comprendre les engagements avant paiement | Suivre ses accords, réservations et commandes |
| Suivre l'exécution de son achat | Suivre ventes, remises et incidents |
| Retrouver ses achats physiques et numériques | Comprendre les résultats de son activité |

Je ne présente pas ces bénéfices comme déjà démontrés. **Ce sont les résultats que nous voulons rendre possibles et que nous devrons mesurer pendant les tests.**

---

## Mon point de synthèse pour cette nouvelle phase

Abraham, notre réflexion a progressé.

Au départ, nous avions deux domaines complémentaires et l'idée d'une marketplace avec un espace vendeur et un espace acheteur.

Nous avons ensuite examiné neuf axes de différenciation.

La présente évaluation permet de les rapprocher dans une même logique commerciale : **un moteur commercial, un réseau d'offre et de demande, et un moteur de transaction et d'amélioration.**

Je retiens surtout une possibilité importante : notre produit pourrait devenir utile non seulement lorsque quelqu'un achète un article déjà publié, mais aussi lorsqu'un besoin apparaît, lorsqu'un commerçant cherche à y répondre, lorsqu'il doit s'approvisionner et lorsqu'il cherche à comprendre pourquoi une vente a réussi ou échoué.

C'est cette continuité que je voudrais que nous approfondissions maintenant.

**La prochaine étape de notre Design Thinking sera de construire et d'évaluer plusieurs parcours complets dans ce système : achat d'un produit déjà disponible, recherche infructueuse suivie d'une demande, approvisionnement d'un commerçant et achat international d'un produit numérique.**

Ces parcours nous permettront de vérifier si les trois systèmes envisagés fonctionnent réellement ensemble et si l'utilisateur obtient une valeur que la simple juxtaposition de fonctionnalités ne lui apporterait pas.

---

# REGISTRE DE REPRISE — APRÈS L'ANNEXE C

| Élément | État conservé |
|---|---|
| Association des domaines D01 + D02 pour la réflexion | **Cadre de travail confirmé par le fondateur.** |
| Domaine D03 | **Mis de côté pour le moment ; non intégré par défaut.** |
| Vision de produit international, physique et numérique | **Contrainte de réflexion formulée par le fondateur ; détails opérationnels à étudier.** |
| Les huit dimensions examinées ci-dessus | **Évaluation consignée ; ne vaut pas preuve de besoin ni décision de développement.** |
| Moteur commercial + réseau d'offre/demande + moteur transaction/amélioration | **Hypothèse de structuration du produit — à évaluer, pas une architecture approuvée.** |
| Modèles économiques du tableau | **Possibilités à tester ; aucun tarif, revenu ou modèle final décidé.** |
| Quatre parcours complets pour la prochaine phase | **Proposition de point de reprise, dans l'attente du feu vert du fondateur.** |

**Instruction de continuité :** ne pas réouvrir inutilement la discussion sur la base D01/D02 ou sur une prétendue nécessité de réduire le concept à une coquille vide. Conserver les analyses précédentes sans les transformer en décisions non consenties. Lors de la prochaine étape, produire une évaluation concrète des parcours, en distinguant fonctionnalités proposées, contraintes techniques, inconnues, bénéfices attendus et preuves encore nécessaires.

---

# ANNEXE D — ÉVALUATION CORRIGÉE : UNE MARKETPLACE OUVERTE SUR LA DÉCOUVERTE SOCIALE

**Date de l'échange :** 24 septembre 2026.  
**Version d'ajout :** 0.5.  
**Périmètre :** D01 + D02 ; le D03 reste mis de côté en tant que domaine d'étude indépendant. L'observation des réseaux sociaux comme lieux de découverte commerciale ne vaut pas décision de fusionner le D03.  
**État :** analyse détaillée conservée pour approfondissement ; **les deux corrections de périmètre formulées par le fondateur sont confirmées**, tandis que les fonctionnalités envisagées restent des hypothèses tant qu'elles ne sont pas approuvées individuellement.

> **PRIORITÉ DE LECTURE — CORRECTIONS DE PÉRIMÈTRE.** Cette annexe reprend et corrige la dernière évaluation orale. Les suggestions initiales d'un programme d'affiliation (codes individuels, commissions pour chaque partageur, promoteurs rémunérés et tableau de rémunération) et de connexions API aux réseaux sociaux (publication pilotée, récupération de conversations ou synchronisations automatiques) **ne sont pas retenues au stade actuel**. Elles ne doivent pas devenir des exigences implicites, même si elles avaient été longuement décrites au cours du brainstorming. Le contenu de l'annexe D prévaut sur ces passages de l'évaluation orale pour la suite du projet. La réflexion D01 + D02 des annexes A à C reste conservée.

## D.1. L'intention réelle du fondateur : que la marketplace ne soit pas une planète isolée

La plateforme D01 + D02 possède déjà une base : les vendeurs peuvent exercer leur commerce ; les acheteurs peuvent rechercher, comparer, acheter et suivre leurs commandes ; la demande et l'offre sont reliées à des transactions et à des améliorations futures. Le fondateur attire maintenant l'attention sur un élément de réalité commerciale : **les produits ne se font pas connaître seuls**. Les clients découvrent souvent des articles et recommandations là où ils passent du temps, notamment sur WhatsApp, Facebook, Instagram, TikTok, dans des communautés, au travers de conversations personnelles, de publications, de vidéos et de publicités.

Cette observation **n'est pas une commande de construire un réseau social**, **ni d'automatiser les réseaux externes** et **ni de rémunérer chaque partage**. Elle demande de concevoir notre marketplace pour qu'elle ne coupe pas le commerce des lieux où naissent l'attention, le besoin et la confiance.

La question à évaluer est : **comment rendre naturel le passage d'une découverte sociale vers une offre commerciale claire et un achat suivi, puis rendre cette offre facilement partageable à nouveau ?**

### Ce qui demeure acquis, sans nouvelle discussion de base

- Une seule plateforme pensée à partir des deux domaines D01 « commerce, vente et distribution de produits » et D02 « achats, consommation et recherche de bonnes affaires ».
- Un espace commerçant et un espace acheteur qui se répondent, sans transformer la vision complète en une « V1 » arbitrairement évidée.
- Une capacité conceptuelle à traiter des produits physiques et numériques, avec une ambition au-delà d'une seule région ; les modalités de paiement et de vente restent propres aux marchés effectivement pris en charge.
- La continuité entre besoins, offres, accords, transactions, exécution et informations permettant de meilleures décisions commerciales.
- Le D03 est toujours mis de côté comme domaine à examiner séparément plus tard.

## D.2. Le problème du commerce isolé et le rôle de la découverte sociale

Une boutique numérique peut avoir un catalogue excellent et rester peu visitée. L'acheteur peut voir un produit dans un statut WhatsApp ou une vidéo TikTok sans savoir où trouver l'offre exacte, si elle est encore disponible, à quelles conditions l'acheter et comment suivre la commande. Le vendeur peut partager ses articles dans plusieurs conversations puis devoir reprendre les mêmes informations à chaque nouvel intéressé.

Nous pouvons donc distinguer trois moments :

1. **Faire découvrir** : une personne rencontre le produit, le besoin ou la recommandation dans un contexte social, personnel ou publicitaire.
2. **Permettre de décider** : elle accède à l'offre pertinente, à jour autant que possible, et aux informations nécessaires pour comparer et poser des questions.
3. **Faire fonctionner l'achat** : la proposition, la réservation éventuelle, la commande, le paiement disponible et la livraison physique ou numérique entrent dans notre système commercial.

Une marketplace doit accueillir les personnes qui la visitent directement **et** celles qui arrivent depuis un produit partagé à l'extérieur. Le réseau social reste un lieu de découverte ; la plateforme est le lieu où l'offre et la transaction peuvent être organisées.

## D.3. Ce qui existe déjà, et ce que nous recherchons sans prétendre tout inventer

Le partage de produits, les boutiques en ligne, les liens directs et le social commerce existent déjà. Des services tels que TikTok Shop ou des outils pour commerçants illustrent différents modes de rapprochement entre contenu, offre et achat. **Nous ne présentons donc pas un simple bouton « partager » comme une innovation inédite.**

La proposition à examiner est la réunion cohérente, dans notre D01 + D02, de ces parcours : gestion quotidienne du commerce ; offre consultable ; découverte extérieure ; accès direct au bon produit ; achat suivi ; satisfaction et possibilité de nouvelle recommandation. Il ne s'agit pas d'imposer une fonctionnalité artificielle parce qu'elle existe ailleurs, mais de mesurer ce qu'apporte leur continuité à l'acheteur et au vendeur.

## D.4. Les acteurs à considérer, sans créer artificiellement un programme d'affiliation

Au stade actuel, trois rôles suffisent au modèle conceptuel :

| Rôle | Contribution à l'écosystème | Ce qu'il n'implique PAS |
|---|---|---|
| **Vendeur / commerçant** | Propose et gère les produits, donne des informations, exécute les commandes, partage éventuellement ses offres. | Obligation de payer des commissions d'affiliation ou de piloter les réseaux sociaux par API. |
| **Acheteur** | Découvre, recherche, compare, achète, contrôle la réception et peut recommander librement un article. | Compte affilié, code personnel, rémunération ou inscription pour partager un produit. |
| **Plateforme** | Rend les offres accessibles, partageables et liées au parcours commercial commun D01 + D02. | Contrôle des plateformes tierces, récupération automatique de leurs conversations ou garantie de ventes issues d'un partage. |

Un créateur, un proche, un client satisfait ou une communauté peut faire découvrir une offre **sans devenir un quatrième rôle technique ni intégrer un programme de rémunération**. Un vendeur peut être aussi acheteur et inversement ; les rôles sont des usages, non des comptes mutuellement exclusifs.

## D.5. Mécanisme 1 — Une offre qui peut sortir de la marketplace et revenir au bon endroit

L'offre publiée par le commerçant devrait pouvoir être partagée facilement, depuis les surfaces que notre application contrôle et par les mécanismes ordinaires du téléphone.

**Parcours conceptuel :**

1. Le vendeur publie une offre avec ses informations utiles : produit, variante, prix, disponibilité déclarée ou confirmée selon le cas, conditions.
2. Il choisit de partager l'offre : lien copiable, fonction de partage du téléphone, ou support préparé avec les informations essentielles.
3. Il décide lui-même où et comment la publier : statut WhatsApp, conversation consentie, groupe où le partage est permis, Facebook, Instagram, TikTok, courriel ou autre canal.
4. La personne intéressée ouvre **la fiche exacte de l'offre**, non la page d'accueil générique de notre marketplace.
5. Si l'application est installée et que le dispositif le permet, le lien peut l'ouvrir au bon écran ; sinon, une page web mobile légère peut montrer le produit et proposer une suite adaptée.
6. Le client retrouve les informations actuellement détenues par notre système, choisit sa variante, pose ses questions et passe éventuellement commande.

**La valeur n'est pas le lien lui-même, mais la suppression d'une rupture de parcours entre découverte sociale et décision d'achat.**

**Précision :** un lien produit ordinaire n'est pas un lien affilié rémunéré. Aucun code individuel de partageur, aucune commission par défaut et aucun suivi de personnes à travers des plateformes tierces n'est requis par cette proposition.

## D.6. Mécanisme 2 — Le produit partagé reste relié à sa réalité commerciale

Le lien doit pointer vers l'offre actuelle dans notre système. Il doit éviter de reconduire aveuglément des prix, variations ou quantités anciens. Si l'article a été vendu, le visiteur ne devrait pas recevoir une assurance trompeuse de disponibilité ; il peut voir son état, contacter le vendeur, choisir une variante encore disponible ou, si notre hypothèse d'offre/demande est retenue, exprimer son besoin.

Ce que nous pouvons maintenir dans notre propre système : prix du catalogue, variantes, réservations, stock suivi, informations de commande et conditions actuelles.

Ce que nous ne devons pas promettre : modifier rétroactivement le texte, la vidéo ou l'image déjà publiés sur des plateformes externes. Un visuel exporté est une photographie commerciale à un instant donné ; la fiche accessible par le lien reste le point de consultation de l'offre que nous contrôlons.

## D.7. Mécanisme 3 — Une présentation commerciale facile à réutiliser, sans usine à publicité

Le catalogue peut servir à préparer des informations et supports de présentation : photo déjà disponible, titre, courte description, prix, conditions utiles et lien direct. Le vendeur reste libre de les copier, partager, adapter et publier à la main où il le souhaite.

Une assistance rédactionnelle ou des formats visuels pourront être étudiés si cela apporte une utilité avérée ; ils ne sont pas retenus comme obligation de génération vidéo, d'achat d'API coûteuses ou de gestionnaire de campagnes publicitaires. La production d'un support, sa diffusion sociale et une publicité payante sont des opérations distinctes.

**Résultat recherché :** un vendeur ne ressaisit pas toutes les informations chaque fois qu'il parle d'un produit et l'acheteur voit une offre compréhensible lorsqu'il arrive sur notre plateforme.

## D.8. Mécanisme 4 — Du message reçu ailleurs à une commande organisée ici

Le vendeur peut recevoir une demande dans une conversation WhatsApp, sur Facebook, par téléphone ou en personne. Il peut ensuite, volontairement, créer ou sélectionner l'offre concernée dans notre application et transmettre au client le lien d'une fiche, d'une proposition ou d'une commande, selon les parcours qui seront retenus.

**Exemple :** « Est-ce que ce modèle est disponible ? » → le vendeur consulte son espace commercial → il confirme la bonne variante et le prix → il envoie le lien exact → l'acheteur voit les conditions → si les deux parties sont d'accord, la transaction est enregistrée dans le suivi commun.

La conservation d'un dossier commercial doit reposer sur les données réellement fournies et les consentements pertinents. **Nous ne postulons aucune lecture automatique des messageries privées, aucune synchronisation des comptes personnels et aucune connexion officielle obligatoire à WhatsApp, Facebook, Instagram ou TikTok.**

## D.9. Mécanisme 5 — Le monde social complète les deux sens « offre → demande » et « demande → offre »

L'observation du fondateur renforce un principe déjà présent dans notre analyse :

- **Offre → demande :** le vendeur publie une offre, la partage librement dans son environnement social et accueille les acheteurs intéressés.
- **Demande → offre :** l'acheteur exprime un besoin que le catalogue ne satisfait pas encore ; si ce mécanisme est retenu, un vendeur susceptible d'y répondre peut formuler une proposition.
- **Transaction → amélioration :** les demandes, ventes et ruptures observables dans notre système éclairent de futures décisions commerciales.
- **Satisfaction → recommandation libre :** un acheteur peut parler du produit à d'autres, sans programme d'affiliation ni rémunération automatique.

L'environnement social est donc **un pont d'accès et de diffusion**, pas un substitut aux activités D01/D02, ni une infrastructure que nous devons reconstituer.

## D.10. La publicité dans cette vision : la reconnaître sans construire une régie publicitaire

Le fondateur a employé l'image de « l'aimant de la publicité ». Il désigne le rôle de la visibilité, des contenus et de la recommandation pour faire rencontrer les commerçants et les acheteurs. Cela ne constitue pas une instruction de développer immédiatement une plateforme d'achat média.

Notre système peut être conçu de manière à fonctionner lorsqu'une personne découvre l'offre par une publicité diffusée **hors de notre application**, comme lorsqu'elle la découvre par un ami. La suite commerciale est la même : ouverture de la fiche précise, consultation, question, choix, commande, exécution.

Un suivi simple des commandes issues d'un canal peut éventuellement être envisagé **à partir des informations que la plateforme collecte légitimement** (p. ex. lien d'entrée déclaré, question volontaire sur la provenance), mais les tableaux d'attribution publicitaire avancée, les campagnes Meta/TikTok automatisées et l'optimisation des dépenses publicitaires ne sont pas inclus par défaut.

Il faut distinguer : visite, intérêt, commande, paiement confirmé, exécution et satisfaction. Nous n'affirmerons pas connaître toutes les expositions ni les résultats d'une campagne diffusée ailleurs.

## D.11. Produits physiques et numériques, circulation locale et internationale

Le principe « offre partageable → fiche exacte → achat suivi » concerne aussi bien une paire de chaussures qu'un modèle numérique ou un livre électronique. L'exécution diffère : transport, retrait et retour pour le physique ; fichier, licence, accès et éventuelle mise à jour pour le numérique. Ces différences restent gouvernées par notre réflexion D01 + D02.

Le partage social ne doit pas se limiter au Bénin ou à l'Afrique de l'Ouest. Un acheteur situé dans un autre pays peut découvrir un produit numérique, à condition que le vendeur, l'acheteur, la catégorie de produit, les modalités de paiement et les autres obligations concernées soient pris en charge. Une vision géographique large ne signifie pas une couverture opérationnelle universelle déjà acquise.

## D.12. La boucle de valeur corrigée

```text
Un commerçant crée ou actualise une offre
                    ↓
L'offre circule dans la marketplace et peut être partagée librement
                    ↓
Une personne découvre le produit ou reconnaît un besoin
                    ↓
Elle accède directement à l'offre exacte et actuelle
                    ↓
Elle compare, questionne, réserve ou achète selon le cas
                    ↓
La commande et son exécution sont suivies dans notre système
                    ↓
Le commerçant et l'acheteur obtiennent un résultat et des informations utiles
                    ↓
Le commerce s'améliore ; un client satisfait peut recommander librement
```

**Ce cycle ne contient aucune étape obligatoire d'affiliation, de commission, d'API sociale ou d'automatisation publicitaire.**

## D.13. Ce que cette convergence apporte réellement à D01 + D02

| Pour le vendeur | Pour l'acheteur | Ce qui doit être testé |
|---|---|---|
| Partager sa boutique et une offre identifiable sans recréer un catalogue ailleurs. | Retrouver exactement le produit aperçu dans une publication. | Le lien et l'information disponible réduisent-ils les demandes répétées ? |
| Utiliser son commerce habituel et des canaux sociaux librement choisis. | Acheter sans devoir rechercher à nouveau l'article partagé. | Le passage social → fiche produit → achat est-il fluide sur Android et navigateur mobile ? |
| Réduire les contradictions entre une offre commerciale consultable et d'anciens messages. | Comprendre si le produit est disponible et sous quelles conditions. | Comment l'utilisateur comprend-il la fraîcheur des informations ? |
| Convertir volontairement une conversation extérieure en une proposition ou commande organisée. | Avoir un récapitulatif de ce qui a été convenu. | Le parcours reste-t-il rapide sans imposer trop d'étapes ? |
| Bénéficier de nouvelles visites lorsqu'une offre est librement recommandée. | Partager une bonne trouvaille sans procédure d'affiliation. | Le partage libre apporte-t-il des visiteurs réellement intéressés ? |
| S'appuyer sur une fiche produit physique ou numérique commune. | Acheter selon un mode d'exécution approprié au produit. | Quelles frictions varient selon les pays et les catégories ? |

Les bénéfices du tableau sont **des résultats visés**, pas des gains déjà mesurés ni des engagements de performance.

## D.14. Risques et garde-fous à ne pas oublier

1. **Trafic sans achat :** le partage peut générer de la curiosité sans demande pertinente ni vente. Ne pas confondre audience et transaction.
2. **Information périmée hors plateforme :** ne pas promettre l'actualisation rétroactive des publications externes ; la fiche de destination doit signaler son état connu.
3. **Rupture de parcours :** ne pas envoyer l'utilisateur vers une page d'accueil sans rapport avec le produit découvert.
4. **Partage abusif :** aucun système ne doit inciter au spam, à l'accès non autorisé à des groupes ou à l'envoi de messages non sollicités.
5. **Dépendance aux canaux extérieurs :** une modification d'interface ou des règles d'un réseau social ne doit pas empêcher le commerce de fonctionner dans notre application.
6. **Promesse de suivi trompeuse :** ne pas revendiquer l'origine exacte de toutes les ventes, la lecture des conversations ou une connaissance exhaustive de l'audience extérieure.
7. **Accès international réel :** ne pas présenter les paiements, taxes, livraisons et règlements comme identiques pour tous les pays.
8. **Simplicité d'usage :** garder la transition entre découverte, offre et achat compréhensible pour les utilisateurs qui ne souhaitent pas gérer des outils marketing.

## D.15. Synthèse stratégique corrigée

> **Une marketplace complète, non isolée :** les vendeurs y font fonctionner leur commerce ; les acheteurs y trouvent et obtiennent des produits ; les offres, boutiques et besoins peuvent circuler naturellement en dehors de l'application et ramener les personnes vers le bon parcours commercial.
>
> **La valeur ne réside pas dans la possession des réseaux sociaux, mais dans la continuité entre la découverte extérieure et le commerce organisé chez nous.**

Cette synthèse complète les trois systèmes précédemment envisagés :

1. **Moteur commercial :** boutiques, produits, stocks, fournisseurs, prix, commandes, clients.
2. **Réseau d'offre et de demande :** recherche, catalogue, besoins exprimés, propositions et comparaisons.
3. **Transaction et amélioration :** accords, paiements pris en charge, livraison physique ou accès numérique, incidents, résultats.

**L'ouverture sociale est une qualité transversale de ces trois systèmes**, non un quatrième monde technique qui impose automatiquement des API, une régie publicitaire ou un programme d'affiliation.

### Décisions de périmètre explicitement confirmées dans cet échange

| Réf. | Décision / correction | Statut |
|---|---|---|
| DEC-007 | Tenir compte du rôle essentiel des réseaux sociaux comme lieux de découverte et de circulation des offres pour ne pas isoler la marketplace. | **CONFIRMÉ — intention de conception** |
| DEC-008 | Ne pas retenir à ce stade un programme d'affiliation fondé sur le partage rémunéré, les codes individuels, les commissions et la gestion d'affiliés. | **CONFIRMÉ — exclusion du périmètre actuel ; éventuellement réexaminable plus tard** |
| DEC-009 | Ne pas retenir à ce stade les connexions API à WhatsApp, Facebook, Instagram ou TikTok comme condition ou module du produit. | **CONFIRMÉ — exclusion du périmètre actuel ; éventuellement réexaminable plus tard** |
| DEC-010 | Ne pas traduire la métaphore du « mariage des mondes » en obligation de bâtir un réseau social interne ou une régie publicitaire. | **CONFIRMÉ — clarification d'intention** |

### Hypothèses ouvertes, non validées automatiquement

| Réf. | Proposition | Statut |
|---|---|---|
| HYP-006 | Fiches et boutiques facilement partageables, avec liens ouvrant directement l'offre précise. | **À ÉVALUER** |
| HYP-007 | Page d'accueil mobile du produit partagé pour une personne n'ayant pas encore l'application. | **À ÉVALUER TECHNIQUEMENT ET EN USAGE** |
| HYP-008 | Transformation volontaire d'une demande reçue ailleurs en proposition/commande suivie. | **À ÉVALUER** |
| HYP-009 | Préparation de supports commerciaux simples à partir des données déjà saisies dans le catalogue. | **À ÉVALUER ; PAS DE GÉNÉRATION VIDÉO OU D'API SOCIALE IMPOSÉE** |
| HYP-010 | Une information commerciale actuelle et compréhensible lors de l'ouverture d'un ancien lien partagé. | **À ÉVALUER AVEC LA LOGIQUE DE STOCK ET DE RÉSERVATION** |

### Point de reprise recommandé pour la prochaine évaluation

Tester sur le papier puis auprès d'utilisateurs des parcours concrets, sans remettre en question les bases D01 + D02 :

1. Une boutique publie un article physique, le partage manuellement dans un statut WhatsApp et un acheteur arrive directement à la bonne fiche, commande et suit la remise.
2. Un commerçant reçoit une question depuis Facebook ou par téléphone, prépare volontairement une proposition commerciale et envoie son lien ; aucune conversation privée n'est aspirée.
3. Un acheteur découvre un produit numérique partagé par un ami situé dans un autre pays, consulte les conditions et accède au fichier après une transaction réellement prise en charge.
4. Une offre partagée devient indisponible : le visiteur comprend son état et, si le mécanisme est retenu, peut exprimer son besoin ou examiner une autre proposition.

Pour chaque parcours : relever le résultat concret, l'effort pour l'acheteur et le vendeur, les informations réellement maîtrisées par notre plateforme, les dépendances extérieures et les problèmes encore non résolus.

**Statut final de l'annexe D :** corrections du fondateur confirmées ; vision de convergence sociale documentée ; fonctionnalités proposées et gains attendus non encore validés ; prochaine investigation à conduire après son accord.
---

# ANNEXE E — FEUILLE DE PROGRESSION APRÈS LA VERSION 0.5 : CE QU'IL RESTE À ÉVALUER

**Origine :** réponse à « Il nous reste quoi ? » après la version 0.5.  
**Statut :** feuille de route de réflexion, **pas** un plan de découpage de V1 ni une preuve de faisabilité.  
**Consigne ultérieure du fondateur :** ne pas consigner cette feuille de route isolément ; attendre de l'avoir approfondie avec les évaluations suivantes. L'annexe E est donc ajoutée avec les annexes F et G dans la même version 0.6.

## E.1. Où nous en étions

Le travail déjà établi et documenté au moment de cette réponse :

- **D01 + D02 :** une même plateforme pour les commerçants et les acheteurs.
- **Base commerciale :** produits, besoins, offres, commandes, paiements, livraisons, produits numériques et suivi.
- **Direction d'innovation envisagée :** relier les besoins, les offres, l'activité commerciale et les résultats.
- **Ouverture sociale :** permettre aux produits et boutiques de circuler naturellement sur les réseaux sociaux, sans programme d'affiliation ni intégrations API sociales complexes à ce stade.
- **Document de référence :** version 0.5, qui a été conservée en totalité avant les présents ajouts.

L'objectif restant : passer de la vision à la démonstration que le système peut fonctionner, se différencier et devenir une entreprise viable, sans recommencer l'idéation depuis le début.

## E.2. Les six évaluations annoncées

### 1. Mettre la vision à l'épreuve des parcours commerciaux réels

Examiner ce que vit chaque acteur, du début jusqu'au résultat, notamment :

1. Un acheteur trouve un produit existant, le paie et le reçoit.
2. Un acheteur ne trouve rien, exprime un besoin et reçoit des offres.
3. Un commerçant s'approvisionne pour répondre à une demande.
4. Une personne découvre un produit sur WhatsApp ou TikTok puis rejoint la plateforme pour l'acheter.
5. Un vendeur propose un produit numérique à une personne située dans un autre pays.

**Objectif :** vérifier que les idées coopèrent en un produit cohérent et ne se réduisent pas à des fonctionnalités indépendantes.

### 2. Identifier les mécanismes de la différence recherchée

Examiner la recherche orientée besoins, les demandes sans offre existante, la continuité physique/numérique, la circulation sociale des produits, la transaction documentée et l'intelligence commerciale.

**Objectif :** formuler la valeur propre de leur combinaison sans revendiquer artificiellement l'invention de chaque fonction.

### 3. Résoudre les obstacles de fonctionnement

Travailler la disponibilité, la confiance, la fraude, les paiements, les litiges, les livraisons, la qualité des offres et l'accès aux produits numériques ; clarifier les responsabilités du vendeur, de l'acheteur et de la plateforme.

**Objectif :** des mécanismes de solution concrets, et non un simple catalogue de problèmes.

### 4. Établir une stratégie d'adoption et de croissance

Comment attirer les premiers vendeurs, pourquoi viendraient-ils avant une grande audience, comment attirer les acheteurs et comment exploiter le partage social sans dépendre d'intégrations imposées ?

**Objectif :** savoir comment la plateforme commence à vivre et comment sa valeur peut augmenter avec l'utilisation.

### 5. Construire et vérifier le modèle économique

Évaluer ce que les vendeurs pourraient rémunérer, à quel moment et pour quelle valeur, puis confronter les revenus possibles aux coûts des paiements, du stockage numérique, de l'IA éventuelle, de l'assistance et de l'exploitation.

**Objectif :** viser un produit commercialisable, sans inventer des revenus validés.

### 6. Consolider la vision avant la conception détaillée

Synthétiser proposition de valeur, parcours, mécanismes différenciants, règles, modèle économique, architecture générale de l'application Android et documentation exploitable pour le développement.

**Objectif :** un concept assez cohérent pour concevoir sans réinventer constamment le produit. Cette étape ne supprime pas la nécessité d'une validation auprès de personnes réelles.

## E.3. Les quatre questions communes à chaque parcours

1. Que veut réellement accomplir l'utilisateur ?
2. Comment l'application lui permet-elle d'y parvenir concrètement ?
3. Quelles difficultés apparaissent et quelles solutions concevons-nous ?
4. Quel résultat rend l'application intéressante plutôt que de continuer avec les moyens habituels ?

**Attention au statut :** cette feuille de route est une méthode de travail acceptée comme suite de la discussion. Elle ne transforme pas les mécanismes mentionnés en exigences finales.

---

# ANNEXE F — ÉVALUATION 1 : ÉPROUVER LE CONCEPT PAR CINQ PARCOURS COMMERCIAUX

**Origine :** réponse suivant la demande « Il faut commencer », après la feuille de route.  
**Statut :** scénarios conceptuels détaillés et solutions proposées à examiner ; aucun test utilisateur ni paiement réel n'a été effectué dans cet échange.  
**Méthode :** ne pas rediscuter la base D01 + D02, mais forcer l'ensemble à résoudre des situations concrètes, du début à la fin.

## F.1. Du concept à l'expérience commerciale réelle

L'application envisagée associe vendeurs, acheteurs, besoins, offres, transactions et circulation sociale des produits. L'épreuve consiste à vérifier comment ces composantes coopèrent dans l'usage réel.

L'acheteur ne doit pas devoir connaître le moteur de recherche, le stock, les commandes ou les paiements : il veut acheter son produit. Le commerçant ne veut pas traverser dix modules sans lien pour satisfaire un client : il veut réaliser sa vente correctement.

**Hypothèse : l'innovation doit se manifester dans la continuité de l'expérience, pas seulement dans la quantité de fonctionnalités.**

## F.2. Parcours A — Un produit découvert sur un réseau social

**Situation :** un commerçant vend des chaussures, organise son catalogue dans notre application, puis présente un nouveau modèle sur WhatsApp, Facebook ou TikTok. Aucun programme d'affiliation ni intégration API sociale n'est requis.

### De la découverte à la réception

1. Le vendeur enregistre la chaussure : photographies, tailles, couleurs, prix et quantités disponibles.
2. Il prépare une publication commerciale avec les informations et photos de son catalogue.
3. Il partage librement son offre sur les canaux de son choix ; un lien mène au produit exact.
4. Une acheteuse découvre la publication sur WhatsApp et ouvre le lien.
5. Elle retrouve la chaussure, choisit sa taille et sa couleur et consulte l'état de disponibilité et les conditions.
6. Elle réserve ou commande ; le vendeur reçoit une demande identifiable liée à la variante précise.
7. Paiement et remise sont organisés selon les modes effectivement pris en charge.
8. L'acheteuse retrouve son achat et le vendeur retrouve la vente dans son activité.

### Difficulté A1 — Le visiteur n'a pas installé notre APK

**Mécanisme envisagé :** un lien peut ouvrir une page mobile accessible dans le navigateur sans application installée. Cette page pourrait permettre de consulter l'offre et les étapes nécessaires pour poursuivre l'achat selon le dispositif retenu. **Il s'agit d'une hypothèse de porte d'entrée web complémentaire, pas d'une décision de remplacer l'application Android par une web app.** La portée exacte du parcours sans installation reste à définir.

### Difficulté A2 — La variante souhaitée n'est plus disponible

Exemple : chaussure noire, pointure 42, indisponible. Le système peut présenter les autres variantes, les offres d'autres vendeurs ou proposer à l'acheteuse d'exprimer une demande pour cette variante. Le commerçant peut observer que son stock ne répond pas à ce besoin.

**Connexion démontrée conceptuellement :** découverte sociale → catalogue → variante/stock → demande d'achat → possibilité d'approvisionnement. Une publication ne produit pas uniquement une vente : elle peut aussi produire une information sur une demande insatisfaite.

## F.3. Parcours B — Un acheteur ne trouve pas ce qu'il recherche

**Situation :** un étudiant à Porto-Novo recherche un ordinateur aux caractéristiques précises et à budget limité. Aucune offre ne convient. L'exemple géographique illustre le parcours et ne limite pas le marché envisagé.

### De la recherche infructueuse à une proposition

1. L'acheteur décrit le produit recherché.
2. Il précise budget, caractéristiques et contraintes.
3. La plateforme recherche les offres correspondantes.
4. Aucune offre ne répond suffisamment au besoin.
5. L'acheteur peut convertir sa recherche en demande d'achat.
6. Des vendeurs concernés consultent la demande et peuvent formuler une proposition.
7. L'acheteur compare les réponses et décide d'accepter ou de refuser.

**Hypothèse de valeur :** une recherche infructueuse peut devenir une occasion pour un vendeur de faire apparaître une offre adaptée, au lieu de se terminer sur une impasse.

### Difficulté B1 — Demande insuffisamment précise

Exemple : « un bon ordinateur pas trop cher ». Le système peut poser des questions utiles sur l'usage, le budget, l'état neuf/occasion, les caractéristiques indispensables et le lieu souhaité. L'IA peut éventuellement aider à interpréter et structurer la description, sans inventer de préférence au nom de l'acheteur.

### Difficulté B2 — Réponses non pertinentes de vendeurs

Ne pas diffuser automatiquement toute demande à tous les commerçants. Rapprocher la demande des catégories, des produits et des capacités déclarées ; éviter un système de notifications invasif.

### Difficulté B3 — Promesses de disponibilité non fondées

Distinguer **disponible maintenant**, **disponible sur commande** et **proposition à confirmer auprès d'un fournisseur**. Ne pas confondre ces états lors de la comparaison et de la décision d'achat.

## F.4. Parcours C — Le commerçant achète lui-même pour répondre à son client

**Situation :** un commerçant reçoit une demande d'ordinateur, ne possède pas le modèle et contacte ou recherche un fournisseur.

### Chaîne commerciale envisagée

1. Le client exprime un besoin.
2. Le commerçant vérifie qu'il n'a pas le produit en stock.
3. Il consulte des fournisseurs présents sur la plateforme ou organise la recherche auprès de ses sources habituelles.
4. Après vérification, il formule une proposition précisant prix, disponibilité, délai et conditions.
5. Le client accepte ou refuse ; une commande peut naître de l'accord.
6. Le commerçant s'approvisionne et fournit le produit si les engagements sont effectivement confirmés.

**Chaîne : acheteur final → commerçant → fournisseur.** Le fournisseur est aussi vendeur ; le commerçant est aussi acheteur. La plateforme pourrait accueillir achat de consommation et certaines relations d'approvisionnement professionnel sans créer deux univers incompatibles.

**Précaution :** prix de fournisseur, conditions professionnelles, informations personnelles et responsabilités commerciales ne sont pas automatiquement partagés entre tous. Le vendeur ne doit pas annoncer comme « en stock » ce qu'il espère seulement acquérir.

**Question stratégique nouvelle :** « Qu'est-ce que mes clients veulent acheter et que je pourrais être capable de leur fournir ? », au-delà de « Qu'est-ce que je peux vendre aujourd'hui ? ».

## F.5. Parcours D — Produit numérique vendu dans un autre pays

**Situation :** une créatrice au Bénin publie un modèle de document professionnel ; un acheteur en France le découvre grâce à une publication sociale. La localisation sert d'illustration, non de limitation du produit.

### Du partage à l'accès numérique

1. La créatrice publie le produit : description, aperçu, contenu fourni et conditions d'utilisation.
2. Elle partage l'offre et l'acheteur y accède depuis son pays.
3. L'acheteur examine formats, contenu et droits de la licence.
4. Un moyen de paiement réellement disponible est utilisé ; une tentative ou une capture d'écran ne vaut pas confirmation.
5. L'accès au fichier ou au contenu est accordé selon les modalités prévues.
6. L'achat et ses droits d'accès restent consultables.

### Difficultés à résoudre

- Téléchargement interrompu ou indisponible après paiement.
- Mise à jour du fichier par le vendeur.
- Licence individuelle et éventuelles tentatives de revente non autorisée.
- Paiement confirmé sans délivrance effective de l'accès.
- Produit personnalisé qui doit encore être créé après la commande.
- Capacités réelles de paiement et de reversement selon les pays concernés.

**Trois modes d'exécution distincts :**

| Nature de l'offre | Obligation principale à organiser |
|---|---|
| Produit physique | Remise matérielle / expédition / retrait selon le cas. |
| Produit numérique disponible immédiatement | Droit d'accès ou téléchargement conforme à la vente. |
| Produit numérique personnalisé | Réalisation et fourniture du résultat convenu. |

Le numérique ne se résume pas à un produit physique sans frais de transport : ses états d'exécution, licences et incidents sont particuliers.

## F.6. Parcours E — Incident après l'achat

**Situation :** l'acheteuse reçoit un appareil d'une variante différente de celle convenue.

1. Elle ouvre la commande pour retrouver le produit et l'accord.
2. Elle signale la différence, avec les éléments pertinents.
3. Le vendeur consulte le même dossier et répond.
4. Une issue est envisagée selon les obligations et conditions applicables : correction, échange, remboursement, etc.
5. L'incident conserve un état compréhensible : ouvert, en examen, solution proposée, résolu ou contesté, par exemple.

**Hypothèse de valeur :** le paiement ne doit pas faire disparaître le contexte de la transaction ; le dossier permet de comprendre les faits et de traiter l'incident selon les responsabilités réelles des parties. Il ne constitue pas une promesse de résolution automatique de tous les litiges.

## F.7. Tableau de confrontation des cinq parcours

| Parcours | Capacités qui doivent coopérer | Résultat recherché |
|---|---|---|
| A. Produit découvert sur WhatsApp | Catalogue, partage manuel, accès direct, disponibilité et commande. | Transformer une découverte extérieure en achat. |
| B. Produit introuvable | Recherche, demande active, propositions et comparaison. | Donner une suite utile à une recherche infructueuse. |
| C. Réapprovisionnement déclenché par un client | Demande client, fournisseurs et offre sur commande. | Relier demande finale et capacité d'approvisionnement. |
| D. Produit numérique international | Offre numérique, paiement compatible et droits d'accès. | Réaliser une vente sans frontière physique, sous réserve des services réellement disponibles. |
| E. Incident après achat | Accord documenté, commande, réclamation et suivi. | Maintenir la relation commerciale après paiement. |

## F.8. Hypothèse du mécanisme central : une chaîne commerciale reliée

**Besoin → offre → accord → commande → exécution → résultat.**

- **Besoin :** ce qu'une personne cherche à obtenir.
- **Offre :** ce qu'un commerçant propose réellement.
- **Accord :** produit, variante, prix, quantité et conditions acceptées.
- **Commande :** engagement commercial à exécuter.
- **Exécution :** paiement, approvisionnement le cas échéant, livraison physique ou accès numérique.
- **Résultat :** achat satisfait, incident, annulation ou besoin toujours non satisfait.

Cette représentation est **logique, pas une succession obligatoire d'écrans**. Un acheteur peut commander une offre existante sans publier de besoin ; une vente physique peut avoir lieu sans recherche dans la marketplace ; une publication sociale peut ne produire aucune vente ; une demande peut rester ouverte.

### Des situations qui ouvrent des actions pertinentes

| Événement constaté | Action que l'application pourrait proposer ou préparer |
|---|---|
| Recherche sans résultat | Exprimer une demande d'achat. |
| Plusieurs demandes pour un produit absent | Examiner l'opportunité d'approvisionnement. |
| Vendeur incapable de livrer immédiatement | Consulter des fournisseurs ou proposer « sur commande ». |
| Produit publié | Préparer un support et le partager librement sur ses réseaux. |
| Commande acceptée | Mettre à jour réservation, engagement et quantité suivant les règles applicables. |
| Incident après achat | Ouvrir le dossier et suivre la recherche d'une solution. |

**Nom de travail conceptuel :** un commerce guidé par les événements et les besoins. Ce n'est pas un nom de produit ni une revendication de technologie inédite. L'application propose et prépare les prochaines actions ; elle ne commande pas du stock et ne dépense pas l'argent du commerçant sans autorisation.

## F.9. Conclusion provisoire de la première évaluation

> L'application devrait organiser le commerce autour des résultats, et pas uniquement autour des fonctionnalités : permettre à l'acheteur de progresser d'un besoin vers une solution ; au vendeur de progresser d'une demande vers une vente réalisable ; aux produits de circuler librement hors de l'application ; aux transactions de préserver les engagements jusqu'à leur exécution et à leur suivi ; et aux résultats d'éclairer de nouvelles décisions.

**Prochain approfondissement annoncé puis effectivement réalisé dans l'annexe G :** expliquer comment le système relie ces opérations sans obliger l'utilisateur à en assurer manuellement les raccordements.

---

# ANNEXE G — ÉVALUATION 2 : LE MÉCANISME QUI RELIE LES OPÉRATIONS COMMERCIALES

**Origine :** réponse à « Où est la suite ? », directement après les cinq parcours de l'annexe F.  
**Statut :** approfondissement de la conception fonctionnelle ; les exemples d'interface ne sont pas des maquettes approuvées.  
**Question directrice :** comment l'ensemble fonctionne-t-il sans obliger l'acheteur ou le commerçant à faire lui-même les raccordements entre chaque fonctionnalité ?

## G.1. Le problème d'une plateforme pourtant riche en fonctionnalités

Une excellente page produit, une excellente messagerie, un bon inventaire et de bonnes commandes ne suffisent pas si l'utilisateur recopie la même information dans chacune de ces sections.

Exemple détaillé : un acheteur demande une chaussure noire en pointure 42 ; le vendeur répond ; ils conviennent d'un prix ; le vendeur recherche ensuite manuellement la chaussure dans son catalogue, vérifie la quantité, retourne dans les messages, ressaisit le prix dans une commande et note la livraison à effectuer. L'application a beaucoup de fonctions, mais exige de l'utilisateur qu'il fasse fonctionner leur liaison.

**Principe à approfondir : le système conserve le contexte commercial d'une opération à la suivante, tandis que l'utilisateur conserve le contrôle de ses décisions.** Une même donnée ne devrait pas être ressaisie inutilement ou contradictoirement.

## G.2. Une information enrichit la suivante

| Événement | Information déjà connue | Prochaine opération préparée |
|---|---|---|
| L'acheteur sélectionne la pointure 42 | Produit, variante, vendeur. | Demande relative à la bonne variante. |
| Le vendeur confirme la disponibilité | Produit et quantité disponible déclarée/suivie. | Proposition commerciale. |
| Le vendeur accorde une remise | Prix final et conditions convenues. | Récapitulatif de l'accord. |
| L'acheteur accepte | Parties et offre acceptée. | Commande. |
| Le paiement est confirmé | Montant reçu et commande concernée. | Suite de l'exécution. |
| Le produit est remis | Commande, destinataire et mode de remise. | Confirmation de réception. |

La continuité devient particulièrement utile pour les nombreuses demandes, les variantes, réservations, ventes physiques et commandes numériques.

## G.3. Les six objets commerciaux conceptuels

**Il s'agit de concepts métier, non d'un schéma imposé de base de données.**

1. **Le besoin :** ce que l'acheteur cherche à obtenir, sous certaines contraintes.
2. **Le produit et son offre :** ce que le vendeur peut fournir, à quelles conditions et dans quel délai.
3. **La proposition commerciale :** réponse précise du vendeur à une demande ou à une négociation.
4. **La commande :** ce que les parties ont convenu d'acheter et de vendre.
5. **L'exécution :** paiement, réservation, éventuel approvisionnement, livraison physique ou accès numérique.
6. **Le résultat :** vente réalisée, achat satisfait, incident, annulation ou besoin encore non satisfait.

Une transaction directe peut passer de l'offre à la commande sans demande explicite. Une demande infructueuse peut susciter plusieurs propositions. Un commerçant peut devenir acheteur professionnel. Un produit numérique sur mesure peut nécessiter une création après commande. Les parcours diffèrent, les concepts de relation restent cohérents.

**Clarification logique importante :** le « produit et son offre » est regroupé dans cette liste de six objets de haut niveau, tandis que le stock, le paiement, la livraison, les licences et les incidents auront vraisemblablement des sous-objets propres si la conception technique est confirmée. Ne pas interpréter « six » comme une limite de six tables ou de six modules.

## G.4. Trois niveaux d'assistance du système

### Niveau 1 — Conséquences techniques suffisamment déterminées

Le système pourrait, selon des règles explicites : associer demande et produit, reprendre un prix accepté dans la commande, relier commande et parties, ajuster les quantités réservables lorsque l'événement fiable le justifie, enregistrer les étapes et signaler l'indisponibilité d'une offre.

**Précaution :** « automatiquement » ne signifie pas inventer une réception de paiement ou un stock réel ; il faut que les événements d'origine soient vérifiés au niveau pertinent. Les changements de stock doivent tenir compte des ventes physiques, des réservations simultanées et des annulations.

### Niveau 2 — Suggestions contextuelles, acceptées ou refusées par l'utilisateur

Exemples :

- « Ce produit n'est pas disponible : souhaitez-vous publier une demande ? »
- « Le client recherche une variante absente : voulez-vous consulter vos fournisseurs ? »
- « Plusieurs demandes concernent cet article : consulter leur récapitulatif ? »
- « Le stock est faible : examiner un réapprovisionnement ? »
- « Cette commande attend votre confirmation de remise. »

### Niveau 3 — Actions qui engagent la personne et exigent son autorisation

Ne pas commander du stock, modifier un prix, accepter une proposition, confirmer un paiement non vérifié, déclencher un remboursement, publier une promotion ou communiquer des informations privées sans la validation/autorisation requise et les règles de sécurité appropriées.

**Synthèse :** le système aide à agir, mais ne retire pas le contrôle commercial aux acteurs.

## G.5. Deux transactions dans une chaîne d'approvisionnement

Exemple : un client demande un ordinateur que le commerçant n'a pas ; celui-ci se tourne vers un fournisseur.

- **Transaction A : commerçant ↔ fournisseur**, pour un approvisionnement, avec son prix, ses quantités, son délai et ses conditions propres.
- **Transaction B : client final ↔ commerçant**, pour l'achat au détail, avec son propre accord et ses obligations distinctes.

La relation entre ces transactions est utile, mais elles ne doivent jamais être confondues.

**Règles à examiner :** le prix fournisseur n'est pas nécessairement visible du client ; le fournisseur n'a pas automatiquement droit aux données personnelles du client ; le commerçant n'annonce pas comme en stock un produit qu'il espère acquérir ; l'acceptation du client et la commande fournisseur restent deux opérations différentes.

**Hypothèse de valeur :** intégrer achat professionnel et achat de consommation dans un même réseau de commerce, tout en respectant leurs responsabilités et leurs conditions distinctes.

## G.6. Deux expériences principales dans une application commune

**Principe UX proposé :** montrer le travail à accomplir et laisser le système gérer les relations entre opérations, plutôt que faire naviguer l'utilisateur à travers vingt modules.

### Expérience acheteur — « Qu'est-ce que je veux obtenir ? »

- **Explorer et rechercher :** produits, boutiques, catégories, offres.
- **Mes demandes :** besoins exprimés, propositions reçues, décisions en attente.
- **Mes achats :** commandes, paiements, livraisons et produits numériques acquis.

### Expérience commerçant — « Que se passe-t-il dans mon commerce ? »

- **Ma boutique :** catalogue, produits, offres et présentation commerciale.
- **Mes opportunités :** demandes pertinentes, questions, propositions.
- **Mes opérations :** ventes, commandes, réservations, livraisons.
- **Mon activité :** stocks, fournisseurs, réapprovisionnements, résultats commerciaux.

**Statut :** regroupements conceptuels pour réfléchir à l'expérience ; ni navigation, ni maquette, ni liste figée d'écrans approuvés.

## G.7. Les « prochaines actions commerciales »

Proposition : lorsqu'un commerçant ouvre son application, il peut retrouver une vue des opérations nécessitant son attention au lieu de devoir consulter successivement tous ses espaces.

**Exemple fictif d'un matin dans le commerce :**

| Signal | Contexte / action disponible |
|---|---|
| Trois commandes attendent confirmation. | Ouvrir les commandes réellement concernées et décider si elles peuvent être exécutées. |
| Cinq demandes correspondent à sa catégorie. | Examiner les besoins et répondre aux demandes qu'il peut satisfaire. |
| Deux produits atteignent un seuil de réapprovisionnement. | Vérifier la situation et ses possibilités d'achat fournisseur. |
| Une réclamation attend une réponse. | Accéder directement au dossier de commande correspondant. |

Cette vue pourrait transformer un ensemble d'outils en environnement qui accompagne le déroulement quotidien du commerce, sous réserve d'une conception simple.

### Éviter que l'assistance devienne envahissante

| Nature de l'information | Traitement à examiner |
|---|---|
| Commande à exécuter | Action prioritaire. |
| Paiement confirmé par une source fiable | Information liée à la commande. |
| Produit presque épuisé | Signal d'attention. |
| Demande pertinente | Opportunité à examiner. |
| Idée de réapprovisionnement | Suggestion, non obligation. |
| Tendance commerciale encore incertaine | Observation contextualisée. |

La recommandation devrait expliquer sa raison d'être. Préférer « plusieurs demandes récentes portent sur cet article et votre stock déclaré est faible ; souhaitez-vous examiner un réapprovisionnement ? » à « achetez vingt exemplaires », qui est une consigne excessive et insuffisamment fondée.

## G.8. Où résiderait la différenciation à approfondir ?

Pas uniquement dans la présence de la marketplace, de la boutique, de la messagerie, du stock, de la commande, des liens de partage et des graphiques ; de nombreux outils réunissent déjà tout ou partie de ces éléments.

La valeur envisagée réside dans **leur continuité orientée vers les besoins et les résultats** :

1. Un produit est recherché ; s'il est disponible, l'acheteur peut l'obtenir.
2. S'il n'existe pas ou ne convient pas, le besoin peut devenir une demande.
3. Si un commerçant peut y répondre, il formule une proposition.
4. S'il doit s'approvisionner, cette opération peut être organisée sans confondre ses engagements.
5. Si l'accord est conclu, une commande suivie est créée.
6. Si un problème survient, le dossier commercial subsiste.
7. Si plusieurs besoins similaires apparaissent, ils peuvent éclairer les décisions commerciales suivantes.

Ce n'est pas encore une preuve d'avantage concurrentiel ou de préférence des utilisateurs ; c'est une hypothèse produit suffisamment précise pour tester son intérêt.

## G.9. Bilan de l'évaluation 2 et prochaine épreuve

Les parcours de l'annexe F sont **cohérents sur le papier** avec les objets et mécanismes envisagés dans l'annexe G. La continuité proposée peut être examinée sur un ensemble commercial commun ; les utilisateurs ne devraient pas devoir refaire les mêmes opérations à chaque transition. Aucune validation terrain ni démonstration d'intégration technique n'en découle automatiquement.

### Conclusion provisoire

> Une marketplace qui accompagne l'action commerciale, plutôt qu'une marketplace où les utilisateurs exécutent seuls une succession de tâches isolées. L'acheteur exprime un besoin ou choisit une offre. Le vendeur reçoit une opportunité, organise sa réponse et exécute une vente réalisable. Le système relie le contexte, prépare des actions pertinentes et conserve les résultats. Les décisions commerciales engageantes restent entre les mains des utilisateurs.

### Prochaine épreuve déjà annoncée, non encore menée

Traiter les cas difficiles, notamment :

- plusieurs vendeurs répondent à une même demande ;
- plusieurs acheteurs réservent simultanément le dernier exemplaire ;
- un commerçant annonce un approvisionnement qui échoue ;
- un paiement est confirmé mais la livraison échoue ;
- un fichier numérique payé devient inaccessible ;
- les rôles et responsabilités s'opposent lors d'une réclamation.

**But :** définir les règles de cohérence, les états, les protections et les recours qui rendent l'expérience fiable en pratique, et non seulement persuasive dans un scénario.

---

# ANNEXE H — AUDIT DE COHÉRENCE ENTRE LES ANALYSES 0.1 À 0.6

**Périmètre :** contrôle documentaire effectué lors de l'intégration des réponses E, F et G. Cet audit porte sur la cohérence des idées dans la conversation et le document ; il **ne remplace pas** la validation de marché, la vérification réglementaire, les preuves techniques ou les tests utilisateurs.

## H.1. Ce qui se complète sans contradiction

| Thème | Analyse précédente | Nouvel approfondissement | Lecture unifiée |
|---|---|---|---|
| Vision | D01 + D02 constituent une plateforme pour acheteurs et vendeurs. | Cinq parcours éprouvent les relations concrètes entre leurs activités. | La base est maintenue et devient une hypothèse de fonctionnement observable. |
| Trois systèmes | Moteur commercial ; réseau offre/demande ; transaction/amélioration. | Six objets conceptuels et prochaines actions contextuelles. | Trois ensembles expriment les capacités ; les six objets expriment le contexte métier commun. Ce ne sont pas deux architectures rivales. |
| Social | Offres partageables vers WhatsApp/Facebook/TikTok, sans API ni affiliation rémunérée. | Parcours A avec partage libre et retour vers la bonne offre. | L'ouverture sociale reste transversale ; aucun nouveau module d'affiliation ou d'API n'est réintroduit. |
| International | Vision mondiale, moyens de paiement variables selon pays. | Parcours D avec fichier numérique et accès après paiement confirmé. | L'ambition mondiale est maintenue, sans promesse de paiements et reversements partout. |
| Approvisionnement | Le vendeur peut lui-même devenir acheteur. | Deux transactions distinctes client/commerçant et commerçant/fournisseur. | La relation est approfondie ; confidentialité et engagements restent séparés. |
| Confiance | Dossier de transaction partagé et suivi des incidents. | Parcours E de réclamation après paiement. | Les engagements doivent subsister après la vente ; il ne s'agit pas d'une garantie automatique de résolution. |
| Différenciation | Continuité besoin → résultat et apprentissage. | Conservation du contexte et suggestions d'action. | Les nouveaux mécanismes expliquent *comment* créer la continuité envisagée. |
| Ambition complète | Ne pas retrancher arbitrairement la vision sous prétexte de « V1 ». | Feuille de route et scénarios de conception. | Les six évaluations sont une progression de recherche, non un plan de suppression de fonctionnalités. |

## H.2. Nuances explicites nécessaires pour éviter de futures contradictions

1. **« Le système fonctionne » désigne actuellement une cohérence conceptuelle**, pas un prototype opérationnel, un fonctionnement prouvé ni une promesse commerciale.
2. **Le « moteur d'amélioration » et les recommandations** sont des capacités candidates ; le système ne doit pas prendre des décisions financières engageantes sans l'autorisation requise.
3. **« Stock disponible » doit rester distinct de « stock déclaré », « à confirmer » et « sur commande »** ; aucune actualisation automatique ne garantit à elle seule le stock d'un vendeur qui opère hors ligne.
4. **La page mobile ouverte depuis un lien social est une piste** pour ne pas imposer immédiatement une installation ; elle ne remplace pas la contrainte de produit Android APK et ne constitue pas une seconde application officiellement adoptée.
5. **Une commande fournisseur et une commande du client final sont deux accords différents**, même lorsqu'une demande les relie.
6. **Un paiement doit être confirmé par une source fiable** ; une capture d'écran, une intention ou une opération en attente ne valent pas réception des fonds.
7. **Produit physique, numérique immédiat et numérique personnalisé** partagent une logique commerciale commune, mais leurs obligations d'exécution restent différentes.
8. **Les suggestions contextuelles n'imposent pas une intégration directe avec les réseaux sociaux** ; l'offre peut être partagée manuellement et les demandes reçues ailleurs peuvent être saisies volontairement.
9. **« Six objets » est un langage de conception, non une limitation technique**. Il n'interdit pas des modèles de données, états ou composants additionnels.
10. **Les exemples Cotonou, Porto-Novo, Bénin et France ne bornent pas le marché**. Les modalités réelles de desserte, de fiscalité, de paiement et de reversement devront être validées pays par pays.
11. **Le domaine D03 reste en pause** : la prise en compte naturelle de la découverte sociale n'introduit pas une décision de fusionner formellement D03 à D01 + D02.

## H.3. Registre des ajouts 0.6

| Réf. | Élément | Statut précis |
|---|---|---|
| DEC-011 | Attendre plusieurs approfondissements avant de remettre à jour le Markdown, puis les consigner ensemble. | **CONFIRMÉ — méthode documentaire**, demande explicite du fondateur. |
| DEC-012 | Poursuivre l'analyse concrète de D01 + D02 et ne pas réouvrir les bases déjà établies. | **CONFIRMÉ — ordre de travail**, pas validation de tous les mécanismes proposés. |
| HYP-011 | Cinq parcours A à E comme épreuves du système. | **SCÉNARIOS CONCEPTUELS**, non tests terrain. |
| HYP-012 | Conservation du contexte et six objets commerciaux de haut niveau. | **HYPOTHÈSE DE CONCEPTION**. |
| HYP-013 | Trois niveaux d'assistance : conséquence technique / suggestion / action autorisée. | **HYPOTHÈSE DE RÈGLES FONCTIONNELLES** ; détail à définir. |
| HYP-014 | Vue « prochaines actions commerciales ». | **HYPOTHÈSE UX**, pas écran approuvé. |
| HYP-015 | Lien web mobile ouvrant une offre sans APK préinstallé. | **HYPOTHÈSE TECHNIQUE ET D'ADOPTION**, complément possible de l'Android. |
| VAL-004 | Règles des réservations concurrentes, promesses sur commande, paiement/livraison et accès numérique défaillant. | **PROCHAINE ÉPREUVE FONCTIONNELLE**. |
| VAL-005 | Facilité d'usage, adoption, coûts et avantages réels des parcours. | **VALIDATION UTILISATEUR ET ÉCONOMIQUE NON ENCORE EFFECTUÉE**. |

## H.4. Point exact de reprise après la version 0.6

**Ne pas recommencer les huit dimensions de l'annexe C, la convergence sociale de l'annexe D, ni les cinq parcours de l'annexe F comme s'ils n'avaient jamais été étudiés.** Les utiliser comme socle.

L'étape suivante consiste à examiner en profondeur les **cas limites et les événements contradictoires de l'annexe G.9**, à leur apporter des règles de fonctionnement concrètes, à identifier les responsabilités et à éprouver les conséquences pour les vendeurs, acheteurs et la plateforme. Ensuite seulement poursuivre la feuille de route E sur adoption, modèle économique, validation et consolidation.

**État documentaire après 0.6 :** analyses précédentes intégralement conservées ; nouvelles réponses organisées en E, F, G ; cohérence vérifiée avec les corrections du fondateur ; hypothèses non transformées en décisions produit sans approbation explicite.
---

# ANNEXE I — ÉVALUATION DES CAS DIFFICILES : FIABILITÉ DU PARCOURS COMMERCIAL

**Date :** 25 septembre 2026.  
**Origine :** approfondissement immédiatement postérieur à la version 0.6, à la demande du fondateur d’avancer sans répéter l’idéation initiale.  
**Statut :** règles *proposées* de conception et hypothèses d’exécution à préciser en spécifications, valider techniquement et confronter aux situations réelles. Elles ne sont pas présentées comme des services déjà développés, une garantie de paiement, un engagement d’indemnisation ou des décisions produit approuvées.

## I.1. Pourquoi examiner les incidents

Les annexes F et G ont montré la continuité possible des parcours normaux : découverte sociale, offre disponible ou demande non satisfaite, approvisionnement, achat numérique transfrontalier et réclamation. Cette annexe examine ce qui se passe lorsqu’un état commercial entre en conflit avec un autre. Une belle interface ne suffit pas : le système doit savoir différencier les engagements et préserver les possibilités de réponse.

### Cas A — Deux acheteurs veulent le dernier exemplaire

**Situation :** une boutique déclare une chaussure en pointure 42 en un seul exemplaire ; deux personnes tentent de la réserver presque au même moment.

**Mécanisme proposé :**

1. Une réservation **effectivement validée** rend la quantité réservée non librement disponible pendant sa validité.
2. Une réservation non payée peut porter une expiration clairement communiquée ; une annulation ou expiration libère la quantité selon la règle retenue.
3. Les ventes physiques enregistrées par le commerçant et les ventes provenant de la marketplace utilisent la même information de stock.
4. Lorsque le stock n’est pas fiablement suivi, afficher une **disponibilité à confirmer** plutôt qu’une garantie fictive.
5. La validation de réservation doit être atomique côté serveur : vérifier et réserver le dernier article en une opération cohérente. Deux téléphones affichant « un disponible » ne doivent pas pouvoir chacun confirmer le dernier exemplaire.

**Résultat recherché :** réduire les engagements sur des articles que le vendeur ne peut plus fournir. **À prouver :** comportement effectif en concurrence, réservation expirée, vente hors ligne non enregistrée, reprise réseau et arbitrage lorsqu'une déclaration manuelle est obsolète.

### Cas B — Approvisionnement annoncé, fournisseur défaillant

**Situation :** le commerçant propose de fournir un ordinateur sous cinq jours alors qu’il ne l’a pas encore en stock ; le fournisseur ne peut finalement pas livrer.

**Deux opérations à distinguer :** (a) l’accord vendeur–acheteur final ; (b) la commande ou la promesse fournisseur–commerçant. L'échec de (b) n'efface pas silencieusement (a).

**Mécanisme proposé :**

1. Indiquer explicitement que le produit est **sur commande** et non en stock.
2. Présenter les conditions et les délais d'approvisionnement avant l'acceptation.
3. En cas d'échec, faire passer la commande dans un état demandant l'intervention du vendeur.
4. Prévoir une proposition de nouveau délai, d'alternative ou d'annulation, **suivant les engagements et règles applicables**.
5. Faire approuver à l'acheteur toute modification substantielle de l'accord.

**Résultat recherché :** permettre les ventes sur commande sans confondre intention d'achat fournisseur et stock vérifié. **À préciser :** acomptes, remboursement, délai de réaction, coûts déjà engagés, information de l'acheteur et responsabilité du vendeur.

### Cas C — Paiement confirmé, produit non livré

**Situation :** le montant a été reçu mais la livraison n’a pas eu lieu.

**États à distinguer :**

| Information | Signification |
|---|---|
| Commande acceptée | Accord commercial conclu. |
| Paiement confirmé | Réception des fonds vérifiée selon un canal fiable. |
| En préparation | Exécution en cours chez le vendeur. |
| Expédié ou prêt pour retrait | Étape déclarée, distincte de la réception. |
| Réception confirmée | Remise documentée selon le mécanisme disponible. |
| Incident ouvert | Écart encore à traiter. |

**Mécanisme proposé :** conserver séparément l’état de commande, l’état du paiement et l’état de livraison. Une commande payée mais non livrée dans le délai annoncé doit rester visible comme engagement non satisfait et pouvoir ouvrir un dossier d'incident.

**Limite impérative :** ne **pas** promettre que l’application immobilise automatiquement les fonds, garantit un remboursement ou arbitre juridiquement tous les litiges. Ces capacités exigent un montage de paiement, des partenaires, des responsabilités et un examen réglementaire spécifiques.

**Résultat recherché :** suivi explicite et preuves utiles lorsqu'un paiement et une exécution divergent.

### Cas D — Achat numérique payé, fichier inaccessible

**Situation :** un acheteur règle un contenu numérique mais l'accès ou le téléchargement échoue.

**Éléments séparés :** paiement confirmé ; droit d’accès ou licence acquise ; livraison effective du fichier ; incident d’accès éventuel.

**Mécanisme proposé :** conserver le droit acquis indépendamment d'une tentative de téléchargement ; permettre une nouvelle tentative ou un traitement d'assistance selon les conditions du produit. Distinguer contenu immédiatement fourni et contenu numérique personnalisé à produire après commande.

**Résultat recherché :** éviter qu’un simple échec technique efface l’achat. **À préciser :** version des fichiers, disponibilité du stockage, expiration des liens, licence, abus de téléchargement, remboursements, service après-vente et restrictions territoriales applicables.

### Cas E — Ancien contenu partagé sur un réseau social

**Situation :** un lien vers une promotion ou un article partagé deux semaines plus tôt circule encore ; prix, stock ou promotion ont changé.

**Distinction opérationnelle :** une publication déjà diffusée sur WhatsApp, Facebook, Instagram ou TikTok n’est pas nécessairement modifiable par notre plateforme. En revanche, la fiche d’offre **hébergée chez nous** peut présenter l’état commercial courant.

**Mécanisme proposé :** maintenir le lien vers l’offre exacte ; afficher le prix, les conditions et la disponibilité actuels ; signaler une promotion expirée ; proposer éventuellement une alternative ou une demande d’achat en cas d’indisponibilité. Ne pas prétendre que la publication extérieure est synchronisée ou modifiée sans connexion officielle.

**Résultat recherché :** maintenir la circulation sociale des offres tout en ramenant l’acheteur vers des conditions commerciales vérifiables au moment de l’achat.

## I.2. Principe transversal dégagé

> **Chaque engagement commercial doit avoir un état réel, un responsable identifié et une suite possible.**

Un article peut être disponible, réservé, épuisé, à confirmer ou sur commande ; une proposition peut être attendue, acceptée, refusée ou expirée ; une commande peut être acceptée et non payée ; un paiement peut être confirmé alors que la remise ou l’accès n'a pas été exécuté ; une transaction peut être exécutée tout en restant contestée. Ces distinctions sont des **exigences de cohérence à formaliser**, non un diagramme d'états complet déjà approuvé.

## I.3. Ce que cette évaluation ne prétend pas avoir résolu

- Le cas de **plusieurs vendeurs répondant simultanément à une même demande** n’a pas été détaillé ici : ordre des propositions, expiration, retrait, acceptation et confidentialité restent à formaliser.
- Les règles de paiement, remboursement, conservation éventuelle des fonds, preuves et arbitrage de litige exigent une analyse juridique, financière et opérationnelle par pays et partenaire ; aucune garantie n'est acquise.
- Les stockages, permissions, téléchargements et paiements internationaux ne sont pas encore validés techniquement.
- Ces cas sont des épreuves conceptuelles ; ils ne démontrent ni la fréquence des problèmes ni l’efficacité réelle des solutions.

---

# ANNEXE J — FEUILLE DE ROUTE RESSERRÉE : DE L'IDÉATION AU DÉVELOPPEMENT

**Date :** 25 septembre 2026.  
**Instruction du fondateur :** avancer rapidement, dans un ordre clair, sans prolonger artificiellement le brainstorming. Les livrables doivent servir de jalons opérationnels ; certaines vérifications peuvent se dérouler en parallèle.  
**Statut :** méthode de progression proposée à la suite de l’analyse ; elle n’est ni un PRD approuvé, ni un planning daté de développement, ni une décision implicite de réduire le produit à une coquille vide.

## J.1. Étape 1 — Clôture structurée de l'idéation et du Design Thinking

**Acquis :** D01 + D02, vision de plateforme partagée, hypothèses de différenciation, découverte sociale sans affiliation ni API sociales, cinq parcours de bout en bout, continuité métier, premiers cas difficiles et états commerciaux distincts.

**À produire :**

1. Une **définition consolidée unique** de l’application et de sa raison d’être.
2. Les acteurs, rôles et résultats recherchés.
3. La carte des capacités et des interactions entre besoins, offres, vendeurs, fournisseurs, transactions, exécution, résultats et circulation sociale.
4. Les mécanismes distinctifs explicitement présentés comme hypothèses lorsque non confirmés.
5. Les règles fondamentales et les limites de responsabilité à étudier.
6. Le registre des décisions confirmées, hypothèses et validations encore nécessaires.

**Livrable :** dossier de concept produit consolidé.  
**Critère de sortie :** expliquer précisément *quoi* construire, *pour qui*, *pour quel résultat* et *sur la base de quelles hypothèses*, sans redéfinir le projet à chaque échange. Ce critère de sortie n’est pas une validation commerciale.

## J.2. Étape 2 — Validation commerciale et économique

**Travail :** confronter le concept aux pratiques et incidents réellement vécus par des vendeurs, acheteurs et, selon les parcours, fournisseurs ou créateurs de contenus numériques ; vérifier leur intérêt pour les mécanismes et le changement d’habitudes ; examiner comment réunir les premières offres et les premiers acheteurs ; définir des hypothèses de tarification et de coûts.

**Livrable :** dossier de validation marché et modèle économique, distinguant observation, témoignage, test d’usage, intention déclarée et comportement constaté.  
**Critère de sortie :** des éléments suffisamment concrets pour soutenir ou réviser les hypothèses commerciales majeures. Ne pas prétendre qu’une enquête non effectuée est validée.

## J.3. Étape 3 — Définition formelle du produit : PRD

**Travail :** transformer la vision en exigences observables : parcours et états acheteur/vendeur, produits physiques et numériques, demandes et propositions, stock et approvisionnement, commandes et paiement, remise et accès numérique, ouverture sociale, assistance et résultats, rôles et permissions, erreurs et litiges.

**Livrable :** PRD complet avec règles fonctionnelles et critères d’acceptation.  
**Critère de sortie :** un constructeur peut comprendre les comportements attendus et démontrer qu’ils sont respectés, sans combler les lacunes par ses propres suppositions.

## J.4. Étape 4 — Architecture technique et faisabilité

**Travail :** décider et éprouver architecture de l'APK Android natif, backend, données, stock concurrent, stockage des fichiers, authentification et permissions, sécurité, paiements et reversements pertinents, liens de partage, notifications, éventuelles fonctions IA, coûts et limites géographiques/partenaires.

**Livrable :** architecture, modèle de données, intégrations réellement vérifiées, décisions techniques et plan de tests.  
**Critère de sortie :** savoir *comment* construire chaque capacité retenue et quelles dépendances restent conditionnelles. L’absence de connexion API sociale à ce stade reste une orientation confirmée.

## J.5. Étape 5 — UX/UI et préparation de la construction

**Travail :** concevoir navigation et écrans, interactions, états vides et incidents, parcours bout en bout, design adapté aux rôles, puis organiser le développement selon les dépendances et les validations fonctionnelles.

**Livrable :** design produit exploitable et feuille de route de construction/test de l'application.  
**Critère de sortie :** capacité de démarrer le développement de l'APK en disposant d'une définition, d'une architecture et de parcours suffisamment précis, tout en maintenant les inconnues explicites.

## J.6. Ordre de travail et parallélisation

La feuille de route est une séquence de **décisions et de livrables**, pas cinq délais artificiels. Pendant la consolidation du concept, il est possible de préparer les tests de terrain et de vérifier les partenaires de paiement ou les contraintes techniques déterminantes. Un PRD, une architecture et l'UX peuvent ensuite progresser par aller-retour contrôlé. La construction n'exige pas de prétendre que toute incertitude commerciale a disparu ; elle exige que les risques qui conditionnent la promesse du produit soient identifiés, testés ou traités comme dépendances explicites.

---

# ANNEXE K — CONTRÔLE DE COHÉRENCE ET POINT DE REPRISE APRÈS LA VERSION 0.7

**Nature de cette annexe :** consolidation des conséquences des annexes I et J. Elle ne modifie pas rétroactivement les réponses précédentes et n'interprète pas une hypothèse bien accueillie comme une approbation automatique de fonctionnalité.

## K.1. Ce qui est déjà confirmé par les instructions du fondateur

| Orientation | Statut |
|---|---|
| Étudier ensemble D01 et D02 dans une plateforme commune pour le commerce et l'achat. | **Orientation de recherche confirmée.** |
| Conserver les travaux détaillés dans un Markdown évolutif. | **Méthode confirmée.** |
| Ne pas confondre produit complet et « V1 » artificiellement appauvrie. | **Principe confirmé.** |
| Penser au-delà de l'Afrique de l'Ouest et prendre en compte les produits physiques et numériques. | **Cadrage de recherche confirmé ; exploitation internationale non garantie.** |
| Permettre aux offres de circuler naturellement sur les réseaux sociaux. | **Intention confirmée.** |
| Ne pas prévoir maintenant de rémunération à l'affiliation par codes/commissions ni de connexion API aux réseaux sociaux. | **Exclusions actuelles confirmées.** |
| Avancer sans recommencer l'idéation et mettre à jour le MD à des jalons utiles. | **Méthode confirmée.** |

## K.2. Cohérence entre la version 0.6 et les approfondissements récents

| Sujet | Lien avec les acquis | Précision apportée |
|---|---|---|
| Réservations concurrentes | Stock et commandes communs, annexe G. | Validation atomique de l'exemplaire réservé proposée ; le stock manuel reste déclaratif. |
| Approvisionnement défaillant | Commerçant également acheteur professionnel, annexes C/F/G. | Séparation et suivi de l'engagement fournisseur et de l'engagement envers le client final. |
| Paiement sans livraison | Dossier commercial et suivi des incidents, annexes C/F. | États de paiement, commande et livraison séparés ; pas de promesse implicite de séquestre/remboursement garanti. |
| Fichier numérique inaccessible | Vente numérique internationale, annexe F. | Séparation entre paiement, droit d'accès et fourniture du contenu. |
| Promotion sociale périmée | Partage libre, sans API sociales, annexe D. | La fiche commerciale hébergée sur notre système porte les conditions actuelles ; le contenu extérieur n'est pas prétendument synchronisé. |
| Feuille de route | Progression initiale en six évaluations, annexe E. | Les cinq étapes J sont une reformulation plus opérationnelle du chemin restant, **pas cinq nouvelles boucles de brainstorming**. |

**Bilan :** pas de contradiction de fond relevée entre les nouveaux cas, les décisions explicites du fondateur et les annexes antérieures, sous réserve des nuances ci-dessus. Ce contrôle documentaire n'est pas une preuve de faisabilité ni de marché.

## K.3. Registre des ajouts 0.7

| Référence | Élément | Statut exact |
|---|---|---|
| DEC-013 | Accélérer vers des livrables opérationnels, ne pas prolonger artificiellement l'idéation. | **CONFIRMÉ — méthode de progression.** |
| DEC-014 | Mettre à jour le Markdown maintenant, puis attendre l'instruction du fondateur pour continuer. | **CONFIRMÉ — consigne documentaire.** |
| HYP-016 | Réservation liée à un stock vérifié de manière atomique. | **MÉCANISME PROPOSÉ — à spécifier et tester.** |
| HYP-017 | Statuts et traitement d'une vente sur commande dont l'approvisionnement échoue. | **MÉCANISME PROPOSÉ — engagements à définir.** |
| HYP-018 | Séparer commande, paiement et exécution, avec dossier d'incident. | **MÉCANISME PROPOSÉ — pas de garantie financière automatique.** |
| HYP-019 | Droit numérique persistant malgré un téléchargement échoué. | **MÉCANISME PROPOSÉ — stockage/licences à vérifier.** |
| HYP-020 | Fiche d'offre actuelle accessible depuis des partages sociaux plus anciens. | **MÉCANISME PROPOSÉ — sans API de réseaux sociaux.** |
| PLAN-001 | Cinq étapes : consolidation, validation, PRD, architecture, UX et préparation du développement. | **FEUILLE DE ROUTE DE TRAVAIL**, non dates, coûts ou décisions techniques approuvés. |
| VAL-006 | Multiples propositions de vendeurs à la même demande, arbitrages et règles d'expiration. | **NON RÉSOLU EN DÉTAIL.** |
| VAL-007 | Partenaires/pays de paiement, remboursement, responsabilité, livraison et produits numériques. | **VÉRIFICATIONS TECHNIQUES, COMMERCIALES ET RÉGLEMENTAIRES À MENER.** |

## K.4. Point exact de reprise après la version 0.7

**Ne pas rouvrir D01 + D02, les neuf axes, la convergence sociale corrigée, les cinq parcours de F, la continuité de G ou les cinq cas I comme s'ils n'avaient jamais été étudiés.** Le prochain travail annoncé est la **consolidation du concept produit en un dossier unique de clôture de l'idéation structurée** (J.1) : raison d'être, acteurs, promesse, capacités reliées, parcours, mécanismes distinctifs, règles importantes, exclusions explicites et hypothèses en attente de validation. La portée des décisions confirmées doit rester séparée des propositions conceptuelles.

Après ce dossier, poursuivre la validation commerciale/économique et la formalisation produit/technique selon J ; ne pas décréter automatiquement l'idée prête à construire simplement parce que le dossier de concept est rédigé. **Le fondateur a demandé la mise à jour documentaire puis indiquera quand continuer.**

---

# ANNEXE L — CLÔTURE STRUCTURÉE DE L'IDÉATION : CONCEPT PRODUIT CONSOLIDÉ

**Date :** 25 septembre 2026.  
**Origine :** réponse de consolidation immédiatement postérieure à la version 0.7.  
**Portée :** mettre en forme le concept élaboré durant D01 + D02 pour passer à la validation. Cette clôture de l'exploration conceptuelle ne vaut ni approbation du PRD ni preuve d'adoption ou de rentabilité. Les orientations déjà explicitement confirmées par le fondateur demeurent celles du registre K.1.

## L.1. Définition unifiée

**Nature :** plateforme de commerce connectée, réunissant une marketplace et un environnement de gestion commerciale, avec une application Android native comme produit principal et des points d'accès commerciaux partageables.

**Acteurs :** acheteurs, commerçants, fournisseurs et créateurs de produits numériques. Une même personne ou organisation peut exercer plusieurs rôles. Le fournisseur est un vendeur dans une relation d'approvisionnement ; le commerçant peut lui-même être acheteur.

**Ambition :** permettre de trouver, proposer, acheter, vendre et fournir des produits physiques ou numériques, tout en reliant besoins, offres, transactions, exécution et fonctionnement du commerce.

**Principe directeur :** l'application ne doit pas seulement réunir des outils ; elle doit aider les utilisateurs à faire progresser leurs opérations jusqu'à un résultat, en conservant le contexte entre les étapes et le contrôle humain des décisions engageantes.

L'expression « plateforme de commerce actif » a été proposée uniquement comme **description de travail**, sans choix de nom de marque.

## L.2. Proposition de valeur consolidée

> Une application qui permet aux acheteurs de trouver ou de faire émerger des offres correspondant à leurs besoins, et aux commerçants de gérer leurs activités, découvrir des opportunités de vente et exécuter leurs transactions dans un environnement commercial commun. Elle associe gestion du commerce, découverte des produits, expression des besoins, propositions commerciales, achats, ventes et suivi des résultats.

- **Acheteur :** passer d'un besoin à une offre adaptée, ou publier une demande si rien ne convient, puis connaître les conditions et suivre l'achat.
- **Commerçant :** exploiter son commerce habituel, publier ses produits, accéder à une demande pertinente, préparer ses offres, vendre, exécuter et apprendre de ses résultats.
- **Fournisseur :** répondre à des besoins d'approvisionnement dans le cadre de relations commerciales explicitement distinctes de la vente au client final.
- **Créateur de produits numériques :** vendre et fournir des fichiers/contenus, avec conditions d'accès, de licence et de livraison adaptées.

La réussite de cette promesse est encore **à éprouver auprès de personnes réelles**, et ne peut être déduite de sa cohérence conceptuelle.

## L.3. Cinq capacités structurantes — architecture fonctionnelle du concept, non applications séparées

| Capacité | Contenu envisagé | Résultat recherché |
|---|---|---|
| 1. Faire fonctionner le commerce | Boutique, catalogue, variantes, stocks, fournisseurs, prix, clients, commandes, ventes, y compris ventes extérieures à la marketplace. | Un outil utile au fonctionnement quotidien, pas seulement une vitrine. |
| 2. Faire rencontrer offre et demande dans les deux sens | Recherche d'offres, expression d'un besoin non satisfait, propositions pertinentes de commerçants, vente sur commande clairement signalée. | Une recherche infructueuse peut donner lieu à une nouvelle proposition commerciale. |
| 3. Transformer les accords en transactions suivies | Propositions, réservations, commandes, paiements, remises physiques, droits d'accès numériques, incidents. | Établir ce qui est convenu, fait, restant et contesté. |
| 4. Faire circuler les offres au-delà de la marketplace | Fiches et boutiques partageables, liens vers l'offre précise, accès mobile sans confusion, informations actuelles sur la fiche. | Bénéficier de la circulation sociale des produits sans contrôler les réseaux sociaux. |
| 5. Aider à prendre des décisions commerciales | Demandes, ventes, ruptures, réservations et résultats utilisés comme observations ou suggestions contextuelles. | Transformer l'activité en prochaines actions commerciales pertinentes, sans commande ni dépense automatique non autorisée. |

**Corrections du fondateur toujours applicables :** aucun programme d'affiliation rémunérée à codes/commissions et aucune connexion API aux réseaux sociaux pour le moment. Ne pas transformer la vision en « V1 coquille vide ». L'ambition n'est pas cantonnée au Bénin ; la commercialisation et les paiements effectifs seront néanmoins dépendants des pays et partenaires réellement couverts.

## L.4. Quatre mécanismes de valeur à démontrer, plutôt qu'une liste de fonctionnalités

1. **Le besoin peut déclencher une offre.** L'acheteur n'est pas prisonnier des articles déjà publiés.
2. **Le commerce existe au-delà de la marketplace.** La gestion quotidienne et les ventes extérieures sont prises en compte dans l'espace vendeur.
3. **Les opérations conservent leur contexte.** Une demande peut devenir proposition puis commande sans ressaisies inutiles ni perte des engagements.
4. **Les résultats alimentent des actions suivantes.** Les ventes, demandes sans réponse et incidents peuvent éclairer les décisions du vendeur.

L'ouverture sociale renforce ces mécanismes grâce à des points d'entrée directs depuis des publications partagées. Il ne faut pas prétendre que chaque mécanisme, isolément, est inédit : **c'est la valeur du parcours intégré qui doit être mesurée.**

## L.5. Principes de fonctionnement transversaux

| Principe | Conséquence pour le produit |
|---|---|
| Un même compte peut acheter et vendre. | Rôles et permissions compatibles. |
| Produit ≠ offre. | Une référence peut avoir plusieurs vendeurs, variantes, prix et conditions. |
| Disponibilité déclarée ≠ vérifiée. | Présenter le niveau d'assurance réel ; distinguer stock, réservation, rupture et commande fournisseur. |
| Commande ≠ paiement ≠ livraison. | Statuts, preuves et suites distincts. |
| Vente fournisseur ≠ vente au client final. | Préserver accords, prix et données propres à chaque relation. |
| Produit numérique ≠ colis physique. | Accès, livraison, licence, éventuelle prestation personnalisée. |
| Suggestion ≠ décision humaine. | Autorisation explicite pour dépenses, modification d'accord et partage de données. |
| Publication extérieure ≠ offre actuelle. | Le lien aboutit à la fiche courante ; aucune promesse de modification de contenus déjà publiés ailleurs. |

Les mécanismes de paiement, remboursement, litiges, conservation éventuelle de fonds, fiscalité et disponibilité de services selon les pays devront être établis avec les partenaires et conseils appropriés avant tout engagement public. Ils ne sont pas validés par cette annexe.

## L.6. Démonstration conceptuelle cohérente

**Un besoin devient une vente :** recherche sans offre adéquate → formulation d'une demande → réponse d'un commerçant pertinent → examen éventuel des fournisseurs → proposition vérifiée → acceptation → commande distincte des états de paiement/exécution → résultat consigné.

Démonstrations complémentaires : achat d'une offre depuis un partage WhatsApp ; vente en boutique enregistrée dans le même stock ; transaction sur un produit numérique avec droit d'accès et livraison propres.

**Conclusion L :** l'exploration conceptuelle générale est suffisamment structurée pour passer à la validation commerciale et économique. Cette conclusion **ne signifie pas** que le marché, les coûts, les comportements ou la faisabilité des paiements ont déjà été démontrés.

---

# ANNEXE M — ÉTAPE 2 : PREMIÈRE ÉVALUATION COMMERCIALE ET ÉCONOMIQUE

**Date :** 25 septembre 2026.  
**Statut :** analyse documentaire et plan d'expérimentation ; **aucun entretien utilisateur, aucune commande et aucun engagement de paiement n'ont été réalisés par l'assistant**. Les observations sectorielles ne démontrent pas encore l'adoption de notre produit spécifique.  
**Objectif :** choisir une logique d'entrée sur le marché et une trajectoire de revenus à tester, sans réduire la vision internationale ni supposer que tous les pays ont les mêmes rails commerciaux.

## M.1. Éléments externes vérifiés — implications et limites

| Fait vérifié | Ce que cela permet de déduire prudemment | Ce que cela ne démontre pas |
|---|---|---|
| La GSMA rapporte plus de 2 000 milliards USD de transactions mobile money en 2025 et environ 155 milliards USD de paiements marchands. [S1] | Les paiements mobiles aux commerçants constituent une pratique économique substantielle à considérer. | Que notre plateforme peut déjà encaisser ou reverser dans n'importe quel pays, ni que sa commission sera acceptée. |
| La Banque africaine de développement décrit des commerçantes en Côte d'Ivoire recevant des commandes par messages et commentaires sociaux ; cette source présente un exemple contextualisé. [S2] | Examiner le passage de conversations existantes vers des commandes structurées, sans changer de force les pratiques de découverte. | Que tous les vendeurs d'Afrique de l'Ouest se comportent de cette façon, ni que le besoin est déjà prouvé pour nos segments. |
| Dans son rapport 2025, Jumia décrit marketplace, paiement, logistique et services aux vendeurs ; son exploitation comprend des coûts importants d'exécution et d'acquisition. [S3] | Éviter de traiter la livraison, la confiance et l'acquisition comme de simples écrans logiciels. | Que notre structure de coûts, nos catégories et notre stratégie d'entrée doivent reproduire celles de Jumia. |
| Shopify Payments n'est accessible qu'aux entreprises situées dans les pays éligibles et exige des vérifications ; dans les autres pays, il faut un prestataire tiers. [S4] | Séparer ambition mondiale, pays du vendeur, pays de l'acheteur, encaissement et reversement. | Qu'un seul fournisseur de paiement résoudra toutes les transactions internationales. |
| FedaPay annonce notamment le Bénin et plusieurs pays UEMOA, la possibilité de sous-comptes marketplace et une couverture carte internationale soumise à examen du dossier. [S5] | Il existe au moins une piste concrète de faisabilité à investiguer pour une exploitation depuis le Bénin. | Une approbation contractuelle, un split validé pour notre modèle ou des reversements mondiaux garantis. |

**Sources consultées le 25 septembre 2026 :**

- [S1] GSMA, *State of the Industry Report on Mobile Money 2026* : https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/gsma_resources/the-state-of-the-industry-report-on-mobile-money-2026/
- [S2] Groupe Banque africaine de développement, *How E-Commerce is Transforming Women's Entrepreneurship in Côte d’Ivoire* (9 mars 2026) : https://www.afdb.org/en/news-and-events/gender-focus-how-e-commerce-transforming-womens-entrepreneurship-cote-divoire-91447
- [S3] Jumia, rapport annuel 2025 déposé auprès de la SEC : https://www.sec.gov/Archives/edgar/data/1756708/000175670826000015/jmia-20251231.htm
- [S4] Shopify, *Supported countries for Shopify Payments* : https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries
- [S5] FedaPay, *Pays couverts, conditions et moyens de paiement acceptés* : https://support.fedapay.com/portal/fr/kb/articles/fedapay-fonctionne-t-il-dans-mon-pays-20-3-2025

## M.2. Premier acheteur du produit : distinguer utilisateur, vendeur payeur et consommateur final

**Hypothèse de clientèle d'entrée à tester, non segment définitivement choisi :** vendeurs de produits physiques qui réalisent déjà des ventes via leur boutique et/ou réseaux sociaux, avec plusieurs références/variantes, des questions clients récurrentes et au moins quelques commandes par semaine. Ce profil peut révéler rapidement la valeur ou l'échec du lien catalogue ↔ stock ↔ partage ↔ demande ↔ commande. Il bénéficie du système même lorsque la marketplace n'a pas encore une forte audience.

**Deuxième segment à tester en parallèle :** vendeurs/créateurs de produits numériques qui partagent déjà leurs offres et doivent livrer des fichiers ou des droits d'accès, éventuellement à des clients étrangers ; profils, modalités de licences et besoins de service sont différents.

**Acheteurs à étudier :** personnes ayant vécu récemment une recherche sans résultat, une disponibilité erronée, une négociation fragmentée ou un achat déclenché par un lien social. Il faut chercher à comprendre leurs choix réels, pas seulement récolter des compliments sur une maquette.

**Fournisseurs :** acteurs de la chaîne d'approvisionnement à interroger pour tester si un commerçant pourrait répondre à une demande hors stock sans mentir sur la disponibilité ni immobiliser imprudemment son argent.

## M.3. Proposition de positionnement commercial de travail

> « Votre commerce et votre marketplace dans le même espace : organisez vos produits et commandes, partagez des offres toujours consultables, recevez des besoins auxquels vous pouvez répondre et suivez vos ventes. »

Côté acheteur : « Cherchez des offres ; si rien ne convient, exprimez votre besoin et comparez les réponses que des vendeurs peuvent réellement fournir. »

À tester : les formulations sont explicatives, non claims publicitaires validés. Ne pas promettre « toujours disponible », « meilleur prix », « vendeur garanti » ou « ventes garanties ».

## M.4. Hypothèses à tester, preuves cherchées et réfutations utiles

| Hypothèse | Preuve comportementale à chercher | Signal qui remettrait en cause l'hypothèse |
|---|---|---|
| H1 — Un vendeur gagne à lier son commerce existant à une marketplace. | Il montre ses processus actuels, entre dans un test de création de catalogue/commande et y retourne pour gérer de vraies opérations. | Double saisie, faible usage après démonstration, préférence persistante pour un outil déjà payé. |
| H2 — Les recherches sans résultat sont suffisamment fréquentes et coûteuses. | Exemples récents datés, temps/perte/déplacement, usage réel de l'option « publier mon besoin ». | Les acheteurs trouvent presque toujours l'article par leurs canaux actuels, sans coût notable. |
| H3 — Les vendeurs répondent utilement à des demandes explicites. | Réponses contextualisées, délais tenus, propositions réellement acceptables et commandes possibles. | Notifications ignorées, réponses génériques, disponibilité fictive, coûts de réponse excessifs. |
| H4 — Les partages sociaux peuvent générer une découverte qui se convertit sur notre offre. | Liens partagés volontairement, visites de fiches, demandes/commandes attribuables avec consentement adéquat. | Faible clic, rupture entre consultation et commande, réticence forte à quitter le canal social. |
| H5 — Les produits numériques justifient un parcours distinct mais intégré. | Achats tests, accès réellement récupéré, demandes de licence et service après-vente observés. | Segment sans offre, sans paiement utilisable ou sans disposition à utiliser la plateforme. |
| H6 — Une valeur monétisable existe pour un payeur identifiable. | Choix d'un tarif/offre réelle, essai conditionné à un prix connu, engagement d'utilisation ou paiement pilote lorsque le service est opérationnel. | Intérêt verbal seul ; réticence à toute commission/abonnement ; contournement systématique hors plateforme. |

## M.5. Acquisition : résoudre l'asymétrie vendeur/acheteur sans exiger une audience initiale gigantesque

**Hypothèse de séquence d'entrée :**

1. Recruter un groupe de vendeurs capables de décrire/tenir leurs offres et d'utiliser l'espace commercial pour leurs propres ventes, même extérieures à la marketplace.
2. Les aider à publier un catalogue réellement consultable et à partager volontairement des liens directs via leurs canaux existants ; ne pas compter sur une API sociale.
3. Faire arriver des acheteurs sur des **offres précises**, non sur une page d'accueil vide. Mesurer consultation, demande, commande, abandon et cause déclarée.
4. Lorsque les acheteurs ne trouvent pas leur variante ou produit, leur proposer une demande structurée ; mettre les vendeurs pertinents en mesure d'y répondre.
5. Observer les transactions effectivement complétées et les retours des deux parties ; renforcer progressivement la couverture des catégories et relations fournisseurs.

Cette séquence est une **stratégie d'amorçage à tester**, pas une obligation de restreindre le produit à une catégorie ou un pays à long terme. Une première densité commerciale et des mécanismes de paiement opérationnels comptent davantage qu'une liste de pays théoriquement « ouverts ».

## M.6. Modèle de revenus — options, pas décision de tarification

| Option | Valeur facturable possible | Risque / condition |
|---|---|---|
| Abonnement vendeur pour gestion avancée | Utilité quotidienne du catalogue, stocks, ventes multicanales, équipes/analyses. | Il faut une raison vérifiée de payer avant ou sans ventes provenant de la marketplace. |
| Commission sur commande conclue *sur la plateforme* | Apport de demande, orchestration et suivi commercial. | Règles de paiement, remboursement, frais fournisseurs, contournement et attribution réelle. |
| Formule adaptée aux créateurs numériques | Accès/stockage/livraison et historique des ventes numériques. | Coût du stockage et trafic, licences, remboursements et pays d'encaissement. |
| Services optionnels additionnels | Amélioration de présentation ou outils professionnels si les vendeurs les utilisent. | Ne pas vendre des statistiques non fiables ni rendre invisibles les offres non payantes. |

**Recommandation d'expérimentation (pas décision finale) :** confronter deux offres payantes compréhensibles — abonnement pour un outil utile hors marketplace et frais de transaction pour une commande réellement traitée — auprès de vendeurs distincts. Ne pas facturer automatiquement l'utilisation d'un lien partagé ou une vente hors plateforme sans valeur et règles convenues.

**Économie unitaire à mesurer :** revenu net encaissé de la plateforme par vendeur et/ou commande **moins** frais de paiement non refacturés, support, stockage/transfert des fichiers, pertes liées aux incidents/fraude, acquisition et éventuel coût logistique réellement assumé. Le GMV (valeur des ventes des marchands) n'est pas le revenu de la plateforme. Une marge affichée sans ces coûts ne prouve pas la viabilité.

## M.7. Marché mondial et paiements : verrou de faisabilité à lever

Une application peut être consultable depuis l'Europe sans pouvoir, le même jour, encaisser un acheteur français, rembourser ce client et reverser légalement le vendeur dans tous les pays. Pour chaque corridor concret, vérifier : domicile du vendeur / de la plateforme, origine du client, type de produit, monnaie d'encaissement, moyen de paiement, reversement, frais, KYC, incidents et règles fiscales applicables.

**Piste prioritaire de vérification pour une opération depuis le Bénin :** obtenir des conditions commerciales écrites d'un prestataire prenant explicitement en charge la marketplace et les sous-comptes ; confirmer les reversements, la couverture internationale par carte selon dossier, les frais et le traitement des remboursements. FedaPay indique une offre potentiellement pertinente [S5], sans validation de notre cas d'usage. D'autres prestataires peuvent être comparés après établissement de ces critères.

## M.8. Protocole terrain prêt à exécuter — sans fabriquer les résultats

**Échantillonnage qualitatif initial, adaptable :** 8 à 12 vendeurs physiques, 8 à 12 acheteurs, 3 à 5 créateurs/vendeurs de produits numériques, 3 à 5 fournisseurs ou intermédiaires. Diversifier les niveaux de digitalisation et les catégories ; ne pas présenter cet échantillon comme statistiquement représentatif.

**Entretien vendeur (20–30 min) :** raconter les trois dernières commandes ; montrer où résidaient prix, variantes et disponibilité ; montrer une vente perdue ou annulée ; expliquer un partage de produit récent ; montrer ce qu'il utilise déjà ; demander quel coût en temps/argent aurait été évité ; présenter brièvement deux parcours puis proposer un essai réel et une offre de prix explicite.

**Entretien acheteur (15–20 min) :** dernier article cherché sans succès ; sources consultées, temps et déplacement ; exemple de publication sociale devenue achat ou abandon ; informations indispensables avant paiement ; réaction à l'option « publier un besoin », puis essai sur un besoin actuel.

**Entretien créateur numérique :** dernière vente internationale ou tentative, paiement, preuve de réception, livraison, fichier perdu, licence, réclamation, coûts. Ne pas déduire sa situation de celle d'un magasin physique.

**Essais de comportement :**

1. Demander à un vendeur volontaire de saisir quelques vrais produits et de partager une fiche à une audience dont il dispose déjà.
2. Observer des visiteurs qui ouvrent le lien, les informations qu'ils cherchent et les éventuelles commandes ; respecter leur consentement et la confidentialité.
3. Proposer à un acheteur une demande réelle restée non satisfaite ; mesurer si les vendeurs répondent avec des offres pertinentes et dans les délais.
4. Tester une fourniture numérique avec accès et support — seulement si un paiement autorisé et effectivement vérifiable est en place, sinon prototype sans argent réel.
5. Proposer un choix réel de modalité de paiement marchand et noter la décision, pas seulement « seriez-vous prêt à payer ? ».

**Mesures suivies :** vendeurs activés réellement, produits à jour, liens volontairement partagés, visites d'offres, demandes pertinentes, propositions exploitables, commandes confirmées, commandes achevées, incidents, temps/effort économisés observés, revenu net de plateforme et taux de retour à l'outil.

**Décision de fin d'étape 2 :** produire une matrice « hypothèse / preuve / réfutation / décision », une cible d'entrée argumentée, un scénario d'acquisition, une hypothèse de tarification avec coût net, et une liste des dépendances de paiement/logistique prioritaires. **En absence d'essais/entretiens, la phase reste préparée et partiellement instruite : elle n'est pas validée par une synthèse de sources.**

## M.9. Passage ordonné aux étapes 3 à 5

- **Étape 3 — PRD :** rédiger des exigences testables et scénarios d'acceptation à partir de L et des résultats effectivement constatés en M, pas de toutes les hypothèses comme si elles étaient des décisions.
- **Étape 4 — Architecture/faisabilité :** lancer tôt un test de faisabilité paiement et de réservation concurrente ; choisir la structure Android/backend/stockage en fonction des exigences et de la couverture des prestataires.
- **Étape 5 — UX/UI et préparation de la construction :** prototype des parcours observés, états d'erreur, tests utilisateurs, plan de réalisation et contrôle de qualité.

**Point de reprise en vigueur (v0.8) :** la définition conceptuelle est consolidée ; la première investigation documentaire de l'étape 2 est rédigée. Les preuves directes d'adoption, d'acceptation de tarifs et de faisabilité contractuelle restent à collecter avant de déclarer la validation commerciale achevée. On peut néanmoins préparer le PRD et les tests techniques sur les exigences déjà stables, en marquant explicitement les dépendances ouvertes.

---

# ANNEXE N — CLÔTURE DU CADRAGE ÉCONOMIQUE AVANT PRD : MODÈLE, RISQUES ET PREUVES MANQUANTES

**Date :** 25 septembre 2026.  
**Fondement :** approfondissement demandé après l'annexe M : « sommes-nous vraiment prêts à quitter le côté économique ? »  
**Statut :** cadrage économique renforcé et suffisamment explicite pour alimenter un PRD conditionnel ; **validation du marché, tarification, prestataires, conformité et rentabilité NON acquises**. Ne pas transformer les recommandations ci-dessous en décisions tacites du fondateur.

## N.1. Conclusion de l'audit : ce qui manquait à M

M identifiait les publics, une stratégie d'amorçage, des pistes de revenus et des entretiens. Il manquait une séparation opérationnelle entre : (1) revenus effectivement encaissés par **notre plateforme** et chiffre d'affaires du commerçant ; (2) marge par commande et marge par vendeur ; (3) commerce physique et vente de contenu numérique sur Android ; (4) flux de paiement, reversement, remboursement et leurs responsabilités ; (5) coûts d'assistance, litiges, acquisition et conformité ; (6) preuve d'usage et preuve de paiement. La présente annexe traite ces lacunes ; elle ne répète pas l'idéation D01/D02.

## N.2. Les clients, bénéficiaires et payeurs ne sont pas interchangeables

| Groupe | Résultat attendu | Valeur susceptible d'être monétisable | Ce qu'il faut prouver |
|---|---|---|---|
| Vendeur ayant déjà un commerce | Réduire les opérations dispersées, garder ses stocks/offres/commandes cohérents, mieux servir ses clients et recevoir de la demande additionnelle | Fonctionnalités professionnelles et/ou commandes réalisées *sur* la plateforme | Usage répété sur de vraies opérations, acceptation d'un prix explicite, gain mesuré ou commandes abouties |
| Acheteur final | Offre pertinente, prix total compréhensible, achat et suivi | Valeur d'usage ; frais éventuels uniquement s'ils sont compréhensibles et justifiés par un service réel | Recherche, achat et retour spontané ; pas seulement intérêt verbal |
| Fournisseur / vendeur professionnel | Recevoir des besoins et vendre aux commerçants | Offre B2B éventuelle à étudier séparément | Qualité des propositions, sérieux des conditions, coût de traitement des demandes |
| Créateur / marchand numérique | Publier, vendre, délivrer les droits et gérer les incidents | Tarification adaptée aux coûts de fichier, bande passante, livraison et paiement | Ventes et délivrances réalisables dans les corridors ciblés ; acceptation de la rémunération réelle |

**Orientation d'amorçage proposée, et non restriction définitive :** étudier d'abord des commerçants ayant déjà des ventes hors plateforme. Leur espace de gestion et leurs liens partageables peuvent leur procurer une utilité avant que la place de marché bénéficie d'un fort trafic organique. Les acheteurs se présentent d'abord sur des offres concrètes partagées par ces vendeurs. Ensuite, les recherches insatisfaites et les demandes structurées créent des occasions de réponse pour d'autres commerçants. Ne pas confondre « premier segment testé » avec « produit limité à une région, une catégorie ou un format ».

## N.3. Architecture des recettes : distinguer la valeur et son fait générateur

| Source de recette à tester | Déclencheur commercial | Règle de prudence |
|---|---|---|
| Abonnement professionnel vendeur | Accès à des bénéfices de gestion convenus | Ne pas facturer le vendeur seulement pour lui permettre de corriger son stock ou exécuter normalement un achat sans examiner l'impact sur la fiabilité du réseau ; grille et contenu à tester |
| Commission marketplace | Transaction éligible effectivement traitée dans le flux défini | Distinguer commande, paiement, remboursement, commission gagnée, commission annulée et reversement vendeur |
| Services optionnels réellement utiles | Service utilisé et prix accepté | Pas de vente forcée de statistiques douteuses ni de promesse de chiffre d'affaires |
| Produit numérique | Transaction et/ou service d'hébergement et d'accès | **Dépend fortement du canal Android, des règles de paiement et du statut juridique de la plateforme** ; aucun tarif ni architecture d'encaissement confirmés |

**À ne pas réintroduire :** programme d'affiliation rémunérée, codes/commissions pour les personnes partageant des produits, connexions API sociales. Les liens partageables restent une capacité de découverte ; leur usage ne crée pas automatiquement une commission due à notre plateforme sur les ventes réalisées hors de son flux transactionnel.

La tarification **hybride** (abonnement + commission) n'est pas adoptée d'office : comparer indépendamment et conjointement les deux propositions, l'effet d'une double facturation, les remises et la perception de valeur. La place de marché ne doit pas dépendre uniquement des frais d'inscription de vendeurs qui n'ont encore rien gagné.

## N.4. Unité économique : la formule que devra porter le futur modèle financier

**GMV / volume d'affaires marchand ≠ revenu de la plateforme ≠ argent disponible pour financer le produit.**

- Recette transactionnelle de plateforme = commissions *effectivement conservées* + frais de service réellement gagnés (à l'exclusion de la part du vendeur, des impôts collectés pour autrui et des sommes remboursées).
- Contribution par commande = recette transactionnelle nette − frais de paiement supportés − coûts de reversement − coûts variables d'assistance − stockage/transfert/IA consommés − coût attendu des remboursements, litiges et pertes − logistique réellement supportée par la plateforme.
- Contribution par vendeur = contribution de ses commandes + revenu d'abonnement effectivement reconnu − coût de service, assistance et activation attribuable à ce vendeur.
- Résultat d'exploitation projeté = somme des contributions − dépenses communes (infrastructure, personnel, maintenance, sécurité, comptabilité, conformité, marketing et administration).
- Acquisition : comparer coût d'acquisition vendeur activé, coût d'acquisition acheteur ayant acheté, marge après première commande, réachat, rétention et délai estimé de récupération du coût d'acquisition ; les visites et inscriptions seules ne suffisent pas.

**Scénarios à chiffrer avec de vrais devis, sans créer de faux chiffres :** petit panier physique avec frais Mobile Money ; panier carte internationale ; vente numérique peu chère et gourmande en téléchargement ; vente avec retour/remboursement ; vente sur commande ; vente hors plateforme enregistrée dans le logiciel de gestion. Pour chacun : qui encaisse ? qui paie les frais ? quand le vendeur reçoit-il l'argent ? qui assume le litige ? la plateforme a-t-elle réellement gagné une commission ?

### Illustration de risque fondée sur un tarif public, pas devis contractualisé

À la consultation du 25 septembre 2026, FedaPay affiche pour le Bénin **1,80 %** de collecte MTN/MOOV/Celtiis et **3,60 %** pour Visa/Mastercard ; certains autres moyens affichent **4,00 %**. Les envois à plusieurs destinataires et certains retraits peuvent présenter des coûts ou conditions distincts. Ces taux ne sont ni un coût final de notre modèle marketplace, ni une promesse de couverture universelle. Ils montrent qu'une commission basse peut être partiellement ou totalement absorbée par les frais de collecte, avant le support, le risque et les autres coûts. **Ne pas annoncer « commission X % » sans faire cet exercice par moyen de paiement.** [N-S1]

## N.5. Paiements de marketplace : flux économique et responsabilité

**Question structurante à résoudre avant d'implémenter le checkout :** la plateforme facture-t-elle l'acheteur en son nom, facilite-t-elle un paiement directement au vendeur, ou opère-t-elle une répartition via un prestataire autorisé ? Les trois situations n'impliquent pas les mêmes obligations, documents fiscaux, frais, risques ni possibilité de remboursement. Ne pas concevoir notre propre séquestre ni conserver des fonds « en attente » sans autorisation et mécanisme contractuel.

FedaPay documente les **sous-comptes** et la répartition d'une transaction, à condition de posséder un **compte principal Marketplace validé** et les sous-comptes requis. Sa documentation de compte décrit des justificatifs d'entreprise (dont IFU/TVA et RCCM) pour l'ouverture marketplace. C'est une piste, pas une approbation de notre dossier ni la confirmation de chaque fonctionnalité ou pays. [N-S2] [N-S3]

**Limite critique à ne pas escamoter :** l'aide FedaPay précise à ce jour que le remboursement opéré directement dans son tableau de bord est limité à **MTN Mobile Money** et dépend de conditions (paiement approuvé, solde disponible). Cette même aide mentionne ailleurs des délais carte bancaire, ce qui appelle **une clarification écrite du prestataire** sur les mécanismes effectivement utilisables par canal, notamment carte et autres mobile money. Ne promettre ni remboursement instantané universel, ni automatisation API d'un remboursement non documentée. [N-S4]

**Liste à demander par écrit au prestataire :** droit d'exploiter une marketplace depuis notre entité ; catégories admises ; KYC vendeur et création sous-compte ; pays du vendeur et de l'acheteur ; devises ; moyens de collecte ; tarification complète (collecte, répartition, transferts, remboursements, chargebacks, change) ; réserves/retards ; preuves de paiement ; disponibilité d'une sandbox ; conditions de désactivation et de support ; gestion des annulations avant/après reversement. L'architecture prévoit de pouvoir changer de prestataire sans refaire tout le produit.

## N.6. Point critique découvert : Google Play et produits numériques

Notre ambition d'une application Android et d'un catalogue **physique + numérique** est conservée. Mais le même parcours de paiement ne peut pas être présumé compatible avec toutes les catégories.

La règle générale Google Play pour les applications **distribuées sur Play** exige son système de facturation pour les achats de contenus, biens et fonctionnalités numériques *dans l'application*, hors exceptions et programmes régionaux applicables. Les achats dont l'objet principal est un **bien physique** n'utilisent pas ce système. Les abonnements donnant accès à certaines fonctionnalités logicielles intégrées peuvent eux aussi être concernés. Des régimes alternatifs existent dans des régions éligibles, avec conditions ; **un lien vers un checkout web n'est pas une échappatoire générale pour les biens numériques**. Les frais de service Google Play varient selon région, type de transaction, programme, installation et mode de facturation, et ne doivent pas être remplacés dans nos hypothèses par un taux unique universel. [N-S5] [N-S6]

**Implication PRD obligatoire :** identifier distinctement au minimum (a) produit physique, (b) contenu/fichier numérique accessible dans l'application, (c) prestation numérique personnalisée, (d) abonnement vendeur à des fonctions logicielles, (e) achat initié depuis la page web de découverte. Définir canal, moyen de paiement autorisé, droits d'accès, commission, bénéficiaire et conditions applicables **après** examen du cas précis de notre marketplace multi-vendeurs. Le fait qu'un APK puisse techniquement être distribué hors Play n'autorise pas à supposer que les mêmes règles s'appliquent à une version publiée sur Play. Ne pas choisir une architecture de paiement numérique définitive tant que ce point n'est pas clarifié.

## N.7. Dimension internationale et fiscalité : garder l'ambition, circonscrire chaque lancement concret

L'accessibilité mondiale du catalogue est un choix de conception possible ; la **capacité de vendre** exige une matrice par corridor : pays/entité de la plateforme, pays du vendeur, pays de l'acheteur, résidence fiscale des parties, produit physique/numérique, devise, moyen de collecte, reversement, frais de change, transport ou livraison numérique, garantie/retour, conformité et impôts.

À titre d'exemple documenté, le régime européen OSS permet sous certaines conditions aux entreprises non établies dans l'UE de déclarer la TVA sur des services vendus à des consommateurs situés dans l'UE ; les taux et responsabilités varient selon l'opération. Une marketplace peut dans certaines circonstances être traitée comme fournisseur présumé pour la TVA. **Il faut déterminer qui est légalement le vendeur/fournisseur et qui collecte/déclare la taxe**, au lieu de déduire cette réponse de notre interface. [N-S7]

Cette exigence n'impose pas de limiter la vision commerciale à l'Afrique de l'Ouest. Elle évite de faire des promesses de paiement, livraison et fiscalité « partout » non appuyées par des accords et procédures vérifiés.

## N.8. Responsabilités, catégories et coûts souvent oubliés

| Poste | Question commerciale et opérationnelle à trancher | Conséquence pour le PRD |
|---|---|---|
| Nature du vendeur légal | Le commerçant ou la plateforme vend-il à l'acheteur, selon le flux ? | CGV, facture/reçu, vendeur affiché, responsabilité de retour et taxe |
| Conformité vendeur et catalogue | Quels justificatifs, droits sur les fichiers, produits interdits/contrefaits, modération et recours ? | Onboarding, vérifications proportionnées, signalement et suspension motivée |
| Expédition | Vente à retirer, livreur du vendeur ou service organisé par la plateforme ? | Délais, preuve de remise, coûts et obligations distincts, sans promesse de livraison globale implicite |
| Paiement à la remise / hors plateforme | Comment distinguer vente enregistrée et chiffre d'affaires encaissé par la plateforme ? | Statuts de caisse et paiement, aucune commission présumée, prévention des faux indicateurs |
| Support et réclamation | Qui répond, rembourse et assume frais et pertes ? | Dossier d'incident, voies d'escalade, coûts de support par commande |
| Produits numériques | Licence, accès récurrent, diffusion illicite, révocation/refus ou mise à jour ? | Droit d'accès, règles de fourniture, preuves et coûts d'hébergement |
| IA et infrastructure | Combien coûte réellement une assistance par recherche, visuel, description ou vendeur ? | Quotas transparents/gestion des coûts si une fonction payante est retenue, sans dépendance obligatoire à la vidéo IA |
| Croissance | Quels coûts pour acquérir et activer un vendeur et un premier acheteur ? | Instrumentation de conversion et de rétention, budget d'amorçage |

## N.9. Étude terrain : protocole bref, décisions franchissables

Conserver l'échantillonnage exploratoire de M.8, mais recueillir **des actes**, et non uniquement des opinions. Pour chaque entretien : reconstruire une transaction récente ; observer les outils utilisés ; faire exécuter une tâche simple sur maquette ou prototype ; présenter une offre de prix réelle ; noter refus, temps, erreurs, contournements, intérêt spontané et volonté de revenir. Avec un vendeur numérique, examiner un paiement et une délivrance de droit. Avec un fournisseur, examiner une offre « sur commande » et son risque. Protéger les données des personnes et ne pas prétexter une vente réelle si le système de paiement n'est pas opérationnel.

### Tableau de décision à remplir après preuves (non rempli artificiellement)

| Point à décider | Preuve minimale recherchée | Si non démontré |
|---|---|---|
| Segment commercial d'amorçage | Vendeurs qui accomplissent réellement des tâches et reviennent | Modifier l'onboarding, le bénéfice initial ou les profils à tester |
| Demandes d'achat | Acheteurs qui soumettent des besoins réels + vendeurs qui répondent utilement | Revoir les critères de correspondance et les incitations de réponse |
| Entrée sociale | Partages volontaires + acheteurs qui accèdent à l'offre précise puis agissent | Corriger le contenu/lien/la friction de sortie du réseau |
| Tarification | Prix explicite accepté par des vendeurs distincts et coût de service estimé | Ne pas figer abonnement ni commission dans le PRD comme modèle validé |
| Viabilité unitaire | Scénarios de commandes après frais, support, incident et acquisition | Ajuster prix, coût, responsabilité ou flux commercial |
| Paiement | Accord du fournisseur, sandbox démontrée, remboursement/versement clarifiés | PRD modulaire avec statut « dépendance bloquante pour mise en production » |
| Produits numériques sur Play | Analyse des transactions/canaux et du règlement par type d'achat | Interdire les promesses de checkout numérique universel ; marquer flux à valider |

**Une règle de progression :** l'absence d'entretiens ne doit pas bloquer la **rédaction** du PRD sur les éléments stables ; elle doit empêcher de marquer comme *validés* les tarifs, la demande, l'acceptation de paiement et le lancement réel. L'absence d'un prestataire ayant approuvé le flux empêche la **mise en production de ce flux**, pas la conception des interfaces et états correspondants. Mettre ces points dans le registre des risques et des critères de sortie, et non les oublier en passant à l'étape 3.

## N.10. Bilan de cohérence et passage au PRD

**Acquis conceptuels conservés :** une application Android native et une vision internationale ; les deux faces D01/D02 ; les produits physiques et numériques ; la gestion commerciale utile hors marketplace ; recherche et demande non satisfaite ; propositions et transactions suivies ; circulation sociale par partage de liens sans API sociales ; pas d'affiliation rémunérée actuellement ; assistance contextuelle sous le contrôle de l'utilisateur.

**Choix commerciaux non encore approuvés ou démontrés :** segment initial précis, pays de commercialisation opérationnelle, abonnement versus commission versus formule hybride, taux et prix, opérateur de paiement, rôle légal de la plateforme, modèle de retour et remboursement, régime d'achat numérique Play, coût d'acquisition et rentabilité.

**Conclusion de l'audit économique :** nous avons terminé le **cadrage analytique exploitable avant PRD**. Nous n'avons **pas validé économiquement le marché**. Passer au PRD est raisonnable si ce dernier explicite les décisions ouvertes et décrit les exigences et tests nécessaires, plutôt que d'implémenter une hypothèse comme une certitude.

**Point de reprise en vigueur (v0.9) : ÉTAPE 3 — PRD.** Transformer les annexes L/M/N et les décisions explicites de l'utilisateur en spécification fonctionnelle cohérente et testable ; inclure dès l'origine la matrice de paiements physique/numérique, les vendeurs et achats hors plateforme, les états de paiement distincts, les flux d'erreur, la frontière du rôle juridique et les hypothèses nécessitant preuve. L'étape 2 reste « **cadrage documentaire terminé ; validation terrain/contractuelle ouverte** ». Ne pas relancer une troisième idéation générale.

### Sources officielles ajoutées le 25 septembre 2026

- **[N-S1]** FedaPay, *Tarifs* (prix affichés pour le Bénin, sous réserve du contrat applicable) : https://www.fedapay.com/pricing
- **[N-S2]** FedaPay, documentation, *Sous-comptes* (compte Marketplace validé, répartition de transactions ; vérifier l'état actuel avec le fournisseur) : https://docs-v1.fedapay.com/sous-comptes
- **[N-S3]** FedaPay, documentation, *Votre compte* (justificatifs Marketplace ; documentation v1 à reconfirmer) : https://docs-v1.fedapay.com/compte/votre-compte
- **[N-S4]** FedaPay, support, *Comment effectuer un remboursement sur FedaPay* : https://support.fedapay.com/portal/fr/kb/articles/comment-effectuer-un-remboursement-sur-fedapay-20-3-2025
- **[N-S5]** Google Play Console, *Paiements* : https://support.google.com/googleplay/android-developer/answer/9858738?hl=fr
- **[N-S6]** Google Play Console, *Frais de service* : https://support.google.com/googleplay/android-developer/answer/112622?hl=fr
- **[N-S7]** Commission européenne, *One Stop Shop / VAT e-commerce* : https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en
- **[N-S8]** Commission européenne, *EU VAT One Stop Shop — Your Europe* : https://europa.eu/youreurope/business/finance-and-tax/vat/one-stop-shop/index_en.htm
