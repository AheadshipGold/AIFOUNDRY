> **CORRECTION CRITIQUE DU HANDOFF — ADMINISTRATION (25 septembre 2026)** : à la demande explicite du fondateur, l’administration de la plateforme est un **domaine central** et non trois vues génériques. Lire **`03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md`** avant toute conception des permissions, des paiements, des rôles, des modules ou de la mise en production. Cette extension comprend **50 exigences ADMIN-FR, 18 vues admin, 17 tickets et 20 tests**. Elle est normative pour la construction, avec portes financières/contractuelles toujours ouvertes. Les références anciennes à O01–O03 sont conservées comme couverture historique *insuffisante*, non comme limite du panel. Le prototype admin est une **simulation navigateur**, pas un service déployé.

# SPÉCIFICATION UX/UI FINALE POUR LA CONSTRUCTION — D01 + D02

**Version :** 1.2 — 2026-09-28 — Merchant-Owned Commerce Network  
**Statut :** dossier UX de référence pour construction ; spécification de chaque écran, NON trente-six maquettes pixels exécutées.  
**Priorité :** PRD v0.6 + architecture v0.4 + Design System Premium v1.1 ; palette premium approuvée, textes FR/EN et système/clair/sombre confirmés.

## 0. Critère de clôture

Tous les Screen IDs du blueprint (S01…S42, avec numérotation discontinue) sont spécifiés ici, ainsi que trois écrans opérateur proposés O01–O03. Les quatre écrans maîtres haute fidélité réellement développés en démonstration navigateur sont S01, S03, S07 et S20. Le prototype navigable élargi contient 31 écrans acheteur/vendeur ; les pages S41/S42 et les vues O01–O03 restent spécifiées ici mais non simulées individuellement dans le HTML. Ce prototype est une simulation premium légère, pas une preuve de design haute fidélité final écran par écran, ni du backend. **La déclinaison de chaque écran en Flutter, les tests FR/EN et clair/sombre, et les états d’erreur restent dans le backlog de construction.**

## 1. Règles de design communes

- Expérience acheteur : photographie/visuel offert prioritaire, hiérarchie éditoriale, un CTA majeur ; vendeur : activités à faire, densité organisée, une action explicite par ligne.
- Même compte peut être acheteur et vendeur ; boutique active toujours visible côté vendeur, accès distinct selon permissions.
- Thèmes système / clair / sombre ; même structure et éléments critiques. Fond ivoire/pierre en clair, nuit/ardoise en sombre ; émeraude=action et champagne=accent jamais statut financier.
- FR et EN complets ; pas de double langue dans un bouton. Texte vendeur original éventuellement non traduit ; version et langue des conditions acceptées conservées.
- 360–430dp conceptuellement, échelle de police agrandie, barre système/clavier et safe areas ; état vide, loading, offline, erreur, action interdite et reprise à tester.
- Pas d’obligation de payer/installer pour consulter une offre publique ; tout CTA d’achat dépend de la capacité effective de la route pays/canal/produit.
- Les images de luxe constituent une direction de présentation, PAS une catégorie unique ni preuve de produits authentiques ; inclure biens courants, B2B et fichiers numériques lors de la construction.

## 2. Arborescence de navigation

```text
Visiteur web HTTPS -> S40 offre / S41 boutique -> S42 authentification si nécessaire -> même objet dans APK
Acheteur -> S01 Découvrir -> S02 Recherche -> S07 Offre -> S09 Accord -> S10 Paiement -> S11 Mes achats -> S13 incident
Acheteur -> S02 sans résultat -> S03 Besoin -> S04/S05 Réponses -> S06 Comparer -> S09 Accord
Acheteur -> S12 Bibliothèque numérique / S15 achats récurrents / S14 Profil (langue & apparence)
Vendeur -> S20 Aujourd’hui -> S22/S23 Catalogue -> S24/S25 Stock & vente extérieure
Vendeur -> S26/S27 Opportunités -> S28/S29 Commandes & exécution -> S30 fournisseurs
Vendeur -> S31 numérique / S32 résultats / S33 SAV / S34 membres / S21 création boutique
Opérateur autorisé -> O01 politiques/corridors -> O02 modération -> O03 litiges et rapprochement
```

