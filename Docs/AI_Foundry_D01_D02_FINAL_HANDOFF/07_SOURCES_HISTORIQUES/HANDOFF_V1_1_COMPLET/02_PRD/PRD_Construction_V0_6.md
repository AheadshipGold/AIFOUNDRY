> **CORRECTION CRITIQUE DU HANDOFF — ADMINISTRATION (25 septembre 2026)** : à la demande explicite du fondateur, l’administration de la plateforme est un **domaine central** et non trois vues génériques. Lire **`03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md`** avant toute conception des permissions, des paiements, des rôles, des modules ou de la mise en production. Cette extension comprend **50 exigences ADMIN-FR, 18 vues admin, 17 tickets et 20 tests**. Elle est normative pour la construction, avec portes financières/contractuelles toujours ouvertes. Les références anciennes à O01–O03 sont conservées comme couverture historique *insuffisante*, non comme limite du panel. Le prototype admin est une **simulation navigateur**, pas un service déployé.

# PRD — Plateforme de commerce actif D01 + D02

**Product Requirements Document — dossier de spécification fonctionnelle initiale**  
**Version :** 0.6 — ajout normatif du domaine admin complet (PRD v0.5 conservé) ; handoff de construction : PRD v0.4 préservé + annexe D (thèmes, premium, politique IDE et traçabilité UX) ; dépendances externes maintenues ouvertes  
**Date :** 25 septembre 2026  
**Produit :** nom de marque non décidé ; « plateforme de commerce actif » = expression de travail, non identité finale  
**Support principal :** application Android native / véritable APK, avec éventuels points d'entrée web mobile vers des offres partageables  
**Source de vérité conceptuelle :** `AI_Foundry_D01_D02_Analyse_Commerce_Achat_Vente_V0_9.md` (annexes L, M, N ; corrections des annexes D et K)  
**Statut :** PRD de référence pour la construction, sous réserve des portes explicitement bloquantes. Annexes A (revue), B (FR/EN confirmé) et C (quatre arbitrages conçus par l’assistant à la demande du fondateur). Les solutions de C sont des **options de conception retenues pour préparer l’architecture**, pas des contrats de prestataires ni des décisions commerciales attribuées sans preuve au fondateur.

> **Décision fondateur du 25 septembre 2026 — FR/EN obligatoire :** l’application doit fonctionner en **français et en anglais** pour les parcours essentiels acheteur, vendeur et plateforme ; les deux langues sont requises dès le fonctionnement du produit, indépendamment du premier marché de commercialisation. Cette décision remplace les mentions anciennes « candidats à validation » / « ordre à confirmer ». Voir l’**annexe B** ; tous les autres arbitrages du PRD gardent leur statut.

> **Mise à jour de travail v0.4 — 25 septembre 2026 :** l’assistant prend en charge les quatre sujets qui restaient à concevoir (IA utile, porte d’entrée web, séparation des flux, paiement international/numérique), conformément à la demande d’avancer sans attendre des micro-validations. L’**annexe C fait autorité pour ces quatre points** ; les options anciennes qui semblent contraires sont des historiques. Les garanties de pays/PSP/Play ne sont pas déclarées acquises.

> **Mise à jour finale documentaire v0.5 — approuvé après le PRD v0.4 :** FR/EN obligatoires ; modes système/clair/sombre obligatoires ; direction premium approuvée ; Cursor n’est pas l’IDE choisi ni une dépendance. Les anciennes options dans les annexes historiques n’ont aucune préséance sur l’annexe D, le design system et l’architecture finale du présent pack. Le modèle économique, le PSP, les pays actifs et les preuves terrain restent non validés.

> **Mode de lecture :** **C** = orientation explicitement confirmée par le fondateur ; **S** = spécification proposée sur la base du concept consolidé, à accepter/corriger ; **X** = exclusion actuelle explicitement confirmée ; **B** = décision, faisabilité ou conformité bloquante pour *l'activation en production du flux concerné* ; **T** = hypothèse commerciale à tester avec de vrais utilisateurs. « Bloquant pour un flux » ne signifie pas « abandonner le produit ». Les exemples, seuils, délais, rôles juridiques, tarifs et fournisseurs non explicitement acceptés restent des propositions ou des paramètres.

---

## 0. Résumé exécutable

### 0.1. Définition du produit

Une plateforme commerciale commune où :

- l'acheteur cherche une offre existante **ou exprime un besoin** qui peut recevoir des propositions ;
- le commerçant gère sa boutique et ses ventes, y compris les opérations réalisées hors marketplace, et répond aux demandes pertinentes ;
- un même compte peut acheter, vendre et s'approvisionner ; un fournisseur est un vendeur dans une relation commerciale distincte ;
- les produits physiques et numériques disposent d'exigences d'exécution adaptées ;
- la fiche commerciale peut circuler sur les réseaux sociaux par **partage volontaire et lien direct**, sans connexion aux API sociales ;
- besoins, offres, propositions, commandes, paiements et résultats sont reliés, sans fusionner leurs états ni déposséder l'utilisateur des décisions engageantes.

**Promesse fonctionnelle proposée [S] :** permettre à une situation commerciale de progresser du besoin à son résultat, en limitant les ressaisies, l'incertitude et les opérations perdues entre les outils.

### 0.2. Ce qui est acquis / ce qui ne l'est pas

| Sujet | Statut | Règle pour le PRD |
|---|---|---|
| Étudier D01 et D02 ensemble ; D03 reste de côté | C | Ne pas réintroduire le programme de marketing D03 comme obligation cachée. |
| Vision complète, pas une « V1 coquille vide » | C | Décrire le système entier ; les lots de développement seront des **séquences de dépendances**, non une réduction silencieuse de la vision. |
| Android natif comme produit principal | C | Ne pas remplacer l'APK par une application web. |
| **Fonctionnement bilingue FR + EN** | **C** | Deux langues effectives et complètes dans les parcours essentiels, pas un simple modèle i18n préparatoire. |
| Produits physiques **et** numériques ; ambition internationale | C | Les deux sont modélisés dès le départ ; couverture transactionnelle à ouvrir selon vérifications pays/produit. |
| Marketplace ouverte à la découverte via réseaux sociaux | C | Partages et destinations claires. |
| Affiliation rémunérée à liens/codes/commissions | X | Ne pas créer de rôle « affilié », rémunération, ledger de commissions ou dashboard promoteur. |
| Connexions API sociales WhatsApp/Facebook/Instagram/TikTok | X | Aucun accès aux comptes/messages/publications des réseaux tiers ; partage OS volontaire seulement. |
| Réseau social généraliste ou régie publicitaire intégrée | X | Ne pas inférer ces fonctionnalités de la métaphore des « mondes ». |
| Prix, commissions, abonnements, pays de vente, prestataires de paiement | B/T | Prévoir la configuration ; ne rien présenter comme fixé/validé. |
| Architecture détaillée, framework, prestataires d'IA | Étape 4 | Le PRD énonce les contraintes et contrats fonctionnels, pas une stack arbitrairement imposée. |

### 0.3. Critères de réussite produits, à mesurer, non encore démontrés

1. Un vendeur publie une offre exploitable et peut enregistrer une vente extérieure sans double gestion contradictoire du stock.
2. Un acheteur découvre une offre partagée et retrouve **l'offre précise et à jour**, pas la page d'accueil générique.
3. Une recherche sans correspondance peut devenir une demande ; une réponse pertinente peut devenir une proposition, puis une commande sans perte des conditions acceptées.
4. Une réservation concurrente ne permet pas de promettre deux fois une quantité unique.
5. Paiement, exécution et résolution d'incident sont distincts et vérifiables ; un vendeur ne peut pas « prouver » le paiement par une capture seule.
6. Un produit numérique acheté conformément au canal autorisé donne lieu à un droit d'accès identifiable ; un échec de téléchargement ne supprime pas le droit.
7. Un vendeur comprend quelles actions exigent son attention et pourquoi, sans achats, promotions ou modifications de prix automatiques non autorisées.

---

## 1. Problèmes, publics et emplois à accomplir

### 1.1. Problèmes investigués — hypothèses à confronter au terrain

- Les informations de produit, stock, conversation, commande et caisse peuvent être dispersées ; leur rapprochement demande des ressaisies.
- Le catalogue seul ne répond pas aux besoins pour lesquels aucun vendeur n'a publié d'offre correspondante.
- Une disponibilité affichée peut être périmée, notamment si le vendeur traite aussi des ventes physiques.
- Une transaction engagée peut mal se poursuivre en cas de fournisseur défaillant, réservation concurrente, preuve de paiement insuffisante, colis non livré ou fichier numérique inaccessible.
- Un vendeur peut partager une offre dans ses réseaux existants, mais le destinataire doit ensuite pouvoir retrouver les conditions commerciales actuelles.

**Important :** l'Atlas qualifie les frictions comme potentielles. Ni leur fréquence, ni la volonté de payer, ni la rentabilité ne sont déjà prouvées.

### 1.2. Acteurs et rôles

| Rôle métier | Travaux attendus | Visibilité et responsabilités proposées |
|---|---|---|
| Visiteur | Découvrir une offre partagée, rechercher et comprendre les conditions | Contenu public seulement ; actes engageants selon authentification requise. |
| Acheteur | Chercher, demander, comparer, accepter, payer si disponible, recevoir, signaler | Accès à ses demandes/achats ; contrôle de ses coordonnées et préférences. |
| Commerçant/vendeur | Boutique, produits, prix, stock, ventes physiques et marketplace, commandes, fournisseurs, SAV | Accès uniquement à ses données commerciales et transactions autorisées. |
| Fournisseur | Répondre à un commerçant dans une relation d'approvisionnement | Les prix B2B et informations du client final ne sont pas publics par défaut. |
| Créateur numérique | Mettre en vente fichiers ou contenus, fournir accès/licence selon conditions | Déclare les droits sur ses produits ; gère l'exécution numérique autorisée. |
| Collaborateur vendeur [S] | Contribuer à une boutique selon permissions | Rôles granulaires : catalogue, caisse, commande, stock, support. |
| Opérateur plateforme [S] | Vérification proportionnée, catégories, litiges, modération, paramètres pays, support | Accès traçable et minimal ; ne pas agir comme vendeur réel par simple effet de l'interface. |

Un seul compte peut exercer les rôles acheteur, vendeur et acheteur professionnel ; la boutique est une entité commerciale distincte du compte individuel. **Un promoteur affilié rémunéré n'est pas un rôle actuel.**

### 1.3. Portée géographique

Vision internationale dès le modèle de données : devise, langues, pays, adresse, catégories, droits numériques, moyens de remise et prestataires configurables. **Ne pas confondre visibilité internationale et paiement/reversement/livraison disponibles dans tous les pays.** Chaque corridor commercial sera activé après vérification des conditions pertinentes.

---

## 2. Principes produits non négociables dans l'expérience proposée

**PR-01 [S] — Continuité.** Une demande/une offre/une proposition/une commande partagent des références vérifiables ; les informations acceptées suivent le parcours sans ressaisie inutile.

**PR-02 [S] — États séparés.** Catalogue, disponibilité, proposition, commande, paiement, exécution, droit numérique et incident n'utilisent pas un seul booléen « terminé ».

**PR-03 [S] — Information actuelle.** Une publication sociale ancienne peut rester visible ailleurs ; la fiche ouverte depuis son lien montre les conditions *actuelles* et signale les changements.

