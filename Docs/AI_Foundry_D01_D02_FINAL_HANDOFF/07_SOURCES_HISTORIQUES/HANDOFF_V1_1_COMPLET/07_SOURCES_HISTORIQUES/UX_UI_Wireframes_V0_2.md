# UX/UI — WIREFRAMES INTERACTIFS D01 + D02

**Version : 0.2 — parcours acheteur et vendeur, clair / sombre / système, FR / EN**  
**Date : 25 septembre 2026**  
**Sources :** `AI_Foundry_D01_D02_UX_UI_Blueprint_V0_1.md`, PRD v0.4 (FR-01…70), Architecture v0.2.  
**Prototype associé :** `AI_Foundry_D01_D02_Wireframes_Interactifs_V0_2_FR_EN.html`.

## 0. Instruction nouvelle du fondateur — CONFIRMÉE

L'application doit être utilisable en **thème clair et thème sombre** car les utilisateurs ont des préférences différentes. Cela s'ajoute au fonctionnement **intégral en français et anglais**, déjà confirmé, et ne le remplace pas.

**Règle UX proposée :** choix explicite `Système / Clair / Sombre`, avec préférence persistante sur le téléphone, respect de la préférence système par défaut, sans forcer le thème selon la langue, le pays ou la boutique. Les deux modes couvrent l'espace acheteur, vendeur, visiteur des fiches web, messages d'erreur et écrans de paiement accessibles. Un éventuel enregistrement de préférence sur le compte peut synchroniser les appareils, mais l'absence de connexion ne doit pas empêcher le choix.

## 1. Livrable réellement produit

**Un seul fichier HTML autonome** (CSS et JS embarqués) ouvrable localement dans un navigateur mobile ou de bureau. Il met en scène une fenêtre de téléphone, une liste d'écrans, une fiche de traçabilité PRD et des raccourcis de parcours. Il comporte un sélecteur FR/EN, un sélecteur Système/Clair/Sombre et une bascule Acheteur/Vendeur. L'interface est « wireframe » intentionnellement : images de remplacement, contenu exemplaire, composants sobrement stylisés ; **ce n'est pas une proposition de logo, de marque, de palette définitive ou une application Android compilée**.

**Portée honnête :** le prototype couvre les points d'entrée et écrans de travail du blueprint et illustre les parcours. Certains boutons simulent un changement d'écran, de brouillon ou de statut local ; les opérations réseau, droits numériques, partage réel, IA de production et paiements ne sont **pas** exécutés. Des mentions répétées « démonstration » rendent cette limitation visible. L'exemple de devise XOF et les prix sont fictifs et ne constituent pas une décision de corridor commercial.

### Instructions d'ouverture

1. Télécharger le `.html` sur le téléphone ou l'ordinateur.
2. Ouvrir avec un navigateur compatible (Chrome Android, Chrome/Edge/Firefox sur ordinateur) ; aucune installation de projet nécessaire.
3. Choisir Acheteur ou Vendeur, changer Système/Clair/Sombre et Français/English.
4. Utiliser les écrans de gauche, les quatre onglets du téléphone et les CTA ; les parcours rapides figurent dans la fiche latérale, ou après l'aperçu sur petit écran.

## 2. Structure de navigation produite

**Acheteur :** Découvrir · Mes demandes · Mes achats · Moi. La recherche infructueuse mène à la saisie de besoin, puis aux propositions. La fiche d'offre mène à un récapitulatif avant une vue « paiement indisponible en démo » ; une commande exemple affiche **paiement ≠ exécution**. Un parcours montre la bibliothèque numérique sans attribuer un faux droit d'accès.

**Vendeur :** Aujourd'hui · Catalogue · Demandes · Commandes. Les actions rapides conduisent à créer une offre, saisir une vente extérieure, répondre à un besoin et voir le stock. Les achats fournisseur sont séparés de la vente client. Le prix d'approvisionnement est présenté comme privé.

**Rôles :** même compte conceptuel ; la bascule ne simule pas un logout. Les pages S40/S07 distinguent l'intention `URL publique -> offre à jour` et une implémentation App Links encore à tester.

## 3. Inventaire des écrans et états visibles

| Famille | Écrans du blueprint disponibles dans le panneau | Exemple d'action / garde-fou |
|---|---|---|
| Découverte | S01, S02, S07, S08, S40 | Recherche, offre partageable, information commerciale actuelle. |
| Demande / comparaison | S03, S04, S05, S06 | Saisie manuelle possible ; suggestion IA explicitement simulée ; plusieurs propositions. |
| Accord / commande acheteur | S09, S10, S11 | Conditions versionnées illustrées ; pas de faux paiement ; exécution distincte. |
| Numérique / SAV | S12, S13 | Droit non activé en démo ; incident séparé. |
| Profil / récurrence | S14, S15 | FR/EN et apparence indépendants ; pas de prélèvement automatique. |
| Tableau boutique / démarrage | S20, S21 | Actions à faire, contexte vendeur visible. |
| Catalogue / création / stock | S22, S23, S24, S25 | IA de rédaction simulée ; vente extérieure déclarée ≠ PSP. |
| Demandes / réponse / exécution | S26, S27, S28, S29 | Sur commande, paiement en attente, jalons de remise. |
| Fournisseurs / numérique | S30, S31 | Confidentialité B2B et types de fourniture distincts. |
| Résultats / clients / équipe | S32, S33, S34 | Marge incomplète affichée ; suivi consenti ; permissions. |