## 3. Contrat transversal par composant

| Composant | Informations indispensables | États non négociables |
|---|---|---|
| Produit | image, prix/devises, variante, vendeur, disponibilité, coûts connus | publié, à confirmer, sur commande, indisponible |
| Demande | auteur selon consentement, critères, quantité, date, zone | active, partielle, satisfaite, retirée, expirée |
| Proposition | vendeur, montant, livraison, validité, source de disponibilité | envoyée, acceptée, expirée, retirée |
| Commande | instantané accord, vendeur, paiement, exécution | ne jamais fusionner payé/livré |
| Transaction financière | moyen admissible, état PSP/référence, remboursement distinct | pending ≠ confirmed, requested ≠ refunded |
| Stock | disponible, réservé, physique, source de mise à jour | synchronisation offline non confirmée |
| Numérique | licence, fichier, version, droit, lien technique | lien expiré ≠ droit perdu |
| IA assistive | source, inconnues, brouillon modifiable, accord explicite | panne/quota ⇒ saisie manuelle |

## 4. Fiches écrans exhaustives

### S01 — Découvrir / Discover

**Composition :** Recherche en tête ; catégories illustrées ; sélection éditoriale multi-catégories ; cartes produit ; entrée « Exprimer un besoin ».

**Action principale et suite :** Ouvrir recherche, offre ou demande.

**Cas particuliers et interdictions :** Aucune offre admissible, région sans checkout, contenu de vendeur non traduit : afficher vérité et suite.

**Références :** PRD `FR-18/19/48` ; tests `T02/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S02 — Recherche / Search

**Composition :** Barre recherche persistante ; filtres prix/devise, catégorie, variante, état, lieu ; résultats avec disponibilité et coût connu.

**Action principale et suite :** Ouvrir offre ou exprimer un besoin.

**Cas particuliers et interdictions :** 0 résultat ⇒ demande ; filtre incompatible ⇒ effacer ; frais inconnus ⇒ à confirmer.

**Références :** PRD `FR-18/19/20` ; tests `T08/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S03 — Exprimer un besoin / Post a request

**Composition :** Texte libre d’abord ; aide IA facultative ; critères éditables ; budget/devise ; lieu ; délai ; consentement ; aperçu avant publier.

**Action principale et suite :** Vérifier puis publier, ou sauvegarder brouillon.

**Cas particuliers et interdictions :** IA lente/indisponible, refus partage, budget omis ; ne jamais inventer champs.

**Références :** PRD `FR-20/24/58` ; tests `T08/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S04 — Mes demandes / My requests

**Composition :** Liste par état et quantité restante, compteur de propositions, date/validité ; CTA reprendre/retirer.

**Action principale et suite :** Ouvrir détail, modifier brouillon.

**Cas particuliers et interdictions :** Demande expirée, retirée, partiellement remplie ; pas de réponse active après retrait.

**Références :** PRD `FR-20/21/23` ; tests `T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S05 — Détail de demande / Request details

**Composition :** Résumé des critères, visibilité, timeline ; liste propositions individuelles, questions et historique.

**Action principale et suite :** Comparer, clarifier, fermer demande.

**Cas particuliers et interdictions :** Offre retirée, expiration proche, vendeur indisponible ; ne pas accepter en douce.

**Références :** PRD `FR-21/23/25` ; tests `T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S06 — Comparer les propositions / Compare proposals

**Composition :** Colonnes/cartes comparables : prix+devise, frais connus, total, délai, état, variante, vendeur et date limite.

**Action principale et suite :** Choisir une proposition précise.

**Cas particuliers et interdictions :** Frais inconnus à confirmer ; quantité partielle ; proposition périmée ; aucune notion de « gagnant » IA.

**Références :** PRD `FR-19/23/26` ; tests `T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S07 — Fiche offre / Offer details