**PR-04 [S] — Transparence.** Déclaré ≠ vérifié ; sur commande ≠ en stock ; paiement initié ≠ reçu ; commande payée ≠ livrée.

**PR-05 [S] — Contrôle humain.** Toute dépense, acceptation d'un accord, révision de prix, promotion, restitution financière ou transmission non nécessaire de données exige une action/autorisaton adéquate.

**PR-06 [S] — Une même activité peut avoir plusieurs origines.** Vente née sur la marketplace, vente physique, téléphone, lien social ou relation fournisseur ; conserver la provenance connue sans inventer d'attribution.

**PR-07 [S] — Physique et numérique.** Un socle commun de commande avec des obligations de fourniture distinctes ; les produits mixtes doivent pouvoir exister sans masquer leurs règles différentes.

**PR-08 [C/X] — Ouverture sociale simple.** Partage par mécanisme du téléphone et liens profonds/landing mobile envisagés ; aucune collecte de messages sociaux, publication automatique universelle ni rémunération de partage.

---

## 3. Périmètre fonctionnel et exigences testables

**Conventions :** chaque `FR-XX` est un identifiant stable. Statut `S` = proposition fonctionnelle en cours d'examen. `B` = flux à ne pas activer publiquement tant que ses dépendances ne sont pas levées. Les critères ci-dessous peuvent être raffinés lors de l'étape UX / technique sans changer l'intention métier.

### 3.1. Comptes, identité, boutique et permissions

**FR-01 [S] — Compte multi-rôle.** L'utilisateur peut être acheteur et devenir vendeur sans créer nécessairement une identité de connexion séparée. **Acceptation :** ses achats personnels et les ventes de sa boutique sont visibles dans les bons contextes et ne se mélangent pas dans les rapports de chiffre d'affaires.

**FR-02 [S] — Profil boutique.** Nom commercial, description, moyens de contact choisis, localisation générale lorsque utile, politiques de vente, devises/territoires servis selon configuration. **Acceptation :** un visiteur voit les informations publiques et le vendeur édite les informations permises.

**FR-03 [S] — Vérifications différenciées.** Le système indique ce qui est déclaré, ce qui a été vérifié et le périmètre de la vérification. **Acceptation :** un badge d'identité ne peut être interprété comme preuve automatique d'authenticité de tous les articles.

**FR-04 [S] — Collaborateurs et audit.** Une boutique peut attribuer des permissions adaptées ; les modifications critiques sont traçables. **Acceptation :** un employé non autorisé ne peut ni changer les coordonnées de paiement ni rembourser.

**FR-05 [B] — Conformité vendeur.** Les pièces, identifiants et autorisations demandés dépendent du pays, du partenaire de paiement et de la nature des ventes ; ne pas créer de procédure KYC factice ou universelle.

### 3.2. Catalogue, offres, prix et variantes

**FR-06 [S] — Produit distinct de l'offre.** Le produit décrit l'article ; l'offre décrit vendeur, état, variante, prix, stock, territoire, conditions et durée de validité. **Acceptation :** deux vendeurs d'une même référence gardent leurs prix et stocks propres.

**FR-07 [S] — Variantes.** Taille, couleur, capacité, format, licence ou autres dimensions applicables. **Acceptation :** une commande capture la variante exacte ; le stock n'est pas décrémenté sur une variante différente.

**FR-08 [S] — Catégories physiques, numériques et mixtes.** Chaque type demande ses attributs et obligations propres. **Acceptation :** un fichier numérique ne demande pas obligatoirement une adresse de livraison physique ; un article physique nécessite un mode de remise.

**FR-09 [S] — Offre complète et contrôlée.** Photos, description, prix, devise, quantité/état, frais connus, conditions, présence ou non de garantie et délais. **Acceptation :** l'utilisateur voit les restrictions ou informations manquantes avant l'engagement.

**FR-10 [S] — Version des conditions.** Une offre peut changer, mais une commande existante conserve un instantané de ce qui a été accepté. **Acceptation :** modifier aujourd'hui le prix public ne modifie pas rétroactivement le prix convenu hier.

**FR-11 [S] — État publication.** Brouillon, publiée, suspendue, expirée/archivée ; capacité d'afficher « plus disponible ». **Acceptation :** un ancien lien résout vers la fiche et indique correctement son état.

### 3.3. Stocks, réservations et ventes extérieures

**FR-12 [S] — Stock par article/variante/emplacement si pertinent.** Le vendeur peut recevoir, ajuster et compter son stock avec motif traçable. **Acceptation :** l'historique distingue réception, vente, annulation, perte et correction manuelle.

**FR-13 [S] — Disponibilité honnête.** Au moins : disponible selon stock suivi, à confirmer, sur commande, indisponible. **Acceptation :** « sur commande » ne se présente jamais comme « en stock ».

**FR-14 [S/B technique] — Réservation concurrente atomique.** Une réservation confirmée porte sur une quantité disponible réelle et bloque les consommations concurrentes incompatibles. **Acceptation :** deux acheteurs ne réservent pas simultanément le dernier exemplaire ; l'un reçoit une suite claire.

**FR-15 [S] — Expiration de réservation.** Durée et conditions explicites, paramétrables selon contexte ; libération après expiration/annulation selon les états de paiement. **Acceptation :** une réservation expirée ne bloque plus indéfiniment le stock.

**FR-16 [S] — Vente extérieure.** Le vendeur peut enregistrer une vente en boutique ou via un canal externe ; celle-ci met à jour la bonne quantité, mais n'est pas comptée à tort comme vente générée par la marketplace. **Acceptation :** les rapports séparent ventes internes, externes et provenance inconnue.

**FR-17 [S] — Réapprovisionnement.** Fiches fournisseurs, conditions/devis, commandes fournisseur et réceptions documentées ; achat fournisseur indépendant de la commande du client final. **Acceptation :** l'échec fournisseur n'efface pas l'obligation du commerçant envers son client.

### 3.4. Découverte, recherche, comparaison, demandes

**FR-18 [S] — Recherche multicritère.** Texte, catégorie, caractéristiques, localisation pertinente, prix et disponibilité. **Acceptation :** le résultat précise les critères correspondants et n'invente pas les données absentes.

**FR-19 [S] — Comparaison exploitable.** Prix et frais connus, variante, état, mode de remise, délai, vendeur et conditions. **Acceptation :** le coût final est affiché lorsqu'il est calculable et signalé « à confirmer » sinon.

**FR-20 [S] — Recherche sans offre adéquate.** L'acheteur peut créer une demande avec catégorie, caractéristiques, quantité, budget indicatif, délai, lieu de fourniture et visibilité/consentement. **Acceptation :** une recherche vide propose une suite sans imposer la publication publique du besoin.

**FR-21 [S] — Cycle de vie de la demande.** Brouillon, active, réponses reçues, satisfaite, expirée, retirée. **Acceptation :** une demande retirée n'accepte plus de nouvelles propositions sans réactivation.

**FR-22 [S] — Correspondance pertinente.** Les vendeurs voient les besoins relevant des catégories/zones/conditions qu'ils déclarent, selon consentement. **Acceptation :** les coordonnées privées ne sont pas rendues publiques pour « faire matcher » la demande.

**FR-23 [S] — Plusieurs propositions.** Une demande peut recevoir plusieurs réponses distinctes ; chaque réponse indique quantité, variante, prix, frais, disponibilité, validité et conditions. **Acceptation :** l'acceptation d'une offre n'altère pas silencieusement les offres concurrentes ; la demande et les autres propositions passent à l'état applicable selon les règles retenues.

**FR-24 [S] — Clarification du besoin.** Questions guidées et éventuelle assistance IA facultative, sans remplacer les préférences déclarées. **Acceptation :** l'utilisateur valide le besoin final avant publication.

### 3.5. Questions, négociation, proposition et accord

**FR-25 [S] — Conversation liée au contexte.** Les échanges dans la plateforme peuvent être rattachés à produit, demande, proposition ou commande. **Acceptation :** ouvrir une demande permet de retrouver son échange pertinent sans chercher dans un fil générique.

**FR-26 [S] — Proposition structurée.** Le vendeur transforme une réponse en offre explicite avec conditions et échéance. **Acceptation :** la proposition acceptée est identifiable et non réécrite unilatéralement.

**FR-27 [S] — Modification substantielle.** Changement de prix, produit, délai essentiel ou quantité après acceptation requiert accord des parties ou solution prévue aux conditions. **Acceptation :** un vendeur ne remplace pas silencieusement un ordinateur convenu par un autre.

**FR-28 [S] — Vente sur commande.** Le vendeur distingue état de stock, délai annoncé, preuve de confirmation fournisseur et incertitudes ; le client voit les conditions avant acceptation. **Acceptation :** une simple intention d'achat fournisseur n'est pas affichée comme une disponibilité immédiate.

### 3.6. Panier, commande, paiements et comptabilité opérationnelle

**FR-29 [S] — Récapitulatif avant engagement.** Produit, variante, prix, quantité, frais, adresse ou accès numérique, devise, vendeur et conditions. **Acceptation :** l'acheteur valide explicitement les conditions pertinentes avant confirmation.

**FR-30 [S] — Commande immuable sur les engagements essentiels.** La commande reçoit référence, vendeur, acheteur, instantané de l'accord, montant et flux d'exécution. **Acceptation :** modification d'une fiche produit n'altère pas l'historique de commande.

**FR-31 [S] — États indépendants.** Commande, paiement et livraison/droit numérique sont chacun suivis séparément. **Acceptation :** la réception d'un paiement ne marque pas automatiquement le colis « livré ».

**FR-32 [B] — Paiement par corridor et nature d'achat.** Les modes autorisés sont configurés selon pays vendeur/acheteur, produit, canal Android/web, partenaire et règles applicables. **Acceptation :** une option non prise en charge n'est pas affichée comme disponible.

**FR-33 [S/B fournisseur] — Vérification serveur.** L'état payé dépend du prestataire, d'une preuve de caisse validée dans le flux concerné ou de la réconciliation autorisée, jamais d'une capture de l'acheteur seule. **Acceptation :** un faux screenshot n'active ni livraison numérique ni versement comme paiement confirmé.

**FR-34 [S] — Retries et idempotence.** Rechargement, double tap, webhook répété ou callback tardif ne doivent pas produire un deuxième débit logique ni deux commandes contradictoires. **Acceptation :** répéter un événement déjà traité n'incrémente pas deux fois les montants.

**FR-35 [S/B] — Remboursement et reversement.** Responsable, éligibilité, canal et statut explicites ; traitement manuel supervisé lorsque l'automatisation n'est pas validée. **Acceptation :** aucun bouton « remboursé » ne certifie un remboursement effectivement non confirmé.

**FR-36 [S] — Vente externe et revenu plateforme.** Séparer chiffre d'affaires commerçant, montant encaissé par PSP, chiffre d'affaires plateforme, commissions hypothétiques, frais et remboursements. **Acceptation :** enregistrer une vente cash en boutique n'augmente pas artificiellement les encaissements de la plateforme.

**FR-37 [B] — Abonnements et commissions.** Modèles tarifaires configurables dans la conception ; activation commerciale et checkout seulement après validation du modèle et des règles de facturation applicables, notamment les fonctionnalités numériques Android. **Acceptation :** aucune tarification fictive n'est affichée comme approuvée.

### 3.7. Exécution physique