**Limites de couverture :** certains formulaires et parcours secondaires restent schématiques ; les écrans opérateur et le login S42 ne sont pas encore maquetés dans le prototype interactif. Ils restent présents dans le blueprint source et doivent être couverts avant de prétendre à une UX complète. Les détails des vraies CGV, de checkout Play, des avis et d'une page web de production dépendent des vérifications réglementaires et techniques ouvertes.

## 4. Design system — fondations sémantiques pour deux thèmes

**Ne pas figer la marque à l'étape wireframe.** L'implémentation prototype utilise des valeurs indicatives. Le système final doit employer des **tokens sémantiques** et non un `#ffffff` inséré manuellement dans chaque écran.

| Token | Usage | Clair dans le prototype | Sombre dans le prototype |
|---|---|---|---|
| `color.background` | Fond global | `#eef1f5` | `#10151d` |
| `color.surface` | Carte, écran, panneau | `#ffffff` | `#1b2531` |
| `color.surfaceSecondary` | Barre, encart, champ | `#f5f7fa` | `#253241` |
| `color.textPrimary` | Texte essentiel | `#1c2732` | `#f0f4f8` |
| `color.textMuted` | Métadonnées / aide | `#596879` | `#b7c4d2` |
| `color.border` | Contours | `#d8dee7` | `#415060` |
| `color.action` | Action dominante | `#245c58` | `#85d5c1` |
| `color.actionText` | Texte sur action dominante | `#ffffff` | `#122b2a` |
| `color.focus` | Focus visible | `#7668c5` | `#ccb8ff` |

Ces valeurs sont un **point de départ wireframe** ; elles seront retravaillées lors de l'identité visuelle. Les états `succès / en attente / erreur` doivent associer une couleur, du texte et/ou une icône : ne jamais dépendre de la couleur seule pour signifier qu'un paiement est confirmé ou non.

### Comportement obligatoire des modes

- **Système** : respecte l'apparence définie dans Android/le navigateur si aucune préférence manuelle n'a été choisie.
- **Clair** : conserve un contraste et des surfaces claires, quelle que soit l'apparence système.
- **Sombre** : conserve un contraste et des surfaces sombres, sans transformer les photos de produits, preuves ou fichiers de vendeurs.
- **Persistance** : restauration du choix après fermeture/reconnexion ; le HTML utilise `localStorage` pour une démonstration locale, pas comme décision d'architecture mobile.
- **FR/EN** : le changement de langue garde exactement la même offre, quantité, devise, statut et règle d'accès. Les textes libres des vendeurs ne sont pas automatiquement traduits.
- **Sensibilité UX** : éviter le « flash blanc » pendant le démarrage du mode sombre ; vérifier clavier, barres système et fenêtres natives, Android App Links et fiches web.

## 5. Matrice de vérification UX des parcours

| Vérification | Critère d'acceptation à tester en maquette / vrai Android |
|---|---|
| Sélection 4 variantes d'expérience | Acheter FR clair ; acheter EN sombre ; vendeur FR sombre ; vendeur EN clair ; plus mode Système. |
| Passage d'un rôle à l'autre | Même compte ; contexte boutique visible ; préférences intactes. |
| Produit et liens sociaux | Prix actuel et information « indisponible » sont lisibles dans les deux thèmes et les deux langues. |
| Recherche infructueuse | La suite « exprimer le besoin » existe et la saisie est conservée. |
| Proposition | Plusieurs réponses sans acceptation automatique ; coûts et validités compréhensibles. |
| Paiement / exécution | `pending` jamais affiché comme `paid`, clair ou sombre ; même vérité FR/EN. |
| Saisie vente extérieure | Libellé « déclaré par le vendeur » et non paiement PSP. |
| Digital | Lien expiré ≠ droit révoqué ; état fictif dans la maquette ≠ droit acquis. |
| Visibilité / contraste | Vérifier contraste réel des textes, focus, badges, boutons désactivés et erreurs sur appareil. |
| Écran étroit / grands caractères | Aucune action ou prix important coupé en FR/EN ; lecteurs d'écran et taille police Android à tester. |

## 6. Suite exacte après ce livrable

1. **Faire la revue des wireframes** : conflits de navigation, informations manquantes, actions englobantes par écran. Corriger par rapport au PRD sans rouvrir l'idéation.
2. **Design system visuel v1** : choisir identité et tokens de marque, typo et composants finalisés avec modes clair/sombre dès l'origine.
3. **Maquettes haute fidélité FR/EN** : reprennent les mêmes Screen IDs ; scénarios normal, vide, erreur, hors réseau, paiement en attente, stock épuisé et droit inaccessible.
4. **Backlog neutre à l'IDE** : POC Android et sécurité en parallèle des écrans ; établir chaque tâche avec FR/Screen ID, dépendances, résultat, tests et preuve. Ne plus considérer Cursor comme outil imposé.

**Statut du projet :** conception interactive présentée, développement Android, POC et tests utilisateurs réels non exécutés.