**Composition :** Galerie photo dominante, titre, prix+devise, disponibilité vérifiable, variante, vendeur, modalités, livraison/licence, version conditions.

**Action principale et suite :** Réserver/acheter si autorisé, partager, poser question.

**Cas particuliers et interdictions :** Lien périmé, rupture, sur commande, corridor inactif ; aucun faux bouton paiement.

**Références :** PRD `FR-06…11/48…50` ; tests `T02/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S08 — Boutique publique / Public shop

**Composition :** Couverture sobre, identité déclarée/vérifiée selon périmètre, politique, offre filtrable.

**Action principale et suite :** Ouvrir offre et contacter via canal consentant.

**Cas particuliers et interdictions :** Vendeur suspendu, aucune annonce, information non prouvée.

**Références :** PRD `FR-02/03/09` ; tests `T04/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S09 — Récapitulatif / Order review

**Composition :** Vendeur contractuel, ligne et variante, quantité, devise, frais connus, délai, canal, version/langue de conditions.

**Action principale et suite :** Confirmer accord explicitement.

**Cas particuliers et interdictions :** Changement prix/stock avant accord ⇒ nouveau consentement ; coûts inconnus ⇒ ne pas les masquer.

**Références :** PRD `FR-27/29/30/69` ; tests `T03/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S10 — Réservation et paiement / Reserve and pay

**Composition :** État stock, durée paramétrée si applicable, moyens réellement éligibles, référence, reprise.

**Action principale et suite :** Choisir route autorisée puis poursuivre.

**Cas particuliers et interdictions :** Paiement pending, refus corridor, double tap, paiement tardif, indisponibilité.

**Références :** PRD `FR-14/15/31…37` ; tests `T03/T05/T06/T07`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S11 — Mes achats et suivi / Purchases and tracking

**Composition :** Résumé commande ; trois lignes séparées accord/paiement/exécution ; jalons physiques et numérique ; aide.

**Action principale et suite :** Voir preuve, demander aide, confirmer remise lorsque pertinent.

**Cas particuliers et interdictions :** Payé non livré, callback ambigu, livraison partielle, incident actif.

**Références :** PRD `FR-29…41` ; tests `T10/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S12 — Bibliothèque numérique / Digital library

**Composition :** Droit d’accès lié à commande/licence/version ; contenu et action de téléchargement contrôlée.

**Action principale et suite :** Ouvrir / régénérer accès selon droit.

**Cas particuliers et interdictions :** Lien expiré ≠ achat perdu, fichier inaccessible, accès pas encore payé.

**Références :** PRD `FR-42…47` ; tests `T07/T10`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S13 — Incident et support / Issue and support

**Composition :** Raison, résumé accord, preuves pertinentes, étapes, solution proposée, historique accessible aux parties autorisées.

**Action principale et suite :** Ouvrir et suivre une réclamation.

**Cas particuliers et interdictions :** Remboursement demandé ≠ remboursé, litige contesté, livraison retardée.

**Références :** PRD `FR-52…55` ; tests `T10/T04`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S14 — Moi et préférences / Profile and preferences

**Composition :** Identité, bascule rôle, FR/EN, système/clair/sombre, sécurité et confidentialité.

**Action principale et suite :** Modifier préférence indépendante du pays/devise.

**Cas particuliers et interdictions :** Reconnexion, thème OS modifié, changement langue pendant une commande.

**Références :** PRD `FR-01/66…70` ; tests `T01/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S15 — Achats récurrents / Repeat purchases

**Composition :** Listes sauvegardées, fréquence indicative, budget déclaré et achats enregistrés séparément.

**Action principale et suite :** Réexaminer un achat et choisir manuellement.

**Cas particuliers et interdictions :** Prix ancien, hors budget, achat externe inconnu ; jamais achat automatique.

**Références :** PRD `FR-61/62` ; tests `T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S20 — Aujourd’hui dans ma boutique / Seller today