**FR-38 [S] — Modalités.** Retrait, remise directe ou livraison assurée selon modèle effectivement disponible et déclaré. **Acceptation :** le système ne garantit pas un réseau de livreurs universel.

**FR-39 [S] — Informations de remise.** Repères, contact nécessaire, délai et frais communiqués avec permissions adaptées. **Acceptation :** un livreur ou un vendeur n'accède qu'aux informations nécessaires à la remise prévue.

**FR-40 [S] — Jalons et preuve.** À préparer, prête, remise au transporteur le cas échéant, remise déclarée, réception confirmée ou incident. **Acceptation :** « expédié » n'est pas synonyme de « reçu ».

**FR-41 [S] — Échec de livraison.** Colis perdu, destinataire absent, délai dépassé, erreur de variante : ouvrir un suivi rattaché à la commande. **Acceptation :** l'achat reste consultable pendant la résolution.

### 3.8. Produits numériques

**FR-42 [S] — Types numériques.** Téléchargement immédiat, accès à un contenu ou création personnalisée ; format, taille, version, licence et obligations affichés. **Acceptation :** le flux personnalisé prévoit un délai de réalisation, pas une promesse de téléchargement instantané.

**FR-43 [B] — Canal de paiement numérique Android.** Pour chaque catégorie et canal, validation préalable du régime Google Play et des éventuels régimes alternatifs légalement/contractuellement applicables. **Acceptation :** pas de simple lien web utilisé comme contournement présumé des règles des achats numériques intégrés.

**FR-44 [S/B paiement] — Droit d'accès.** Après paiement authentiquement confirmé selon canal autorisé, créer un droit associé à l'acheteur, à la commande, à la licence et à la version. **Acceptation :** un téléchargement raté n'efface pas le droit acquis.

**FR-45 [S] — Livraison sécurisée et nouvelle tentative.** URL ou mécanisme d'accès contrôlé, expiration des liens techniques sans disparition du droit, limites anti-abus proportionnées. **Acceptation :** acheteur autorisé peut réessayer dans les limites des conditions.

**FR-46 [S] — Mise à jour / révocation / litige.** Définir ce que la licence inclut et les cas où un accès peut être suspendu ; tracer les motifs. **Acceptation :** le vendeur ne peut supprimer sans trace l'accès déjà promis.

**FR-47 [S/B] — Vente physique + numérique.** Une commande mixte peut conserver des sous-obligations de fourniture différentes. **Acceptation :** le droit numérique n'attend pas un faux statut « livraison de colis » ; une annulation partielle ne confond pas tous les montants.

### 3.9. Partage social volontaire et points d'entrée

**FR-48 [C/S] — Fiche partageable.** Depuis produit/offre/boutique, utiliser la feuille de partage Android et fournir lien/titre/extrait autorisés. **Acceptation :** partage possible sans connecter WhatsApp, Instagram ou un autre compte social.

**FR-49 [S] — Accès direct.** Un lien ouvre le bon produit et sa variante/contexte si possible : APK installé → lien profond ; sinon page mobile de découverte envisagée. **Acceptation :** le visiteur n'atterrit pas par défaut sur la page d'accueil générale.

**FR-50 [S] — Informations actuelles.** Si prix/stock/promotion ont changé depuis la publication, la fiche affiche l'état courant et, si nécessaire, indique que les conditions partagées ont expiré. **Acceptation :** le produit vendu n'est pas présenté comme immédiatement achetable via un ancien lien.

**FR-51 [C/X] — Interdictions.** Pas de scraping social, lecture des messages personnels, publication automatique via API, profils de promoteurs rémunérés, liens d'affiliation commissionnés ou publicité payante intégrée présumée.

### 3.10. Après-vente, incidents, support

**FR-52 [S] — Dossier d'incident.** Une commande peut recevoir un incident documenté : catégorie, description, preuves pertinentes, parties autorisées, historique, statut, résolution. **Acceptation :** preuves et engagements restent retrouvables par les acteurs autorisés.

**FR-53 [S/B] — Issues.** Échange, correction, fourniture manquante, remboursement ou autre issue selon politique/loi/prestataire applicable. **Acceptation :** une promesse de remboursement financier n'est jamais affichée sans capacité effective.

**FR-54 [S] — État et délais.** Ouvert, en examen, réponse demandée, solution proposée, résolu, contesté ; rappels selon contexte. **Acceptation :** incident ouvert n'est pas caché parce que paiement est terminé.

**FR-55 [S] — Signalement catalogue/vendeur.** Avis et signalements modérés ; ne pas garantir l'authenticité par une note moyenne. **Acceptation :** le vendeur a un mécanisme de contestation et l'acheteur peut signaler une annonce problématique.

### 3.11. Intelligence contextuelle, analyse et opérations plateforme

**FR-56 [S] — Vue des prochaines actions.** Éléments explicitement liés à une opération : commande à confirmer, stock faible, demande pertinente, incident ouvert. **Acceptation :** chaque carte permet d'ouvrir le dossier correspondant.

**FR-57 [S] — Observations commerciales honnêtes.** Afficher ventes réelles, demandes satisfaites/non satisfaites, ruptures et origine connue/inconnue ; indiquer insuffisance de données. **Acceptation :** un clic social n'est pas présenté comme vente attribuée certaine.

**FR-58 [S] — Assistance par règles avant IA obligatoire.** Suggestions explicables, validées par l'utilisateur avant action engageante ; toute IA éventuelle doit avoir coût, consentement, garde-fous et solution de repli définis. **Acceptation :** désactiver l'IA n'empêche pas de consulter/commander un produit normalement.

**FR-59 [S/B] — Opérations plateforme.** Gestion catégories, signalements, périmètres pays, politiques, accès support, traces d'audit et restrictions d'offres. **Acceptation :** un opérateur ne peut modifier une transaction sans trace et permission.

**FR-60 [S] — Notifications proportionnées.** Commandes/échéances/incidents/demandes pertinentes ; préférences et limites anti-spam. **Acceptation :** l'acheteur n'est pas sollicité arbitrairement pour des produits qu'il n'a pas demandés.

### 3.12. Compléments de couverture D01/D02 : récurrence, marge et fidélisation

**FR-61 [S] — Besoins d'achat récurrents.** L'acheteur peut conserver une liste de besoins récurrents, leurs priorités, fréquences indicatives et achats réalisés, sans prélèvement automatique implicite. **Acceptation :** retrouver ses produits récurrents et leurs anciennes conditions ne crée pas de commande involontaire.

**FR-62 [S] — Budget d'achat indicatif.** L'acheteur peut préciser budget, périodes, devises et dépenses connues pour comparer prévision et achats enregistrés ; les paiements hors plateforme sont distingués. **Acceptation :** une dépense non enregistrée ou un taux de conversion absent n'est pas inventé comme montant exact.

**FR-63 [S] — Prix de revient et marge observée côté vendeur.** Coût d'approvisionnement déclaré, transport, frais pertinents, remises et ventes peuvent alimenter une estimation expliquée de marge par offre/commande. **Acceptation :** la marge s'affiche « incomplète » lorsqu'un coût essentiel n'est pas renseigné ; ne pas confondre marge et solde disponible.

**FR-64 [S] — Suivi client et fidélisation consentie.** Après achat, le commerçant peut retrouver l'historique autorisé, gérer une réclamation et proposer un suivi sans relances intrusives. **Acceptation :** préférence de contact respectée et aucun import/scraping automatique des conversations des réseaux sociaux.

**FR-65 [S] — Renouvellement de gamme éclairé.** Les observations de demandes répétées, offres expirées, ruptures et ventes peuvent être consultées pour examiner quoi réapprovisionner ou tester ; décision de commande laissée au vendeur. **Acceptation :** le système expose les données qui sous-tendent une suggestion plutôt que déclarer qu'un produit « va se vendre » avec certitude.

---

## 4. Objets métier et relations obligatoires

| Objet | Champs/relations minimales au niveau PRD | Invariant métier |
|---|---|---|
| Compte | identifiant, rôle(s), moyens de contact autorisés, pays/langue | L'utilisateur n'hérite pas des privilèges de toutes les boutiques. |
| Boutique | propriétaire, collaborateurs, pays/devises, conditions, statut | Une boutique peut continuer à enregistrer une vente externe. |
| Référence produit | catégorie, attributs communs, type physique/numérique | La référence n'est pas une offre d'un vendeur précis. |
| Offre / SKU | boutique, variante, prix, devise, conditions, pays, version, disponibilité | Les offres de vendeurs différents restent indépendantes. |
| Stock / mouvement | SKU, emplacement, quantité, motif, horodatage, auteur | Disponible et réservé ne doivent pas être consommés deux fois. |
| Besoin / demande | acheteur, critères, budget, zone, consentement, statut | La demande peut exister sans offre préalable. |
| Proposition | besoin/offre source, vendeur, conditions, validité, état | L'accord accepté est conservé en version. |
| Commande | parties, instantané, lignes, prix/frais, références d'accord | L'état paiement n'efface pas l'état exécution. |
| Paiement | commande, fournisseur/canal, référence externe, montant, devise, statut | Confirmé seulement selon preuve autorisée. |
| Exécution | type physique/numérique, obligation, jalons, preuve | Les modes de livraison sont distincts. |
| Droit numérique | commande, acheteur, fichier/version, licence, état | Un téléchargement raté ne supprime pas l'achat. |
| Commande fournisseur | commerçant acheteur, fournisseur, coût, délai, état | Distincte de la commande du client final. |
| Incident | transaction, motif, preuves, état, décisions, historique | Impossible de supprimer sans trace un incident pour « terminer » une vente. |
| Partage / origine | URL ciblée, offre, source connue si consentie, timestamps | Pas d'attribution inventée ni de profilage social implicite. |

**Règle de confidentialité :** une relation de données entre deux commandes ne rend pas publics les prix d'achat fournisseurs ou les données personnelles du client final.

---

## 5. Automates d'état — proposition de base

Ces transitions sont à préciser lors de l'étape architecture et de l'analyse réglementaire ; elles sont **distinctes**.

| Entité | États utiles proposés | Transitions / garde-fous |
|---|---|---|
| Offre | brouillon → publiée → suspendue/épuisée/archivée | Modifier une offre publiée crée une version de conditions, non une réécriture des commandes. |
| Demande | brouillon → active → propositions reçues → satisfaite/expirée/retirée | Une demande retirée n'accepte pas de propositions actives sans réactivation. |
| Proposition | brouillon → envoyée → acceptée/refusée/expirée/retirée | Expiration et acceptation concurrente vérifiées côté serveur. |
| Réservation | envisagée → active → convertie/annulée/expirée | Allocation atomique ; TTL paramétré ; éviter la libération abusive en présence d'un paiement en vérification. |
| Commande | créée → acceptée → en exécution → complétée/annulée/contestée | « Complétée » dépend de l'obligation, pas du seul paiement. |
| Paiement | non initié → en attente → confirmé/échoué/annulé/à examiner ; remboursement demandé → confirmé/refusé/échoué | Webhook/contrôle de référence par backend ; idempotence. |
| Physique | à préparer → prêt → remis au transporteur/retiré → réception déclarée/confirmée ou incident | Colis expédié ≠ reçu. |
| Numérique | en attente du paiement → droit accordé → délivré ; échec d'accès/incident | droit ≠ nombre de clics de téléchargement. |
| Incident | ouvert → en cours → solution proposée → résolu/contesté | Historique conservé et parties notifiées selon règles. |

