# DESIGN SYSTEM PREMIUM — D01 + D02

**Version :** 1.1 — direction artistique approuvée ; handoff des tokens et composants  
**Date :** 25 septembre 2026  
**Référence normative :** PRD de construction v0.5 (FR-01…FR-70), architecture 0.3, UX finale 1.0. Anciennes versions préservées dans les sources historiques.  
**Décision du fondateur :** direction visuelle premium approuvée ; thème clair + sombre ; français + anglais ; APK Android comme produit principal.  
**Nom et logo :** non déterminés. « Commerce Studio / Commerce » affiché dans les démonstrations est un **placeholder**, pas une marque validée.

## 1. Signature visuelle

**Premium contemporain, éditorial et accessible à un commerce ordinaire.** Photographies d'offres dominantes et composition respirante pour l'acheteur ; tableau opérationnel plus dense mais hiérarchisé pour le vendeur. Même langage de marque, densités d'information distinctes. Ne pas imiter une boutique réservée aux bijoux/montres, ni une interface SaaS saturée de cartes, ni un style « IA générique » à dégradés gratuits.

**Direction approuvée :** ivoire et pierre en mode clair ; nuit ardoise en mode sombre ; vert émeraude comme couleur d'action ; champagne réservé aux accents éditoriaux. Le doré ne communique jamais « payé », « vérifié », « garanti » ou « succès ».

## 2. Design tokens sémantiques — référence d'implémentation

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `bg.canvas` | `#FAF9F6` | `#0B141A` | fond application |
| `bg.surface` | `#FFFFFF` | `#132129` | cartes, modales |
| `bg.subtle` | `#F2F0EA` | `#1B2D34` | champs, encarts |
| `bg.elevated` | `#FFFFFF` | `#22343B` | menus, overlays |
| `text.primary` | `#151E1C` | `#F5F7F3` | texte essentiel |
| `text.secondary` | `#5B6661` | `#BBC9C3` | description / aide |
| `border.default` | `#DFE4DE` | `#34464C` | séparateurs |
| `action.primary` | `#075D49` | `#63DBB6` | bouton principal |
| `action.onPrimary` | `#FFFFFF` | `#0B141A` | texte bouton |
| `accent.champagne` | `#AD8455` | `#D3B98E` | décoration non critique |
| `focus.ring` | `#075D49` | `#63DBB6` | focus visible + contour |
| `status.success.bg` | `#E6F4EE` | `#163D33` | fond succès |
| `status.success.fg` | `#185F46` | `#9BE9C5` | texte succès |
| `status.pending.bg` | `#FFF3DF` | `#42311D` | fond attente |
| `status.pending.fg` | `#7A4A12` | `#F0D3A4` | texte attente |
| `status.error.bg` | `#FFF1F2` | `#46242B` | fond erreur |
| `status.error.fg` | `#B42C3E` | `#FFB7C3` | texte erreur |

**Valeurs contrôlées** (ratio WCAG calculé, texte normal cible >= 4,5:1) : `text.primary` sur `bg.canvas` clair ≈ 16,16 ; `text.secondary` sur `bg.canvas` clair ≈ 5,67 ; `text.primary` sur `bg.canvas` sombre ≈ 17,25 ; `text.secondary` sombre ≈ 10,85 ; `action.onPrimary` sur `action.primary` clair ≈ 7,86 et sombre ≈ 10,93. `accent.champagne` clair sur surface blanche ≈ 3,38 : **interdit en texte normal informatif sur blanc** ; utiliser le champagne en accent ou avec fond/texte vérifiés. Ces calculs ne remplacent pas un audit sur appareil et états réels.

### Convention de nommage pour Flutter/CSS

Ne jamais écrire `if dark: text = white` dans un écran métier. Utiliser des noms sémantiques `AppColors.of(context).textPrimary`, `primaryAction`, `surface`, `onPrimary` et des variantes de statut. Les couleurs du produit/photo ne remplacent pas les tokens de texte. Les thèmes suivent « système » par défaut ; choisir clair/sombre manuellement prend priorité ; préférence sauvegardée et réutilisable indépendamment de FR/EN, pays et devise.