**Composition :** Boutique active visible ; tâches urgentes avant KPI ; raccourcis produit/vente/demande ; ventes internes et externes distinguées.

**Action principale et suite :** Ouvrir tâche réelle ou créer opération.

**Cas particuliers et interdictions :** Aucune activité, marge incomplète, commande en anomalie ; 0 métrique fictive présentée réelle.

**Références :** PRD `FR-56/57/63` ; tests `T04/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S21 — Créer une boutique / Create a shop

**Composition :** Coordonnées publiques contrôlées, profil, règles boutique, territoires déclarés et éventuelle vérification.

**Action principale et suite :** Créer brouillon boutique puis demander ouverture d’options admissibles.

**Cas particuliers et interdictions :** Pas de PSP admissible ≠ boutique impossible ; KYC non confirmé affiché honnêtement.

**Références :** PRD `FR-01…05` ; tests `T04`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S22 — Catalogue / Catalog

**Composition :** Table/liste illustrée offres avec status, variantes, stock, catégorie, dernière mise à jour, liens de partage.

**Action principale et suite :** Éditer, suspendre ou partager annonce.

**Cas particuliers et interdictions :** Stock inconnu, brouillon, offre modifiée, lien externe ancien.

**Références :** PRD `FR-06…16/48` ; tests `T02/T03`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S23 — Créer offre / Create listing

**Composition :** Galerie et médias, type physique/numérique, champs de variante, coût, frais, statut, conditions et aide IA optionnelle.

**Action principale et suite :** Vérifier et publier la version courante.

**Cas particuliers et interdictions :** IA invente attribut, taille vide, fichier pas autorisé, prix non valide.

**Références :** PRD `FR-06…11/42/58` ; tests `T08/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S24 — Stock et mouvements / Inventory

**Composition :** SKU, disponible/réservé/physique, réception, vente, correction motivée, horodatage et source.

**Action principale et suite :** Réceptionner ou ajuster sous permission.

**Cas particuliers et interdictions :** Dernier exemplaire, vente offline concurrente, écriture double, état à rapprocher.

**Références :** PRD `FR-12…17` ; tests `T03/T09`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S25 — Vente extérieure / External sale

**Composition :** Choisir article/variante, quantité, montant+devise, mode déclaré, origine hors marketplace ; écran de confirmation de saisie.

**Action principale et suite :** Enregistrer événement et ajustement contrôlé.

**Cas particuliers et interdictions :** Offline en attente de sync, double saisie, stock réservé ailleurs ; faux PSP interdit.

**Références :** PRD `FR-16/36` ; tests `T09/T03`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S26 — Opportunités / Buyer requests

**Composition :** Demandes rendues visibles selon catégories, zone et consentement ; filtres ; pertinence expliquée.

**Action principale et suite :** Examiner besoin et préparer proposition.

**Cas particuliers et interdictions :** Demandes retirées, coordonnées privées, spam, stock inconnu.

**Références :** PRD `FR-20…24/60` ; tests `T08/T04`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S27 — Préparer proposition / Prepare proposal

**Composition :** Besoin source, variantes, stock ou fournisseur, prix+frais+devise, validité, livraison et conditions.

**Action principale et suite :** Envoyer proposition après confirmation vendeur.

**Cas particuliers et interdictions :** Disponibilité non garantie, offre expirée, achat fournisseur distinct, montant incomplet.