**Cas hors séquence à préserver :** paiement tardif après expiration, remboursement partiel, livraison après réclamation, vente physique enregistrée hors ligne puis synchronisée, modification de variante à demande, commande fournisseur qui échoue. Aucune de ces situations ne doit produire silencieusement deux obligations contradictoires.

---

## 6. Parcours bout en bout et scénarios d'acceptation

### E2E-01 — Découverte sur réseau social → achat physique

1. Vendeur publie une offre avec stock et conditions ; partage son lien depuis le téléphone.
2. Acheteur sans APK ouvre le lien et retrouve l'offre précise ; l'app peut s'ouvrir directement si installée.
3. Il sélectionne variante ; le système réévalue prix/stock actuels.
4. Il accepte conditions, crée une commande, utilise un moyen de paiement réellement autorisé ou une modalité hors ligne déclarée.
5. Vendeur prépare ; acheteur reçoit et peut retrouver sa commande.

**Échec obligatoire :** lien ancien, prix changé, taille épuisée, abandon sans installation, paiement en attente.

### E2E-02 — Recherche infructueuse → proposition → achat

1. Recherche sans offre adéquate ; acheteur formule demande explicite.
2. Vendeurs concernés y répondent, éventuellement plusieurs.
3. Acheteur compare coût complet et validité ; accepte une proposition.
4. L'accord accepté est figé dans la commande ; les autres propositions reçoivent le traitement prévu sans créer d'autres achats.
5. La transaction continue vers paiement et exécution.

**Échec obligatoire :** demande expirée, réponses non pertinentes, proposition retirée juste avant acceptation, offre sur commande incertaine.

### E2E-03 — Commerçant achète chez un fournisseur pour servir son client

1. Client adresse sa demande au commerçant.
2. Commerçant indique que le produit doit être recherché/commandé ; consulte un fournisseur.
3. Il accepte ou non l'accord fournisseur **séparément** de son engagement client.
4. Après vérification des capacités, il fait une proposition au client ; l'acheteur accepte ou refuse.
5. Les deux commandes conservent leurs montants/parties/confidentialité distincts.

**Échec obligatoire :** fournisseur en rupture après acceptation client ; négociation de délai exige nouveau consentement.

### E2E-04 — Vente extérieure enregistrée

1. Vendeur réalise une vente physique ou issue d'un canal extérieur ; la saisit dans l'application.
2. SKU et stock correspondant sont mis à jour ; revenu vendeur est consigné avec origine distincte.
3. Les rapports n'en font pas une vente payée/attribuée par notre PSP ou notre marketplace.

**Échec obligatoire :** deux appareils déconnectés enregistrent simultanément le dernier stock → conflit détectable et résolution explicite, sans écrasement silencieux.

### E2E-05 — Produit numérique acheté depuis un autre pays

1. Créateur publie format, aperçu, licence, pays/canal éligible.
2. Acheteur voit l'offre et le flux de paiement autorisé pour sa configuration réelle.
3. Après confirmation authentique, un droit d'accès est généré ; le contenu est accessible.
4. Si l'accès échoue, le droit persiste et le support peut examiner le problème.

**Blocage :** aucune transaction numérique publique dans un corridor non vérifié ; ne pas confondre téléchargement du navigateur avec exemption de facturation Play.

### E2E-06 — Paiement confirmé, livraison manquante

Commande et paiement confirmés ; retard ou échec de remise ; incident lié ; historique des engagements ; résolution et remboursement éventuel **selon capacités effectives**.

### E2E-07 — Dernier exemplaire réservé par deux acheteurs

Deux demandes concurrentes → une réservation confirmée au maximum sur le même dernier SKU disponible ; le perdant voit « indisponible » ou une alternative ; aucun double prélèvement logique en retries.

---

## 7. Politique économique et matrice paiement / territoire

### 7.1. Une matrice de vente, pas un « paiement universel »

À construire pour chaque couple **pays de la boutique / pays de l'acheteur**, canal **APK Play / web mobile / autre distribution légalement pertinente**, catégorie **physique / téléchargement numérique / contenu personnalisé / abonnement fonctionnalités vendeur**, devise, moyen de collecte, reversement, frais, responsable fiscal, conditions de remboursement et mode d'exécution.

| Achat | Besoin fonctionnel | Dépendance à lever avant activation |
|---|---|---|
| Produit matériel | Montant final, frais de remise, confirmation PSP/alternative autorisée | Prestataire/corridor/reversement/remboursement/CGV. |
| Fichier numérique accessible dans APK Play | Licence, droit d'accès, authentification achat | Analyse précise des règles Google Play pour achats numériques, exceptions/programmes et modèle multi-vendeur ; politique PSP compatible. |
| Production numérique personnalisée | Devis, étapes de réalisation, droit livré, litiges | Nature juridique exacte de la prestation, règles de facturation du canal, responsabilité. |
| Abonnement vendeur à fonctionnalités du logiciel Android | Accès et droits du plan | Règles de facturation de fonctionnalités numériques intégrées et conditions du marché. |
| Vente extérieure enregistrée | Tracer revenu vendeur et état de paiement déclaré/contrôlé | Ne pas classer comme revenu collecté par la plateforme. |

**Sources officielles à revalider lors de l'architecture :** Google Play Payments Policy `https://support.google.com/googleplay/android-developer/answer/9858738?hl=fr` ; FedaPay tarifs `https://www.fedapay.com/pricing` ; documentation historique des sous-comptes `https://docs-v1.fedapay.com/sous-comptes`. Aucune de ces sources ne vaut acceptation contractuelle de notre modèle particulier.

### 7.2. Abonnement, commission, formule hybride

Le PRD permet d'enregistrer un tarif et une source de revenu **si et seulement si** le fondateur retient ultérieurement le modèle et son implémentation est conforme au canal. Aucun pourcentage ni montant n'est approuvé dans ce document.

Indicateurs économiques à relever par flux : prix client, revenu vendeur, revenu plateforme, frais PSP, remboursements, coût de livraison ou de fourniture, support, stockage, IA le cas échéant, fiscalité selon responsabilités, acquisition vendeur/acheteur. **Revenu brut marchand ≠ bénéfice plateforme.**

---

## 8. Contraintes non fonctionnelles — cibles candidates, à confirmer avec les tests et le terrain

**NFR-01 — Android réel.** APK installable, gestes/safe areas/clavier testés sur téléphone ; aucune dépendance obligatoire à un navigateur de bureau pour les opérations métier de l'app.

**NFR-02 — Réseau variable.** États de chargement explicites, reprise après coupure, sauvegarde prudente des brouillons, formats d'images adaptés, consommation de données limitée. Aucune vente « hors ligne » ne doit promettre un stock serveur non synchronisé comme confirmé.

**NFR-03 — Sécurité.** Contrôles d'accès côté serveur, secrets prestataires hors APK, chiffrement transport/stockage adapté, journaux des actions sensibles, liens numériques temporisés, sauvegardes et procédure de reprise.

**NFR-04 — Intégrité monétaire.** Montants représentés sans flottants binaires ; devise attachée à toute somme ; rapprochement des callbacks prestataire ; idempotence et contrôle anti-rejeu.

**NFR-05 — Cohérence de stock.** Contrôle concurrent serveur, réservation atomique, reconciliation des ventes externes et gestion des conflits de synchronisation.

**NFR-06 [C] — Accessibilité et bilinguisme effectif FR/EN.** Les parcours acheteur, vendeur et opérateur, pages d’offres partageables, validations, erreurs, états de transaction, notifications transactionnelles, reçus et supports rédigés par la plateforme doivent fonctionner en **français et en anglais**, avec choix explicite de langue et préférence mémorisée. Libellés simples, navigation clavier/lecteur d’écran là où applicable, formats localisés de devise/date/numéro ; aucune langue ou devise unique codée en dur. Les textes libres de vendeurs et acheteurs ne sont pas réputés automatiquement traduits. Voir FR-66 à FR-70 et annexe B.

**NFR-07 — Vie privée.** Consentement et limitation des champs de demande, permissions explicites pour partager données, séparation informations B2B/B2C, durée de conservation définie selon obligations ; pas de scraping social.

**NFR-08 — Performance.** Mesurer sur Android milieu de gamme et réseau mobile dégradé : temps de première fiche, recherche, confirmation commande, reprise après erreur, poids d'écran. Fixer les seuils chiffrés après benchmark ; ne pas inventer un SLA.

**NFR-09 — Traçabilité.** Les preuves techniques rendent observables qui a changé prix, stock, état de paiement et commande, à quelle heure, selon quelle référence externe.

**NFR-10 — Qualité d'exploitation.** Supervision des paiements en anomalie, droits numériques non délivrés, transactions incohérentes, incidents ouverts et limites des PSP. Un signal d'erreur doit mener à une action opérateur, pas à un échec silencieux.

---

## 9. Instrumentation et validation produit

| Résultat recherché | Événement ou mesure à prévoir | Prudence d'interprétation |
|---|---|---|
| Activation vendeur | boutique créée ; premier produit ; première vente réelle enregistrée | Compte créé seul ne vaut pas adoption. |
| Utilité gestion | vendeurs revenant saisir stock, ventes, commandes | Distinguer activité forcée de valeur volontaire. |
| Entrée sociale | offre partagée volontairement ; arrivée sur lien ; action sur produit | Pas d'attribution universelle des vues sur réseaux. |
| Besoins non satisfaits | recherche sans résultat, demande réellement publiée, réponses exploitables | Demande publiée ne vaut pas intention certaine d'achat. |
| Conversion commerciale | proposition reçue/acceptée, commande, paiement confirmé, remise | Garder chaque étape distincte. |
| Fiabilité | double réservation empêchée, litige, remboursement, accès numérique échoué | Les incidents peuvent augmenter quand la plateforme améliore leur visibilité. |
| Viabilité | revenu plateforme par vendeur et transaction moins coûts imputables | Ne pas utiliser GMV comme bénéfice. |

**Étude terrain non réalisée à date :** entretiens acheteurs/vendeurs/créateurs, observation de transactions récentes, prototypes exécutés par les personnes concernées, vérification de prix explicites et tests de réutilisation. Le PRD prévoit leur traçage ; il n'invente pas leurs résultats.

---

## 10. Critères de sortie / tests de bout en bout avant démonstration et avant mise en production

### 10.1. Dossier fonctionnel et démonstration

- [ ] E2E-01 : lien social ouvre l'offre à jour ; APK installé/non installé gérés comme spécifié.
- [ ] E2E-02 : demande sans offre → propositions de plusieurs vendeurs → accord figé → commande.
- [ ] E2E-03 : achat fournisseur et vente client demeurent séparés.
- [ ] E2E-04 : vente physique met à jour le bon stock sans fausse attribution ni faux encaissement plateforme.
- [ ] E2E-05 : droits numériques et erreurs d'accès couverts par un flux de paiement réellement autorisé.
- [ ] E2E-06 : payé ≠ livré ; l'incident ne disparaît pas.
- [ ] E2E-07 : dernier exemplaire ne peut être réservé deux fois.
- [ ] Permissions : vendeur, acheteur et opérateur ne voient que leurs données nécessaires.
- [ ] Aucune affiliation rémunérée ou connexion API sociale ajoutée implicitement.

### 10.2. Portes de production conditionnelles — impossibles à déclarer « PASS » par rédaction seule