## 3. Typographie

- **Titres éditoriaux :** Playfair Display (ou police serif de substitution licenciée et testée), uniquement accueil, introduction de catégorie, grandes accroches. Ne pas l'employer pour les montants ou formulaires. Aucune police n'est distribuée dans ce dossier.
- **UI courante :** Inter (ou police sans-serif système testée). Statuts et nombres avec chiffres tabulaires lorsqu'alignés.
- Échelle mobile candidate : display `36/40`, H1 `28/34`, H2 `23/29`, H3 `19/25`, corps `16/24`, secondaire `14/21`, annotation `12/17`. Boutons `15/20` medium/semibold ; montants `23/28` semibold, pas italique.
- Les polices doivent être intégrées dans l'application selon leurs licences et sans fichiers de police envoyés à l'utilisateur par ChatGPT. Taille de police Android agrandie : croissance des cartes, aucun prix/CTA coupé.

## 4. Grille et rythme

- Mobile cible conceptuelle `360–430dp` ; marges `20dp` (petit écran 16), grille 4dp ; intervalles `4, 8, 12, 16, 20, 24, 32, 40`.
- Zones tactiles >= `48×48dp`. Rayon : champs `14dp`, cartes `18dp`, grandes sections `24dp`, pilules `999dp`. Rayons modérés pour conserver une apparence professionnelle.
- Les images produits réelles doivent être de bonne qualité mais jamais surexposées par des ombres/effets. Ratio image listing recommandé `4:5` ou carré selon catégorie ; fiches 1:1/4:5 et zoom.
- Ombres discrètes en clair, séparation par luminance/bordure en sombre. Pas de « verre flou » systématique.

## 5. Composants et variantes obligatoires

| Composant | États/variants minimum | Règle métier |
|---|---|---|
| `PrimaryButton` | ready, loading, disabled, danger, focus | bouton double tap n'ouvre pas deux commandes |
| `SecondaryButton` | normal, focus, disabled | CTA de secours lisible |
| `TextField` | vide, saisi, erreur, assistant IA indisponible | conserver la saisie après erreur |
| `ProductCard` | disponible, à confirmer, sur commande, épuisé, numérique | statut honnête et devise de l'offre |
| `RequestCard` | active, réponses, partielle, expirée | coût « à confirmer » si manquant |
| `ProposalCard` | envoyée, acceptée, expirée, retirée | acceptation fixe conditions/version |
| `OrderRow` | commande / paiement / exécution séparés | « en attente » ≠ payé |
| `StatusBadge` | success, pending, error, neutral | texte + forme et éventuellement icône, jamais couleur seule |
| `ProductGallery` | zoom, variante, vide, chargement | réserve la place pour éviter saut d'interface |
| `MerchantKPI` | valeur réelle, données insuffisantes, source externe | pas de marge inventée ni de faux GMV |
| `LocaleSwitch` | FR, EN | modifie langue sans changer devises et engagements |
| `ThemeSwitch` | système, clair, sombre | respecte préférence app et changements OS |
| `BottomNav` | acheteur/vendeur contextuel | une identité, espaces séparés ; nav limitée |
| `FeedbackPanel` | offline, conflict, pending payment, policy blocked | prochaine action réelle et message FR/EN |

## 6. Quatre écrans de référence haute fidélité

1. `S01` — Accueil acheteur : recherche en haut, catégories sobres, collection/présentation éditoriale, offres de catégories diverses, point d'entrée vers « Exprimer un besoin ». Aucun classement payant ou recommandation prétendument personnalisée sans données.
2. `S07` — Fiche offre : image dominante, variante, montant/devise, disponibilité déclarée, vendeur, frais connus/à confirmer, conditions, action admissible. Ancien lien ouvre état actuel.
3. `S03` — Exprimer un besoin : saisie manuelle prioritaire, aide IA explicite avec confirmation, budget indicatif, territoire, caractéristiques, consentement, publication ; ne pas inventer le budget.
4. `S20` — Tableau vendeur : « À faire » avant statistiques décoratives, ventes internes/externes distinguées, commandes, demandes pertinentes, stocks, boutique active visible, actions rapides ; valeurs de la démo uniquement fictives.