**Références :** PRD `FR-23…28` ; tests `T03/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S28 — Commandes boutique / Seller orders

**Composition :** Liste actionnable avec paiement séparé, exécution et échéance ; détail des modifications convenues.

**Action principale et suite :** Accepter/préparer, répondre incident, consulter accord.

**Cas particuliers et interdictions :** Payé mais non livré ; paiement en examen ; retard fournisseur ; pas de faux succès.

**Références :** PRD `FR-29…41` ; tests `T05/T10`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S29 — Exécution physique / Physical fulfillment

**Composition :** Préparation, retrait/remise/transporteur selon prestataire, frais/délais déclarés, preuve et jalons.

**Action principale et suite :** Consigner preuve autorisée et avertir acheteur.

**Cas particuliers et interdictions :** Remis transporteur ≠ reçu, incident et destinataire absent.

**Références :** PRD `FR-38…41` ; tests `T10`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S30 — Approvisionnement / Suppliers

**Composition :** Fournisseurs privés, devis B2B, coût confidentiel, commande achat et réception, lien possible à besoin client non public.

**Action principale et suite :** Commander ou enregistrer réception distinctement.

**Cas particuliers et interdictions :** Rupture fournisseur, nouveau délai exige accord client, confidentialité.

**Références :** PRD `FR-17/28/63` ; tests `T04/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S31 — Produits numériques vendeur / Digital products

**Composition :** Fichiers privés, aperçu autorisé, licence, version, droits délivrés, erreurs d’accès et prestations personnalisées.

**Action principale et suite :** Publier si canal permis, gérer accès selon contrat.

**Cas particuliers et interdictions :** Fichier raté, droit déjà accordé, révocation litigieuse, canal Play bloqué.

**Références :** PRD `FR-42…47` ; tests `T07/T10`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S32 — Résultats / Results

**Composition :** Ventes marketplace et externes séparées, marges uniquement si coûts suffisants, périodes et provenances.

**Action principale et suite :** Explorer détail de chiffre et décider manuellement.

**Cas particuliers et interdictions :** Données insuffisantes, devise incompatible, métrique inventée.

**Références :** PRD `FR-36/57/63/65` ; tests `T04/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S33 — Clientèle et SAV / Customer care

**Composition :** Achats et demandes consentis, dossier SAV, préférences contact, historique non importé des réseaux.

**Action principale et suite :** Suivre incident ou contacter si autorisé.

**Cas particuliers et interdictions :** Pas d’opt-in, données privées B2B/B2C, mauvais rôle.

**Références :** PRD `FR-52…55/64` ; tests `T04/T10`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S34 — Équipe et accès / Team and access

**Composition :** Membres boutique, rôles précis, accès stock, catalogue, commande, financier et audit.

**Action principale et suite :** Ajouter/révoquer permission sous rôle autorisé.

**Cas particuliers et interdictions :** Collaborateur tente paiement ou données boutique B ; accès refusé.

**Références :** PRD `FR-04/05/59` ; tests `T04`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S40 — Page web offre / Web offer

**Composition :** Offre HTTPS actuelle accessible sans installation : visuel, prix, état, conditions et action ouvrir APK ou navigation web permise.

**Action principale et suite :** Ouvrir même offer_id/variante dans APK.

**Cas particuliers et interdictions :** URL ancienne, sans APK, consentement visiteur, limite du checkout numérique.

**Références :** PRD `FR-48…50/70` ; tests `T02/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S41 — Page web boutique / Web shop

**Composition :** Identité publique, catalogue filtrable, liens offres et déclaration de pays/services effectifs.

**Action principale et suite :** Découvrir offres et ouvrir l’app si souhaité.

**Cas particuliers et interdictions :** Boutique sans offre, vendeur suspendu, absence de transaction admissible.

**Références :** PRD `FR-02/49/70` ; tests `T02/T11`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### S42 — Connexion et retour / Sign-in and return

**Composition :** Écran login/onboarding ; résumé origine et trajet du visiteur ; sauvegarde intention sans fuite de secrets.

**Action principale et suite :** Se connecter puis retourner vers offer_id/variante/demande.

**Cas particuliers et interdictions :** Lien invalide, réseau coupé, compte sans autorisation boutique, APK absent.

**Références :** PRD `FR-01/49` ; tests `T02/T04`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### O01 — Console opérateur / Operations

**Composition :** Interface opérateur séparée de l’APK public : routes de paiement/pays, catégories, politiques versionnées, droits spécifiques.

**Action principale et suite :** Activer uniquement une route prouvée et autorisée.

**Cas particuliers et interdictions :** PSP non signé, Play non qualifié, pays inactif, absence journal.