- [ ] Modèle juridique : qui vend, facture, reçoit, rembourse, assume litiges et fiscalité par flux ?
- [ ] PSP : pays, devises, sandbox, sous-comptes, reversions, frais, remboursements, annulations et gestion des paiements tardifs démontrés.
- [ ] Produits numériques : classification et règles Google Play vérifiées **pour l'expérience exacte**, canal et pays ; licences/droit d'accès opérationnels.
- [ ] Transport/remise : modes réellement proposés, coûts, délais, responsabilité et preuves.
- [ ] Vendeurs réels : vérifications, catégories admissibles, modération, sécurité et support prêts.
- [ ] Étude commerciale : intérêt et tarification confrontés à des actes réels, pas à l'enthousiasme du fondateur.
- [ ] Tests Android réels : sécurité, mauvaise connexion, paiement double, stock concurrent et récupération après panne.

**Important :** on peut produire la maquette et développer des flux simulés bien identifiés pour démonstration avant de satisfaire toutes les portes de production, mais aucun paiement fictif ne peut être présenté comme transaction réellement encaissée.

---

## 11. Décisions ouvertes à arbitrer — registre PRD initial (voir revue détaillée en annexe A)

| ID | Sujet | Proposition / éventail d'options | Statut et impact |
|---|---|---|---|
| O-01 | Nom et identité de marque | À définir lors du design produit | Ouvert ; non bloquant pour la spécification. |
| O-02 | Premier marché opérationnel et corridors | Sélection selon prestataires, logistique, règles, demande testée | B pour lancement par corridor ; vision mondiale intacte. |
| O-03 | Mode de commercialisation | Abonnement vendeur, commission, hybride, autre | T/B ; tarifs non décidés. |
| O-04 | Vendeur légal / marketplace | Intermédiaire, distributeur, autre selon flux | B juridique, fiscal et support. |
| O-05 | Paiements physiques | PSP(s), modalités et pays réellement admissibles | B pour encaisser en production. |
| O-06 | Paiements numériques Android | Classification article/service, programmes régionaux, canal, taxes | B avant activation vente numérique. |
| O-07 | Réservations | Durée, conditions, arrhes, expiration en paiement différé | S à tester ; mécanisme atomique exigé si confirmé. |
| O-08 | Retours et remboursements | Responsabilités et délais par pays/catégorie | B pour promesse/activation de remboursement. |
| O-09 | Page web mobile d'offre | Degré d'autonomie, visiteur/compte/checkout | S à arbitrer ; APK produit principal. |
| O-10 | Langues et devises initiales | **FR et EN obligatoires** ; devises et territoires configurables par marché/flux | **Langues : décision confirmée (C)** ; devises, paiement et pays d’activation restent ouverts. |
| O-11 | Intelligence IA | Cas d'usage précis, coût, consentement et fallback | S ; ne pas construire « chatbot » décoratif. |
| O-12 | Collaborateurs et rôles professionnels | Capacité et permissions souhaitées | S, dépend des vendeurs réels. |
| O-13 | Catégories commerciales admissibles | Physique, numérique, mixtes, droits d'auteur, signalements | B catalogue/modération. |
| O-14 | Livraison | Vendeur, retrait, partenaires, responsabilités par zone | B avant promesse de livraison spécifique. |

**Règle de gestion :** lorsqu'une décision est prise, renseigner *qui l'a acceptée, quand, la preuve et quelles exigences elle modifie*. Une hypothèse ne devient pas « confirmée » simplement parce qu'elle figure ici.

---

## 12. Traçabilité vers l'Atlas et le dossier d'idéation

| Source Atlas | Activités couvertes par le PRD | Modules / FR |
|---|---|---|
| D01-A01 choisir gamme ; D01-A02 fournisseurs ; D01-A03 commander/recevoir stock | Offre, approvisionnement, décision commerciale | FR-06 à 17 ; FR-56 à 58 |
| D01-A04 prix ; D01-A05 publication | Prix, variante, fiche et partage | FR-06 à 11 ; FR-48 à 50 |
| D01-A06 réponse/conseil ; D01-A07 commande | Contexte, proposition, accord, réservation | FR-23 à 31 |
| D01-A08 encaisser ; D01-A09 livraison | États paiement/exécution | FR-31 à 41 |
| D01-A10 retours/fidélisation | Dossier d'incident, suite commerciale | FR-52 à 58 |
| D02-A01 besoin ; D02-A02 recherche | Recherche, demande, critères | FR-18 à 24 |
| D02-A03 comparer ; D02-A04 vérifier | Coût total, informations vérifiables, conditions | FR-03, 09, 18, 19, 29 |
| D02-A05 négocier ; D02-A06 payer | Proposition, réservation, paiement | FR-23 à 37 |
| D02-A07 réception ; D02-A08 achats récurrents | Exécution, historique, listes et budgets d'achats récurrents | FR-38 à 47, FR-52 à 54, FR-61 à 62 |

**Signal de couverture honnête :** D02-A08 est désormais couvert fonctionnellement par FR-61/62 sans inventer une application bancaire séparée ; D01-A01/A04/A10 sont complétés par FR-63 à 65. Le détail de la planification, de la marge et du suivi consentant doit être ajusté aux usages terrain. La totalité des 72 frictions potentielles n'est pas « validée » du seul fait que le PRD couvre les 18 activités.

---

## 13. Suite de la feuille de route

1. **Revue et correction du présent PRD** : examiner les points O-01 à O-14, les règles structurantes et la couverture Atlas ; ne pas rediscuter l'idéation entière.
2. **Étape 4 — architecture/faisabilité** : décisions Android/backend/stockage, états et concurrence, preuves de paiement physiques/numériques, sécurité et droits numériques ; prototypage ciblé des dépendances bloquantes.
3. **Étape 5 — UX/UI et plan de construction** : arborescence, écrans, maquettes, états normaux/erreurs, tests utilisateur, plan de développement et qualité.
4. **Validation terrain en parallèle** : ne pas afficher « marché validé » ni « prix acceptés » avant des observations et paiements/engagements réels.

**Point de reprise exact :** réviser ce PRD candidat, puis produire ses diagrammes de flux et la matrice de décision FR ↔ écran ↔ entité ↔ test avant l'architecture. Le dossier d'idéation v0.9 reste inchangé comme archive de raisonnement et de décisions ; le présent document est le livrable de l'étape 3, non une annexe cachée.

---

## Sources documentaires et notes de conformité

- Source interne : `AI_Foundry_D01_D02_Analyse_Commerce_Achat_Vente_V0_9.md`, annexes D, K, L, M, N. Les affirmations marquées **C** correspondent à ses décisions explicites ; les mécanismes précédemment hypothétiques restent **S** dans le présent PRD.
- Atlas : `Atlas_AI_Foundry_V4_48_Domaines_Premium.html`, D01, D02 ; contrôle des 18 intitulés d'activités par `Cartographie_36_domaines_activites_actions_frictions.md`.
- Google Play, « Paiements », https://support.google.com/googleplay/android-developer/answer/9858738?hl=fr — règles et exceptions évolutives à vérifier pour chaque flux.
- FedaPay, « Tarifs », https://www.fedapay.com/pricing — tarifs publics, non contrat ni couverture garantie de notre modèle.
- FedaPay, « Sous-comptes », https://docs-v1.fedapay.com/sous-comptes — documentation historique, modalités actuelles à confirmer contractuellement.
- Commission européenne, OSS / TVA e-commerce, https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en — exemple de cadre fiscal pouvant être pertinent selon les transactions ; ne constitue pas un avis juridique.

---

# ANNEXE A — REVUE CIBLÉE DU PRD 0.1 : 14 ARBITRAGES, CORRECTIONS ET PORTES DE FAISABILITÉ

**Date :** 25 septembre 2026.  
**Statut :** revue de l'assistant, **propositions de spécification** à confirmer par le fondateur ; elle ne remplace aucune décision explicitement prise dans le dossier d'idéation.  
**Sources internes :** PRD 0.1, sections 0–13 ; dossier D01+D02 v0.9, annexes D, I, K, L, M, N.  
**Objectif :** faire avancer l'étape 3 sans inventer de validation de marché, de contrat PSP, de couverture pays ni de conformité Play.

## A.1. Conclusion de la revue

Le PRD décrit correctement le cœur du produit : commerce physique et numérique ; acheteur et commerçant dans une même plateforme Android ; besoin → offre/proposition → commande → paiement distinct de l'exécution ; vente externe et approvisionnement ; partage social **sans affiliation rémunérée ni API sociales** ; possibilité internationale sans faux paiement universel. Les 65 exigences sont une bonne base, mais leur présence n'équivaut pas à leur approbation par le fondateur, ni à un résultat de tests.

**Correction de méthode :** classer les 14 points ouverts dans trois groupes :

- **A — Règle de conception à adopter éventuellement dans le PRD :** nous pouvons proposer une option par défaut testable, sans en faire une décision confirmée.
- **F — Porte de faisabilité / conformité :** une exigence existe, mais un flux financier, contractuel, juridique ou opérationnel ne doit pas être activé sans preuve.
- **M — Hypothèse marché / produit :** conserver plusieurs options jusqu'à observations, essais et arbitrage du fondateur.

Les options de test ne sont **pas** des suppressions de modules pour fabriquer une « coquille vide ». Les pays où un flux sera *commercialement activable* peuvent différer de la portée internationale des comptes, catalogues et produits.

## A.2. Revue individualisée des décisions O-01 à O-14