**Portée exacte du lot :** les autres écrans du blueprint sont désormais **spécifiés écran par écran** dans `UX_UI_Specification_Finale_V1_0.md`, mais ils ne sont pas tous dessinés en haute fidélité. Le prototype de parcours complet est une simulation ; la démo premium HTML couvre les quatre écrans maîtres. La déclinaison Flutter définitive, les preuves Android et la QA visuelle restent des tâches de construction.

## 7. Règles FR/EN

Traduire les messages de la plateforme dans la locale sélectionnée, pas afficher les deux langues dans le même bouton. Données créées par acheteurs/vendeurs conservées dans leur langue ; aucune traduction IA silencieuse. Les prix, devises et engagements restent identiques après bascule FR/EN. Même `offer_id` et même version des conditions. Versionner langue du contrat accepté. Systématiquement tester libellés longs EN, termes métier FR et taille de police Android à 200 %.

## 8. QA visuelle et fonctionnelle / conditions de passage

- [ ] 4 écrans validés visuellement FR clair, FR sombre, EN clair, EN sombre (16 configurations) ; téléphone étroit 360dp et écrans 430dp.
- [ ] Mode système suit OS ; mode manuel ne se perd pas à la navigation.
- [ ] Visibilité texte, boutons, focus et statuts vérifiée sur mobile réel et outils de contraste ; ne jamais se baser uniquement sur la planche générée.
- [ ] `S03` sans IA reste complet ; l'utilisateur corrige le résultat IA avant publication.
- [ ] `S07` prix et stock actuels ; paiement absent si corridor inactif ; démo n'invente aucune transaction.
- [ ] `S20` une vente extérieure n'est pas un encaissement PSP ; une marge incomplète est étiquetée.
- [ ] Aucun logo de marchand réel, avis réel, badge « vérifié », revenu authentique ou promesse contractuelle copiés d'un exemple visuel.
- [ ] Écrans de support, erreurs, numérique et vendeur à décliner avec mêmes tokens avant production.

## 9. Registre final de décision et exécution

| Sujet | État |
|---|---|
| Direction éditoriale premium vert/ivoire/nuit/champagne | **Approuvée par le fondateur sur les images de référence** |
| Palette HEX et métriques ci-dessus | **Spécification proposée pour implémentation ; réajustements accessibles si QA l'exige** |
| Thèmes clair/sombre + système | **Obligatoires** |
| Français/anglais complet de l'UI | **Obligatoires** |
| Outil IDE Cursor | **Non imposé / exclu comme choix de travail du fondateur** |
| Nom commercial, logo, contrat PSP, pays activés, tarification | **Non fixés** |
| Application Android ou POC exécutés | **Non encore** |

**Point de reprise final :** démarrer les POC et le backlog du pack ; utiliser `UX_UI_Specification_Finale_V1_0.md` pour toutes les variantes de chaque Screen ID. Ne pas refaire l’idéation ou rediscuter la palette hors anomalie QA.


## 10. Convention de design finale complémentaire

- Nomenclature sémantique obligatoire : aucune couleur HEX directement dans un écran métier ; maps de tokens clair/sombre.
- États d'action : primaire (une par section), secondaire, destructif avec confirmation, désactivé motivé, en cours avec prévention double action.
- Typographie : sérif pour accroche éditoriale uniquement, sans-sérif pour prix, formulaires, transactions, badges, tableaux et montants.
- Photos de produits de toutes catégories : privilégier les biens ordinaires et le numérique, en plus des références esthétiques premium ; ne jamais copier logos, allégations de confiance, taux de croissance ou offres d’exemple dans le produit réel.
- Livrables visuels de référence : `Demo_Premium_4_Ecrans.html`, `Prototype_Parcours_Complets_Premium.html` (simulations), images d'inspiration du sous-dossier `References_visuelles/`.
- Un contraste annoncé sur quelques couples de tokens ne valide PAS les 4×2 combinaisons de tous les écrans ; test visuel sur Android et vérification automatisée restent nécessaires.