**Références :** PRD `FR-05/32/59` ; tests `T04/T06/T07`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### O02 — Modération / Moderation

**Composition :** Signalements, preuve, article/boutique, décision motivée, historique et possibilité de contestation.

**Action principale et suite :** Limiter une annonce après examen autorisé.

**Cas particuliers et interdictions :** Contenu numérique non licencié, vendeur frauduleux, faux badge.

**Références :** PRD `FR-03/46/55/59` ; tests `T04/T10`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

### O03 — Réconciliation et litiges / Reconciliation

**Composition :** Événements PSP signés, ordre, remboursement demandé/confirmé, accès numérique et incident ; journal opérateur.

**Action principale et suite :** Examiner anomalie ou exécuter acte seulement si capacité valide.

**Cas particuliers et interdictions :** Callback dupliqué, chargeback, payé sans livraison, paiement tardif.

**Références :** PRD `FR-31…37/52…54` ; tests `T05/T06/T10/T12`. **Apparence et langue :** mêmes informations, droits et actions en clair/sombre, FR/EN ; libellés localisés sans modifier devise, conditions ni objets.

## 5. Flux éditoriaux / interaction essentiels

| Flux | Chaîne de référence | Cas d’erreur à rendre visible |
|---|---|---|
| F01 Entrée sociale | S40 → S07 → S09 → S10 → S11 | produit actualisé/épuisé, sans APK, route bloquée |
| F02 Besoin sans offre | S02 → S03 → S04 → S05 → S06 → S09 | zéro réponse, expiré, partiel, IA indisponible |
| F03 Vente externe | S20 → S25 → S24 | offline, conflit, revenu déclaré non PSP |
| F04 Chaîne fournisseurs | S26 → S30 → S27 → S28 | achat fournisseur distinct, défaut approvisionnement |
| F05 Numérique | S07 → S09 → S10 → S12 / S31 | Play non admissible, fichier KO, droit persistant |
| F06 Incident | S11 → S13 ↔ S28 / O03 | payé non livré, remboursement demandé non exécuté |
| F07 Même commande FR/EN | acheteur S09 FR, vendeur S28 EN | mêmes identifiants, montants, conditions et statut |

## 6. Maquettes et matérialisation réellement livrées

- `Demo_Premium_4_Ecrans.html` : quatre écrans haute fidélité représentatifs, navigation et contrôles FR/EN + apparence.
- `Prototype_Parcours_Complets_Premium.html` : parcours simulés sur 33 Screen IDs métier, en habillage premium cohérent ; les écrans secondaires ne sont pas présentés comme des maquettes pixel perfect.
- `Design_System_Premium_V1_1.md` : tokens, composants et règles de qualité.
- `References_visuelles/` : moodboards générés, exemples fictifs et marques/photos de démonstration sans licence commerciale présumée.

## 7. Conditions d’acceptation à l’implémentation

- Un catalogue de composants implémentés permet de décliner les états de toutes les fiches et le contraste est mesuré ; le design system n’est pas seulement un fichier.
- Un téléphone Android réel démontre S01/S03/S07/S20 en FR/EN × clair/sombre ; le reste des parcours reçoit une QA progressive par lots.
- État système suit OS ; choix manuel persiste ; pas de flash blanc au lancement sombre ; éléments natifs et clavier suivent le thème.
- Pour chaque écran qui accepte, paie, publie ou réserve : double tap sans doublon, erreurs récupérables, offline honnête et autorisations vérifiées côté serveur.
- Aucune sortie IA, maquette d’un paiement ou badge esthétique ne devient affirmation de vérification réelle.
- L’interface opérateur O01–O03 est strictement interne ; jamais exposée par « Ma boutique ».

## 8. Point de sortie de la conception documentaire

**Clôture documentaire UX : OK.** Inventaire/contrat des écrans complet. **Clôture de la QA visuelle sur APK : NON**, le développement et les tests ne sont pas exécutés. Le backlog construit les écrans en respectant le design system ; créer une nouvelle phase d’idéation n’est pas nécessaire.