| Réf. | Règle recommandée pour poursuivre la conception | Statut | Preuve / arbitrage encore requis |
|---|---|---|---|
| **O-01 Marque** | Garder « Plateforme de commerce actif » comme **nom de travail**, sans engager architecture, domaine ou design final. | A | Choix du nom, disponibilité et identité lors de l'étape UX/UI ; le PRD peut avancer. |
| **O-02 Marché opérationnel** | Modèle **international**, mais activation par **couples pays vendeur/acheteur + moyen de paiement + catégorie + mode de fourniture**. Le Bénin peut être un **terrain de recherche candidat**, pas un plafond géographique ni un corridor déclaré actif. | F/M | Marché de démarrage retenu par fondateur après premiers entretiens et PSP/logistique/conformité confirmés. |
| **O-03 Monétisation** | Préserver deux sources de valeur distinctes : **outil vendeur** (abonnement professionnel à tester) et **transaction marketplace** (commission à tester). Ne jamais prélever implicitement une commission de marketplace sur les ventes externes seulement enregistrées. Le modèle hybride est une **hypothèse**, pas un tarif adopté. | M/F | Prix, seuils, coûts unitaires, modalités Play pour abonnement vendeur, tests de disposition à payer. |
| **O-04 Vendeur légal / responsabilité** | Décrire chaque vente avec **identité du vendeur contractuel** et responsabilités déclarées ; la plateforme assure l'intermédiation et les outils selon son rôle effectivement adopté, sans se proclamer dépositaire des fonds ni garant universel. | F | Validation locale juridique, fiscale, CGV, procédure litiges et relation PSP par corridor. |
| **O-05 Paiement physique** | Séparer **paiement en ligne authentifié par PSP**, **espèces/collecte vendeur déclarées** et **paiement en attente** ; conserver des libellés distincts. Aucun screenshot acheteur ne confirme un paiement PSP. | A/F | Prestataires, collecte, reversements, refunds, sandbox et termes contractuels confirmés. |
| **O-06 Paiement numérique Android** | Modéliser produit physique, fichier, prestation numérique personnalisée, produit mixte et abonnement vendeur comme flux classés séparément. Aucun lien web présumé contourner les conditions Play. Ne montrer un checkout que si canal/pays/catégorie réellement autorisé. | F | Examen du parcours **exact** pour l'app distribuée sur Play, régime de facturation admissible, prestataire, taxes et reversements multi-vendeurs. |
| **O-07 Réservation** | Réservation serveur **atomique par SKU**, avec durée **configurable**, expiration et effet du paiement en attente. Aucun délai fixe inventé ni réservation garantie si stock hors ligne non synchronisé. | A/F technique | Prototype concurrence et cas paiement tardif ; décider paramètres selon catégories et paiements. |
| **O-08 Retours / remboursements** | Afficher politique et vendeur responsable de chaque offre ; dossier de réclamation ; remboursement seulement « confirmé » après preuve PSP/registre approprié, sinon « demandé/en cours/à examiner ». | A/F | Règles de protection consommateur, modalités PSP, consentement et coûts, responsabilités support. |
| **O-09 Page web de l'offre** | **Page mobile légère de découverte** avec produit, variante si possible, prix et état actuels ; application Android ouvre le contenu exact via lien vérifié ; parcours sans APK ne doit pas être une impasse. Ne pas décider un web app complet ou checkout navigateur par défaut. | A/M/F | Décider jusqu'où un visiteur peut demander/acheter sans installation et selon canaux de paiement autorisés. |
| **O-10 Langues / devises** | **Décision confirmée : fonctionnement complet de l’app en français ET en anglais** ; préférence de langue indépendante du pays et de la devise, autres langues extensibles ; montant dans **devise de l’offre**, conversion seulement si source et date explicites. | **C pour FR/EN** ; A/M pour devises et autres langues | Traductions FR/EN, scénarios bilingues et terminologie commerciale à tester ; devises/corridors et éventuelles langues supplémentaires demeurent à vérifier. |
| **O-11 IA** | Pas de chatbot décoratif imposé. Première assistance **par règles fiables** : besoin incomplet, stock faible, demande pertinente, commande en attente ; IA candidate pour reformuler recherches/descriptions, jamais certifier stock, compatibilité ou paiement. | A/M | Cas utile observé, coût par tâche, consentement, évaluation qualité et voie sans IA. |
| **O-12 Collaborateurs** | Boutique distincte du compte ; modèle de permissions compatible plusieurs collaborateurs. Actions financières, modification prix/stock et données personnelles sont autorisées par rôle et auditées. | A/M | Profils de permissions précis à confronter aux vendeurs seuls/équipes ; tests accès croisés. |
| **O-13 Catégories** | Catégories physiques/numériques/mixtes paramétrables ; exiger propriété/licence des contenus, signalement et modération ; ne pas présumer qu'une catégorie est légale, assurable ou encaissable dans tous les pays. | A/F | Catalogue admissible + règles PSP/Play/droit local, signalement et preuve de droits numériques. |
| **O-14 Livraison** | Proposer **retrait vendeur / remise vendeur / livraison assurée par vendeur ou partenaire déclaré** selon offre ; ne pas promettre une flotte appartenant à la plateforme. États et preuves distincts « expédié » / « reçu ». | A/F | Couverture, frais, assurance, zones, responsabilité perte et délai avant promesse publique. |

**Conséquence immédiate :** le fondateur peut valider ou corriger les règles A, tandis que les flux F restent sous portes de production et que les paramètres M sont testés. Aucune catégorie ne doit être rebaptisée « approuvée » sans son accord explicite.

## A.3. Huit corrections fonctionnelles issues de la revue croisée

Ces points complètent FR-01 à FR-65 et ne les remplacent pas :

**C-01 — Paiements déclarés et paiements attestés.** La vente cash enregistrée par le commerçant a un état « encaissé déclaré par vendeur » : ce n'est **pas** un encaissement vérifié par le PSP de la plateforme. Une capture d'écran acheteur ne confirme pas un paiement numérique. Un remboursement « demandé » n'est pas « exécuté ».

**C-02 — Séparer les montants par vendeur et par obligation.** Si un panier regroupe plusieurs vendeurs ou des biens physiques et numériques, conserver sous-commandes, lignes, obligations, frais, bénéficiaires et règles de remboursement distincts. L'acceptation d'un paiement multi-vendeur dépend du prestataire et du statut juridique ; pas de « pot commun » implicite.

**C-03 — Demandes avec plusieurs réponses.** Les propositions concurrentes restent indépendantes. Si l'acheteur accepte une proposition pour toute la quantité demandée, notifier le nouveau statut aux autres selon les règles ; si besoin partiellement satisfait, conserver explicitement la quantité restante. Ne pas accepter automatiquement un deuxième achat pour le même besoin.

**C-04 — Paiement tardif après expiration de réservation.** Ne pas libérer sans examen un article si le prestataire indique paiement en cours ; ne pas rétablir le stock au prix d'un double engagement. Si paiement arrive trop tard et stock attribué ailleurs, ouvrir un cas de correction/remboursement selon règles réelles ; ne jamais marquer un colis expédié fictivement.

**C-05 — Vente externe et mode hors connexion.** Autoriser brouillons/enregistrements locaux prudents si retenu ; jamais présenter une vente hors ligne sur plusieurs appareils comme stock serveur garanti tant que la synchronisation et les conflits ne sont pas résolus. Prévoir ajustement avec motif et audit.

**C-06 — Produit numérique : droits distincts des liens et des fichiers.** L'achat confirmé donne un droit selon licence ; le lien temporaire peut expirer sans effacer le droit. Prévoir retrait d'un produit pour violation de droits, chargeback ou litige avec examen des conséquences contractuelles sur les acheteurs existants.

**C-07 — Promesses limitées à ce qui est vérifié.** « identité vérifiée » ≠ « produit authentique » ; « disponible selon vendeur » ≠ « stock certifié » ; « remis au transporteur » ≠ « reçu » ; une recherche d'image ou une IA ne certifie pas une compatibilité sans preuve suffisante.

**C-08 — Protection contre abus de demandes et promotions.** Limites raisonnables, signalement, traitement des faux vendeurs/offres, confidentialité des demandes, opt-in de contact ; pas de scraping/import automatique de messages ni de collecte de listes personnelles sur réseaux sociaux.

## A.4. Contrats de flux pour les trois risques structurants

### Flux 1 — Offre partagée depuis un réseau social

**Entrée :** une URL de notre propre domaine associée à l'offre et éventuellement à sa variante. **Action :** ouvrir l'application Android si lien vérifié et app installée, sinon ouvrir la fiche web légère à jour. **Contrôles :** produit/variante, disponibilité, prix, frais et conditions revalidés à l'engagement ; offre retirée ≠ page d'accueil générique ; aucune API sociale. **Test :** ancien message dont prix et stock ont changé, ouverture avec/sans APK.

### Flux 2 — Recherche infructueuse → demande → propositions → commande

**Entrée :** critères de recherche et choix explicite de demander. **Action :** publier avec visibilité/consentement choisis ; vendeur concerné répond ; acheteur compare et accepte. **Contrôles :** proposition valable et quantité restante, instantané de l'accord, autres propositions non transformées en commandes, annulation/expiration traçable. **Test :** deux propositions acceptées presque simultanément, retrait de demande et satisfaction partielle.

### Flux 3 — Commande → paiement → exécution ou incident

**Entrée :** accord accepté, panier/lignes/parties fixés. **Action :** tentative de paiement compatible avec le flux réel ; état PSP ou collecte vendeur ; fourniture physique ou droit numérique distinct ; suivi et incident. **Contrôles :** idempotence, paiement tardif, quantité atomique, droits numériques persistants, responsabilité remboursement connue. **Test :** double tap + webhook répété ; paiement payé sans livraison ; fichier payé dont le lien expire ; remboursement échoué.

## A.5. Ce qu'il faut encore recevoir comme preuve sans immobiliser tout le projet

| Preuve recherchée | Travail possible immédiatement | Ce qui ne peut pas être déclaré approuvé avant preuve |
|---|---|---|
| Besoin et adoption | Prototype UX et entretiens sur ventes/achats réels ; parcours de demandes et vendeurs | Rétention, volonté de payer, taux de conversion et « marché validé ». |
| Choix du marché d'amorçage | Comparaison de corridors, moyens de remise et catégorie | Activation internationale universelle ; premier pays arrêté sans fondateur. |
| Monétisation | Calcul coûts par vente/vendeur, simulation abonnement/commission | Tarif approuvé, marge positive ou prêt à payer observé. |
| Paiements et rôle contractuel | Diagramme flux de fonds et questions écrites aux PSP/juriste | Paiement, reversement, remboursement automatique en production. |
| Play pour numérique | Matrice précise « item × lieu d'usage × canal × territoire × rôle vendeur » | Checkout numérique Android et abonnement vendeur activés avant conformité. |
| Fiabilité technique | Tests réservation atomique, reprise de paiement, entitlement numérique | Statut « fiable » sans tests sur vraie stack et vrais appareils. |

## A.6. Passage à l'étape 4 : livrables qui doivent sortir de l'architecture

Sans sélectionner ici arbitrairement un framework ou un PSP, l'architecture doit livrer : (1) diagramme des composants et responsabilité Android/web/serveur ; (2) modèle de données et frontières boutique/compte/commande fournisseur ; (3) automates d'états et événements avec concurrence/idempotence ; (4) matrice paiement et justificatifs de conformité ; (5) architecture stockage et droits numériques ; (6) modèle permissions/support/journaux ; (7) design de liens profonds vérifiés et page web d'offre ; (8) scénarios de reprise hors connexion ; (9) estimation des coûts opérationnels ; (10) tests de faisabilité des flux bloquants.

**Sortie de revue PRD :** le document est désormais **prêt pour la préparation de l'architecture sous réserve des arbitrages fondateur sur les options A/M et des portes F de production**, pas « PRD définitif approuvé », « rentabilité démontrée » ou « intégrations de paiements opérationnelles ».

### Références publiques à revérifier au moment d'implémenter

- Google Play, Politique de paiements : https://support.google.com/googleplay/android-developer/answer/9858738?hl=fr (achat physique et achats numériques, exemptions/programmes selon cas exact).
- Android Developers, About App Links : https://developer.android.com/training/app-links/about ; Verify App Links : https://developer.android.com/training/app-links/verify-applinks (lien vérifié et page web du même domaine).


---

# ANNEXE B — DÉCISION CONFIRMÉE : FONCTIONNEMENT BILINGUE FRANÇAIS / ANGLAIS

**Date :** 25 septembre 2026.  
**Source :** instruction explicite du fondateur : « l’app devra être fonctionnel en français et anglais. Forcément les deux langues sont nos ouvertures sur plusieurs monde. Donc ça doit être vraiment appuyer ».  
**Statut :** **C — décision produit confirmée.** Cette annexe prévaut sur les anciennes mentions de FR/EN comme « candidats », sans modifier les autres arbitrages ouverts. **Français et anglais : obligation fonctionnelle ; autres langues : possibilité future, non exigence confirmée.**

## B.1. Portée réelle de l’obligation

1. L’application Android dispose d’interfaces acheteur et commerçant utilisables en français et en anglais, y compris création de compte, boutique, publication, stock, recherche, demande, négociation structurée, proposition, commande, paiement, livraison/remise, produits numériques, incident et support proposé par la plateforme.
2. Les points d’entrée web mobiles envisagés (fiche produit/boutique, états d’offre et erreurs) respectent la langue choisie lorsqu’elle est connue et proposent un moyen clair de la changer ; le fonctionnement sans APK n’est pas artificiellement uniquement francophone.
3. Notifications, confirmations, états de paiement, reçus produits par notre système, messages transactionnels et contenus éditoriaux obligatoires de la plateforme disposent des deux versions lorsqu’ils existent. Aucun parcours critique ne comporte de texte système non traduit ; ne jamais masquer une information contractuelle faute de traduction.
4. Le choix de langue dépend de la préférence de l’utilisateur, **pas du pays, de la monnaie ou de la langue du téléphone**. La langue détectée du téléphone peut proposer un défaut ; l’utilisateur peut basculer FR ↔ EN depuis les deux espaces, à tout moment, sans perdre son travail ni changer ses montants.
5. Les objets métier sont indépendants de la langue : références de produits, identifiants, prix, quantité, devise, états, horodatages et conditions acceptées ne changent pas lors d’une bascule d’interface. Les montants ne sont pas convertis parce que l’utilisateur passe de FR à EN.
6. **Frontière à ne pas masquer :** la disponibilité de l’interface en deux langues ne constitue ni traduction automatique de chaque description libre publiée par un vendeur ni garantie qu’une conversation entre deux personnes parlant des langues différentes sera traduite. La traduction facultative des contenus utilisateurs peut être évaluée séparément, avec indication claire de l’original et des limites d’une traduction. L’interface bilingue demeure obligatoire même si aucun service de traduction IA n’est installé.
7. Pour favoriser la découverte entre langues, prévoir des champs structurés de catégories, caractéristiques, variantes et états avec identifiants indépendants de la langue et libellés localisés. La recherche FR↔EN sur texte libre est une capacité candidate à spécifier/tester, non une promesse de traduction parfaite de toutes les annonces.
8. Conditions de vente, licences numériques, consignes de sécurité, retour et remboursement : l’utilisateur doit comprendre **la version effectivement présentée et acceptée**. Conserver la langue et la version du texte contractuel accepté ; toute traduction juridiquement déterminante nécessite une revue adaptée aux marchés opérés.

## B.2. Exigences fonctionnelles ajoutées au PRD v0.3

| ID | Exigence | Critère d’acceptation |
|---|---|---|
| **FR-66 [C]** | Sélecteur FR / EN disponible dans les espaces acheteur, vendeur et paramètres ; préférence liée au compte lorsque connecté et choix utilisable en visiteur lorsque pertinent. | Un utilisateur peut changer la langue sans devoir changer de compte, de pays ou de devise ; préférence conservée après reconnexion selon le mode d’authentification. |
| **FR-67 [C]** | Localisation complète des textes appartenant à la plateforme pour les flux essentiels : formulaires, erreurs, confirmations, statuts et notifications, contenus de support intégrés, fiches web de partage. | Les scénarios E2E-01 à E2E-07 peuvent être exécutés intégralement en FR puis en EN, y compris chacun de leurs cas d’échec, sans retour involontaire à une autre langue. |
| **FR-68 [C]** | Structure de données localisable : clés pour catégories, caractéristiques et états ; champs localisés pour contenus éditoriaux du système ; texte utilisateur conservé dans sa langue d’origine. | Une offre et sa commande conservent même identifiant, prix, variante et engagement après changement d’interface ; les contenus libres ne sont pas présentés comme automatiquement traduits. |
| **FR-69 [C]** | Affichage des documents/conditions contractuelles ou licences selon langue proposée, avec traçabilité de la version et de la langue acceptées. | Une contestation permet de retrouver exactement les conditions présentées lors de l’acceptation, sans remplacement rétroactif par une traduction éditée ultérieurement. |
| **FR-70 [C]** | Parcours de partage et d’entrée mobile bilingues : page d’offre actuelle, disponibilité, conditions et chemin de poursuite dans la langue choisie. | Depuis le même lien partagé, un visiteur FR et un visiteur EN accèdent à la même offre en voyant l’interface dans leur langue et les mêmes prix/états métier. |

**NFR-06, O-10 et la matrice des orientations du §0.2 sont mis à jour dans le corps du PRD.** Les exigences FR-01 à FR-65 et les corrections de l’annexe A restent conservées.

## B.3. Vérification qualité à prévoir avant validation d’un lot fonctionnel

- Établir une couverture FR/EN par écran et par état : normal, vide, chargement, erreur, paiement en attente, stock épuisé, remboursement en traitement et droit numérique inaccessible.
- Tester les deux langues sur Android réel, y compris longueur des libellés, retours à la ligne, boutons, lecteurs d’écran et claviers ; vérifier également les fiches ouvertes dans un navigateur mobile.
- Tester une session dans laquelle vendeur et acheteur utilisent **des langues d’interface différentes** : même offre/commande et mêmes engagements, sans supposer que leurs messages libres sont traduits.
- Relire par des locuteurs compétents la terminologie métier (réservation, acompte, commande, livraison, licence, remboursement) et les informations contractuelles applicables.
- Bloquer la clôture fonctionnelle d’un parcours dont une information système critique manque dans l’une des deux langues ; ne pas bloquer le fonctionnement de base sur une traduction IA non retenue.

## B.4. Journal des changements v0.3 et reprise

| Élément | État avant | État après |
|---|---|---|
| FR/EN | Candidats à validation dans NFR-06 et O-10 | **Obligatoires et confirmés par le fondateur** |
| Devises, pays de paiement | À vérifier | **Toujours à vérifier**, sans confusion avec le choix de langue |
| Traduction de textes libres | Non définie | **Non présumée**, extension distincte à spécifier si souhaitée |
| PRD complet | Candidat, 65 FR + revue de 14 arbitrages | Candidat, **70 FR**, dont FR-66 à 70 reflètent une instruction explicitement confirmée |

**Point de reprise :** poursuivre l’architecture et la faisabilité technique en intégrant l’internationalisation FR/EN dès la structure applicative et les écrans. Le PRD reste candidat dans son ensemble : la décision linguistique ne transforme pas les autres règles proposées en décisions approuvées et ne valide ni PSP, ni prix, ni corridors commerciaux.


---

# ANNEXE C — QUATRE POINTS DE CONCEPTION SÉCURISÉS AVANT L'ARCHITECTURE

**Date :** 25 septembre 2026  
**Déclencheur :** le fondateur demande à l’assistant d’apporter des solutions de conception complètes et de cesser de lui renvoyer les arbitrages techniques ordinaires.  
**Nature du document :** propositions de référence pour concevoir et tester l’application, sans prétendre qu’un contrat PSP, une interprétation Play spécifique à notre modèle multivendeur ou une validation terrain ont été obtenus. **La décision confirmée FR/EN, l’APK, la portée internationale, les produits physiques/numériques et le refus actuel de l’affiliation rémunérée et des API sociales restent inchangés.**

## C.1. Point 1 — IA : valeur de métier, contrôle et coût

**Solution : IA de compréhension et de préparation, avec moteur transactionnel déterministe.** Ne pas confondre « application AI Foundry » avec un chatbot générique.

| Assistance ciblée | Entrée | Résultat structuré | Action utilisateur | Interdiction métier |
|---|---|---|---|---|
| Achat : expression d'un besoin | Texte libre FR/EN + champs facultatifs | Catégorie candidate, attributs, budget, lieu, délai, questions manquantes | Éditer puis confirmer demande/recherche | Inventer budget, taille, lieu, disponibilité, compatibilité ou intention |
| Vendeur : préparer une fiche | Texte/photos fournis et champs déclarés | Titre, description claire, caractéristiques candidates, questions de vérification | Vérifier et publier manuellement | Affirmer marque/authenticité, prix, stock ou licence non prouvés |
| Rapprochement besoin/offre | Besoin validé + catalogues autorisés | Candidats classés avec raisons, champs incompatibles et inconnus | Comparer, demander confirmation ou proposer | Garantir match ou conclure une vente sur score sémantique seul |
| Information en deux langues [option candidate] | Fiche utilisateur et langue de l'interface | Traduction étiquetée « traduction assistée », original accessible | Vendeur approuve avant diffusion de descriptifs sensibles | Présumer que textes libres/contrats/licences sont automatiquement et juridiquement traduits |

**Implémentation de référence :** (a) extraction IA vers schéma JSON strict ; (b) validation côté serveur des types, unités, enums et autorisations ; (c) comparaison **déterministe** des critères non négociables (catégorie, prix maximal, variante et disponibilité déclarée) ; (d) IA utilisée pour synonymes, reformulation et classement explicable ; (e) aucune modification de données engageantes sans confirmation. Le catalogue et la recherche restent utilisables si l’IA est désactivée ou en panne.

**Coût contrôlé :** appel explicite par tâche, limites de longueur/images, cache sûr pour résultats non personnels lorsque valable, quotas par compte, compteur de coût par opération, fournisseur substituable ; prévoir coût de secours sans génération et journal de qualité. Aucune API d’IA ni prix n'est contractuellement choisie. Données de clients minimisées, pas d'entraînement externe supposé, consentement et clauses fournisseurs à examiner.

**Critères d'acceptation IA :** une demande vague reçoit des questions et non un achat inventé ; une photo ambiguë ne déclenche pas une affirmation de compatibilité ; FR/EN fonctionnent avec règles métier identiques ; panne du modèle laisse possibles catalogue, commandes et demandes manuelles ; un coût IA est attribuable à sa tâche.

## C.2. Point 2 — Lien social : porte d'entrée commerciale légère et autonome

**Solution : une URL HTTPS canonique et partageable par offre/boutique, reliée aux Android App Links vérifiés.** Aucune API WhatsApp, Instagram, TikTok ou Facebook ; le partage est initié volontairement par la personne dans le menu natif du téléphone.

**Sans APK :** la page web mobile légère permet de découvrir l'offre précise, les variantes, les conditions, l'état actuel et des propositions voisines pertinentes ; elle présente le français/l’anglais et une suite claire. La consultation ne requiert pas de création de compte. La demande d'achat ou la poursuite d'une commande peuvent être prévues sur une page web transactionnelle **seulement si** auth, protection anti-abus, canal de paiement, obligations légales et tests concernés sont réellement opérationnels. Sinon, invitation claire à ouvrir/installer l’APK et conservation du lien de l’offre, sans promettre qu'un « deferred deep link » universel fonctionne spontanément.

**Avec APK :** le même lien ouvre l'offre exacte, variante et contexte autorisé conservés ; si une ancienne publication contient un prix périmé, l'offre courante affiche le changement et demande un nouvel accord. Une photo de publication ou son aperçu en cache sur un réseau tiers n'est pas synchronisable par notre application.

**Contrat minimal URL :** identifiant opaque d'offre et éventuellement variante publique, paramètres de campagne *facultatifs* ne révélant aucune donnée privée. Pas de montant signé dans l'URL comme vérité de paiement ; prix/stock sont revalidés au serveur au moment de s'engager. SEO/Open Graph adaptés, sans supposer que tous les réseaux rafraîchissent leur aperçu. Ne jamais utiliser une redirection web comme contournement présumé des règles de paiement numérique Android.

**Critères d'acceptation :** lien ouvert depuis WhatsApp avec/sans APK → même produit ; page non authentifiée ne révèle ni fournisseur privé ni coordonnées client ; prix modifié visible ; contenu FR/EN ; produit retiré donne un état honnête ; installation ne mène pas à une page d'accueil sans moyen de retrouver l'offre.