---
# EXTENSION UX ADMIN — CONSOLE PREMIUM (A01–A18)

Les O01–O03 de l'historique ne sont **pas** un écran admin complet. La console privée et responsive comprend **18 vues A01–A18**, décrites dans `03B_ADMINISTRATION/ADMIN_PANEL_PRD_ARCHITECTURE_UX_V1_0.md` §4, avec parcours d'activation PSP, désactivation en incident, restriction vendeur, remboursement, feature flags, conditions et appels. À décliner FR/EN, système/clair/sombre, niveaux d'accès et états d'erreur ; les composants du Design System Premium v1.1 s'appliquent, avec densité desktop appropriée.

**Prototype :** `03B_ADMINISTRATION/Console_Admin_Premium_Demo.html` = simulation HTML de découverte, **pas** une interface de production ni une preuve RBAC. Aucun rôle admin ne provient du compte vendeur par héritage.


---
# ANNEXE V2 — NOUVEAUX PARCOURS ET ÉCRANS

## 1. Révision du checkout acheteur

`S10` devient un checkout **scopé à une boutique** : méthodes automatiques connectées par le vendeur + méthodes manuelles/COD. Le client voit la source de vérification et le responsable fulfillment. Un panier global multi-vendeur présente un résumé puis des sous-commandes/paiements séparés.

## 2. Nouveaux Screen IDs

### S35 — Paiements de ma boutique / Store payments
- pays/marché actif ;
- providers disponibles ;
- `Connecter` / `Créer un compte` / `Déconnecter` ;
- méthodes automatiques vs manuelles ;
- santé connexion ;
- jamais de secret API affiché.

### S36 — Plans et facturation / Plans & billing
- Basic / Business / Enterprise ;
- quotas et fonctionnalités ;
- source de facturation ;
- dans APK Bénin : Play Billing pour upgrade initié in-app ;
- sur web : Mobile Money/carte ;
- plan actif synchronisé au compte.

### S37 — Domaine et présence web / Domain & storefront
- URL plateforme ;
- custom domain ;
- DNS/TLS status ;
- favicon/social image/title/meta ;
- preview partage.

### S38 — CRM et automatisations / Customers & automations
- clients, tags, consentements ;
- workflows ;
- limites plan ;
- historique actions/messages ;
- intégrations officielles seulement.

### S39 — Intégrations / Integrations
- WhatsApp Business (future/flag), API/webhooks, imports, POS/connecteurs ;
- scopes et état connexion ;
- coût/quota si applicable.

## 3. Buyer marketplace conservé

`S01–S06` restent centraux : discovery, search, need, requests, proposals, compare. Une proposition acceptée crée une commande dans la boutique vendeuse ; elle n'est pas convertie en « paiement plateforme ».

## 4. Storefront public

`S40/S41` sont renforcés : social preview, domain custom, SEO, politiques vendeur, méthodes paiement affichées sans exposer credentials, modes fulfillment et badge de vérification à périmètre explicite.

## 5. États de paiement obligatoires

- Non payé ;
- Paiement lancé ;
- Confirmation PSP en attente ;
- Confirmé par PSP ;
- Paiement manuel déclaré ;
- Paiement manuel confirmé vendeur ;
- COD / à la remise ;
- Remboursement demandé ;
- Remboursé par provider ;
- Remboursement manuel déclaré.

Jamais fusionner ces états.

## 6. Plans SaaS et web

L'APK n'affiche pas de lien vers checkout externe du plan au Bénin tant que Google Play ne l'autorise pas. Le site web peut vendre le plan par Mobile Money ; après connexion, l'APK affiche le plan actif. Le même design system couvre portail web et app.

## 7. QA issue Codex

Chaque parcours vendeur critique est testé : 360dp, police 200 %, Android milieu/entrée de gamme, réseau lent/intermittent, une main, temps d'action, erreurs. Si l'esthétique premium ralentit ou cache l'action, l'ergonomie prime.