## C.3. Point 3 — Trois flux commerciaux, une infrastructure de stock et un modèle de revenu non confondu

**Solution : toutes les opérations ont des références métier et une origine explicite, mais ne deviennent pas fictivement le même événement financier.**

| Flux | Qui contracte avec qui ? | Stock et dossier | Revenu plateforme / paiement |
|---|---|---|---|
| `MARKETPLACE_SALE` | Acheteur final ↔ vendeur contractuel déclaré | Commande marché, réservation, exécution et incident ; stock réel affecté | Commission **seulement si** modèle adopté et transaction éligible ; PSP réel si activé |
| `EXTERNAL_SALE` | Client extérieur ↔ commerçant | Vente de caisse ou issue d'un canal externe ; même SKU et stock ; provenance « externe/ inconnue » | **Aucune commission de marketplace automatique** ; paiement caisse déclaré par vendeur ≠ vérification PSP |
| `SUPPLIER_PURCHASE` | Commerçant-acheteur ↔ fournisseur-vendeur | Commande d'approvisionnement avec coûts/prix B2B et réception propres ; relier par référence à besoin client si consenti | Jamais assimiler au chiffre d'affaires de la vente finale ; des frais éventuels exigeraient un modèle adopté |

**Invariants :** un article/variante peut alimenter plusieurs canaux sans être vendu deux fois ; commandes fournisseur et client ne fusionnent pas ; plusieurs vendeurs dans un panier exigent sous-commandes, vendeurs contractuels, montants, remboursements et permissions séparés ; accord accepté = instantané versionné. Les montants de chaque opération conservent `currency`, `origin`, `payment_evidence_source`, `seller_of_record`, `fulfillment_type`, `tax_and_fee_breakdown` lorsque applicable.

**Critères d'acceptation :** une vente cash externe baisse le stock et augmente le CA commerçant *déclaré*, mais n'augmente pas le montant PSP ni la commission marketplace ; échec d'approvisionnement n'efface pas la commande client ; autre boutique ne voit pas le prix fournisseur privé ; répétition d'événement n'engendre pas double mouvement.

## C.4. Point 4 — Paiements internationaux et numériques : routeur de conformité, adaptateurs et séparation des obligations

**Solution : ne pas coder « payer » comme un appel universel à un seul PSP.** Chaque tentative est déterminée par `(pays_vendeur, pays_acheteur, canal, produit, vendeur_contractuel, devise, montant, mode_exécution)`. Un routeur serveur retourne les options **vérifiées** et interdit celles sans capacité ou fondement applicable.

**Canaux et produits :**

1. Biens physiques : utiliser un PSP/paiement externe autorisé pour le corridor considéré ; les biens physiques ne passent pas par Google Play Billing.
2. Biens ou contenus numériques achetés dans l’APK distribué sur Play et fonctionnalités/abonnements premium de l'APK : considérer Play Billing comme règle de référence sauf exception ou programme applicable **vérifié pour le parcours exact** ; la marketplace multivendeur nécessite aussi une vérification concrète du destinataire des fonds et du modèle de reversement. Pas d'astuce « bouton web » pour éviter cette règle.
3. Prestations personnalisées et offres mixtes : classifier chaque composante et le panier avant de proposer le canal ; des obligations et paiements séparés peuvent être nécessaires. Ne pas vendre de panier multi-vendeur ou physique+numérique via un checkout unique avant test des règles et capacités effectives.
4. Vente externe : enregistrer le paiement déclaré ou attesté selon source, sans le réétiqueter « encaissé par notre PSP ».

**Architecture de paiement :** `PaymentIntent` interne → `PaymentProviderAdapter` (PSP régional / Play Billing / autre canal approuvé) → identifiant transaction externe → événement signé/vérifié serveur → `PaymentLedgerEntry` idempotent → effets métier autorisés → rapprochement → remboursement/reversement distinct. Pas de clés privées dans APK. Captures acheteurs ne valent pas confirmation. Un paiement tardif et un webhook répété ne créent pas double accès numérique ou double réservation.

**Déploiement international :** visibilité/catalogue multi-pays indépendante de l'autorisation d'encaisser et reverser. Matrice des corridors tenue par mode d'exécution, frais, taxe, remboursement, chargeback, vendeur légal et conditions de support. Aucune couverture globale n'est affirmée ; aucun PSP n'est retenu sur sa seule documentation promotionnelle.

**Critères d'acceptation :** flux physique et numérique n'empruntent pas aveuglément le même paiement ; variante pays non admissible affiche indisponibilité honnête sans prélèvement ; paiement pending ne libère pas accès numérique ; PSP envoie événement deux fois → une seule écriture logique ; remboursement demandé ≠ confirmé ; abonnement vendeur compatible avec les règles du canal avant monétisation.

## C.5. Exigences d'architecture induites et ordre de démonstration

- **EX-01 :** identité unique / plusieurs boutiques et rôles avec accès limités.
- **EX-02 :** référence produit séparée de l'offre vendeur, SKU, disponibilité et réservation atomiques.
- **EX-03 :** besoin, proposition, accord et commande versionnés ; événements audités.
- **EX-04 :** séparation physique/numérique, droits numériques indépendants du lien temporaire.
- **EX-05 :** grand livre paiement indépendant du stock, de l'exécution et du chiffre d'affaires vendeur déclaré.
- **EX-06 :** routeur de canal/produit/pays et PSP substituables ; modes non prouvés désactivés.
- **EX-07 :** domaine de lien public vérifié, landing légère, app links et i18n FR/EN.
- **EX-08 :** IA isolée derrière service optionnel avec schémas, validation, coût, fallback.
- **EX-09 :** tests sûreté : deux réservations, paiement tardif, double webhook, sortie/retour réseau, livraison ratée, accès numérique inaccessible, permissions inter-boutiques, FR/EN end-to-end.

**Ce qui demeure réellement ouvert :** contractualisation et conformité PSP/Play, pays opérationnels, fiscalité/CGV, modèles de revenus/tarifs, couverture logistique, disposition à payer et validation terrain. Ce sont des **portes de production ou preuves marché**, pas des questions de conception à remettre indéfiniment au fondateur.

**Point de reprise après PRD 0.4 :** étape 4 — architecture de référence, carte des entités, frontières backend/client, transitions, sécurité, intégrations, preuve de faisabilité et plan de construction. L’étape 5 UX/UI suit cette architecture, sans sacrifier la vision à une « coquille vide ».

### Références officielles vérifiées pour l'annexe C (consultation 25 septembre 2026)
- Google Play, Payments policy : https://support.google.com/googleplay/android-developer/answer/9858738?hl=fr
- Google Play, Understanding Payments : https://support.google.com/googleplay/android-developer/answer/10281818?hl=fr
- Android App Links : https://developer.android.com/training/app-links/about
- Vérification des liens : https://developer.android.com/training/app-links/verify-applinks
- Intégration Google Play Billing + backend : https://developer.android.com/google/play/billing/integrate?hl=fr ; https://developer.android.com/google/play/billing/backend


---

# ANNEXE D — DÉCISIONS DE DESIGN ET RÈGLES DE PASSAGE À LA CONSTRUCTION (HANDOFF V0.5)

**Statut :** orientations expressément confirmées par le fondateur au cours des échanges de septembre 2026 ; exceptions de faisabilité externes inchangées.

## D.1. Décisions confirmées

- Le produit principal est une **véritable application Android installable au format APK**, et non une simple web app ; Flutter est une référence d'ingénierie à éprouver, non une obligation d'utiliser un IDE spécifique.
- **Français et anglais** disponibles dès les flux essentiels acheteur, vendeur, visiteur et opérateur, sans juxtaposer les deux langues sur chaque libellé.
- **Thème système / clair / sombre** avec contrôle utilisateur, persistance et équivalence fonctionnelle pour acheteur et vendeur ; aucun écran métier ne reste figé en clair ou en sombre.
- **Direction visuelle premium approuvée** : ivoire/pierre, nuit/ardoise, vert émeraude d'action, champagne décoratif discret ; typographies éditoriale et d'interface différenciées. Les couleurs numériques sont les tokens de référence du design system, à ajuster seulement si test de contraste/accessibilité révèle un problème.
- **L'outil Cursor n'est pas retenu comme contrainte de travail.** Aucun ticket ou instruction ne doit imposer cet IDE.
- Fiches publiques et liens de partage sociaux **sans API sociales ni programme d'affiliation rémunérée** ; même compte acheteur/vendeur ; produits physiques/numériques ; logique internationale à activation par corridor.

## D.2. Couverture et preuve UX

La spécification UX finale couvre chaque Screen ID du blueprint avec objectifs, structure, action, cas d'échec et rattachement métier. La démo premium navigable couvre **quatre écrans de référence** S01, S03, S07, S20. Le prototype plus large est un parcours simulé pour les autres écrans, pas autant de maquettes hautes fidélités exhaustives. Les écrans de checkout réglementé sont conditionnés aux routes effectivement autorisées. Une image de référence de produit de luxe ne vaut ni badge vendeur vérifié, ni garantie d'authenticité, ni catégorie exclusive du produit.

## D.3. Critères obligatoires de construction et de sortie

- Implémenter les tokens des deux modes et la locale FR/EN avant de coder les écrans de production.
- Conserver le même identifiant de transaction, montant, devise, version des conditions et état lors d'un changement de langue ou de thème.
- Chaque écran a au minimum ses états normal, vide, attente, erreur récupérable, hors ligne si pertinent et action bloquée par règle métier.
- Démonstration fictive ≠ validation paiement/stock/identité. POC Android, App Links, concurrence stock et isolation boutique sont encore à exécuter.
- Les décisions externes (tarification, PSP, contrats, Google Play exact, pays, fiscalité, livraison et preuve de marché) ne sont pas implicitement approuvées par ce PRD.

**Document(s) faisant autorité pour l'implémentation visuelle :** `04_UX_UI/Design_System_Premium_V1_1.md` et `04_UX_UI/UX_UI_Specification_Finale_V1_0.md`. **Document de construction :** `05_CONSTRUCTION/Backlog_Final_V1_0.md`.


---
# ANNEXE E — DOMAINE ADMINISTRATION COMPLÉMENTAIRE ET OBLIGATOIRE

**Constat :** `FR-59` et les trois vues opérateur historiques ne spécifiaient pas suffisamment le propriétaire et son équipe, la gouvernance des permissions, le contrôle pays/PSP, le support, le ledger, les feature flags, les opérations et la supervision. La clôture documentaire antérieure était incomplète sur ce domaine.

**Source normative détaillée :** `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md`, sections 0 à 10 : **ADMIN-FR-001 à ADMIN-FR-050**, 18 vues, RBAC et approbations, contrôles pour chaque moyen de paiement, revue vendeurs/utilisateurs et tests ADMIN-T01 à ADMIN-T20. Ces exigences **s'ajoutent** à FR-01–70, sans les renuméroter.

**Instruction :** mettre en place auth/MFA/admin RBAC, audit append-only, default OFF par corridor et coupe-circuit AVANT la première opération financière réelle ; les vues plus avancées peuvent suivre par lots. Voir le backlog v1.1. Le contrôle de plateforme s'exerce dans les limites contractuelles, techniques et réglementaires de chaque PSP/canal ; aucune validation de prestataire n'est inventée.
