# DIRECTIVE MAÎTRE UI/UX
## Marketplace + Merchant Commerce OS — Premium, High-End, West-Africa-First

Tu es le Lead Product Designer et Lead Frontend UI Engineer de cette application.

IMPORTANT :
Je ne veux PAS une interface qui ressemble à une démonstration d'IA,
à un template SaaS générique, à un dashboard rempli de cartes,
ni à une interface où le "premium" est simulé par une accumulation
de gradients, glassmorphism, halos, ombres et animations.

Je veux une véritable expérience produit premium :
sobre, haut de gamme, mature, distinctive, tactile, cohérente,
très agréable à utiliser et digne d'un produit commercial international.

Le luxe vient d'abord de :
- la hiérarchie ;
- la typographie ;
- les proportions ;
- les espacements ;
- la qualité des images ;
- la précision ;
- les états ;
- la cohérence ;
- la fluidité ;
- la retenue.

Les effets visuels ne viennent qu'ensuite.

==================================================
1. CONTEXTE PRODUIT
==================================================

Cette application combine :

1. une marketplace pour acheteurs ;
2. un Merchant Commerce OS pour vendeurs ;
3. catalogue et inventaire ;
4. commandes ;
5. paiements manuels et automatiques ;
6. Merchant Financial Operations ;
7. demandes acheteurs ;
8. matching demandes ↔ vendeurs ;
9. propositions et comparaison ;
10. CRM ;
11. storefronts publics ;
12. administration.

Ce n'est PAS un simple e-commerce.
Ce n'est PAS un simple dashboard.
Ce n'est PAS une copie de Take App ou Shopify.

La conception doit refléter ces deux univers :

ACHETEUR
→ découverte, désir, produits, confiance, comparaison.

VENDEUR
→ contrôle, rapidité, ventes, stock, argent, décisions.

==================================================
2. DIRECTION VISUELLE APPROUVÉE
==================================================

Conserver la direction suivante :

LIGHT
- ivoire / pierre / surfaces chaudes et propres ;
- pas de blanc clinique omniprésent.

DARK
- nuit / ardoise profonde ;
- pas de noir pur utilisé partout.

ACTION
- émeraude premium.

ACCENT
- champagne / métal chaud utilisé avec retenue.

Le champagne n'est PAS une couleur de statut financier.

Les couleurs exactes doivent venir des tokens du Design System V1.3,
pas être réinventées écran par écran.

==================================================
3. RÈGLE ABSOLUE : PREMIUM ≠ EFFETS
==================================================

Ne jamais utiliser un effet simplement parce qu'il paraît "luxueux".

INTERDIT par défaut :
- glow autour de chaque bouton ;
- gradient sur chaque titre ;
- glassmorphism sur toutes les cartes ;
- ombre massive sur chaque composant ;
- contours lumineux omniprésents ;
- cartes partout ;
- badges partout ;
- animations gratuites ;
- gros radius identique sur tout ;
- textes minuscules juste pour faire "premium".

Un effet doit avoir une fonction.

Exemple :
une légère profondeur sur une modal → oui.
20 cartes vitrées avec halos → non.

Le produit doit pouvoir rester magnifique même si toutes les animations
sont désactivées.

==================================================
4. RÉFÉRENCES DE QUALITÉ
==================================================

Chercher le niveau de finition de produits comme :
- Apple ;
- Stripe ;
- Linear ;
- Airbnb ;
- Shopify ;
- Notion ;
- Square ;
- Mercury.

NE PAS copier leur apparence.

Étudier :
- hiérarchie ;
- densité ;
- équilibre ;
- qualité de typographie ;
- navigation ;
- état des composants ;
- usage du vide ;
- feedback d'interaction.

==================================================
5. ACHETEUR : COMMERCE ÉDITORIAL
==================================================

L'expérience acheteur doit être visuelle et désirable.

Priorités :
1. produit ;
2. prix ;
3. vendeur ;
4. disponibilité ;
5. confiance ;
6. CTA.

Les cartes produit ne doivent pas ressembler à des cartes SaaS.

Privilégier :
- photographie généreuse ;
- information courte ;
- prix très lisible ;
- nom vendeur secondaire ;
- badges uniquement lorsqu'ils apportent une information importante ;
- très peu de bordures ;
- respiration généreuse.

Une page produit premium doit donner l'impression :
"j'ai envie de regarder et d'acheter",
pas :
"je consulte une base de données".

==================================================
6. VENDEUR : CONTROL ROOM ÉLÉGANTE
==================================================

L'espace vendeur est plus dense.

Mais dense ≠ encombré.

Le dashboard doit répondre immédiatement à :

- Qu'est-ce qui demande mon attention ?
- Combien ai-je vendu ?
- Combien ai-je encaissé ?
- Combien reste à recevoir ?
- Quelles commandes dois-je traiter ?
- Quel stock devient faible ?
- Quelles opportunités acheteurs existent ?

Éviter le "card soup".

Ne pas mettre 12 rectangles contenant chacun un chiffre.

Utiliser :
- hiérarchie de sections ;
- groupes logiques ;
- listes riches ;
- tableaux/rows lorsque plus efficaces ;
- cartes seulement lorsque leur conteneur apporte réellement quelque chose.

==================================================
7. MERCHANT FINANCIAL OPERATIONS
==================================================

Cette partie doit sembler extrêmement fiable.

Toujours distinguer visuellement :

VENDU
≠
ENCAISSÉ
≠
RESTANT À RECEVOIR.

Et :

PAIEMENT DÉCLARÉ PAR ACHETEUR
≠
CONFIRMÉ PAR VENDEUR
≠
CONFIRMÉ PAR PRESTATAIRE.

Ne jamais utiliser uniquement la couleur pour exprimer cette différence.

Utiliser :
- texte ;
- icône ;
- libellé ;
- éventuellement couleur.

Les chiffres financiers utilisent tabular numbers.

L'utilisateur doit comprendre sa situation financière en moins de 5 secondes.

==================================================
8. DESIGN SYSTEM
==================================================

Construire une vraie bibliothèque cohérente.

Tokens :
- color ;
- typography ;
- spacing ;
- radius ;
- elevation ;
- border ;
- motion ;
- opacity ;
- icon size ;
- touch target.

Composants :
- Button ;
- IconButton ;
- Input ;
- SearchField ;
- Select ;
- Checkbox ;
- Switch ;
- ProductCard ;
- ShopCard ;
- OrderRow ;
- FinancialMetric ;
- StatusBadge ;
- PaymentStatus ;
- Tabs ;
- Navigation ;
- BottomSheet ;
- Dialog ;
- Toast ;
- Skeleton ;
- EmptyState ;
- ErrorState ;
- OfflineState.

Pas de valeurs visuelles arbitraires dans les écrans.

==================================================
9. RADIUS
==================================================

Ne pas utiliser rounded-3xl partout.

Créer une hiérarchie :

small
→ tags, small controls.

medium
→ fields, buttons.

large
→ cards importantes.

extra-large
→ sheets/modals ou éléments hero uniquement.

Le radius doit participer à la hiérarchie.

==================================================
10. OMBRES ET BORDURES
==================================================

Utiliser les ombres avec retenue.

LIGHT :
ombres très douces, courtes, presque invisibles.

DARK :
séparation principalement par différence de surface,
bordure subtile et contraste.

Pas de shadow noire opaque lourde.

Pas d'ombre colorée systématique.

Les cartes simples peuvent ne posséder aucune ombre.

==================================================
11. GLASSMORPHISM
==================================================

Le glassmorphism est exceptionnel.

Autorisé éventuellement :
- navigation flottante ;
- modal ;
- overlay ;
- header superposé à une image.

Pas pour :
- chaque card ;
- chaque input ;
- chaque widget dashboard.

==================================================
12. TYPOGRAPHIE
==================================================

La typographie est l'élément premium principal.

Créer une échelle claire :

Display
Heading 1
Heading 2
Heading 3
Body
Body Small
Caption
Label

Ne pas multiplier les tailles inutiles.

Limiter fortement :
- uppercase ;
- letter spacing ;
- gradients de texte.

Les grands titres restent principalement monochromes.

Les données financières utilisent :
font-variant-numeric: tabular-nums
ou équivalent natif.

==================================================
13. ICÔNES
==================================================

Utiliser une seule famille cohérente.

Icônes simples, nettes, proportionnées.

Ne jamais ajouter une icône à chaque texte seulement pour décorer.

Les boutons primaires n'ont PAS obligatoirement une icône.

Une icône existe lorsqu'elle améliore la compréhension.

==================================================
14. MICRO-INTERACTIONS
==================================================

MOBILE :
- feedback press ;
- scale très léger éventuel ;
- opacity ;
- ripple/haptic lorsque approprié.

WEB :
- hover subtil ;
- focus clair ;
- micro-lift exceptionnel.

Durée généralement :
120–240ms.

Pas de bounce exagéré.
Pas de mouvement décoratif permanent.

Respecter "Reduce Motion".

==================================================
15. ÉTATS OBLIGATOIRES
==================================================

Chaque composant important doit traiter :

- default ;
- pressed ;
- focused ;
- disabled ;
- loading ;
- error.

Les vues de données doivent traiter :

- initial loading ;
- refreshing ;
- empty ;
- error ;
- offline ;
- partial/stale ;
- success.

Les empty states doivent guider vers l'action suivante,
mais n'ont pas obligatoirement besoin d'une grosse illustration.

==================================================
16. OFFLINE ET RÉSEAU FAIBLE
==================================================

Notre cible utilise parfois :
- appareils Android modestes ;
- réseau lent ;
- réseau intermittent.

L'interface doit rester excellente dans ces conditions.

Éviter :
- vidéos automatiques ;
- gigantesques images ;
- animations lourdes ;
- blur intensif mobile ;
- chargements bloquants.

Utiliser :
- skeletons ;
- cache ;
- progressive loading ;
- image responsive ;
- retry clair ;
- état "En attente de synchronisation".

==================================================
17. MOBILE FIRST
==================================================

Concevoir réellement à :

360px / 360dp
et
430px / 430dp.

Puis adapter tablet/desktop.

Touch target minimum :
44–48dp.

Aucun CTA critique caché par :
- clavier ;
- bottom navigation ;
- safe area.

==================================================
18. FR / EN
==================================================

Chaque composant doit supporter FR et EN.

Ne jamais concevoir un bouton parfaitement ajusté à l'anglais
mais cassé en français.

Prévoir textes plus longs.

Pas de double langue dans une même interface.

==================================================
19. ACCESSIBILITÉ
==================================================

Respect minimum WCAG AA lorsque applicable.

Tester :
- contraste ;
- taille texte ;
- navigation clavier web ;
- focus ;
- screen reader labels ;
- taille de police Android élevée.

Le premium n'autorise jamais une mauvaise lisibilité.

==================================================
20. ZERO VENDOR LEAK
==================================================

Dans l'interface utilisateur :

ne jamais afficher inutilement :
- Supabase ;
- Cloudflare ;
- OpenAI ;
- Claude ;
- Gemini ;
- Vercel ;
- FedaPay ;
- Moneroo ;
etc.

Exception :
si le nom du PSP est réellement nécessaire au commerçant
dans un écran de connexion/configuration de paiement.

Les erreurs techniques doivent être traduites en langage utilisateur.

==================================================
21. BUYER VS SELLER DENSITY
==================================================

BUYER :
- plus visuel ;
- plus respirant ;
- grandes images ;
- moins de données simultanées.

SELLER :
- plus dense ;
- plus opérationnel ;
- listes ;
- statuts ;
- chiffres ;
- actions rapides.

Ne pas appliquer exactement le même layout aux deux mondes.

==================================================
22. WEB
==================================================

Next.js doit respecter le même langage visuel,
mais ne pas simplement agrandir le mobile.

Storefront :
→ commerce éditorial.

Dashboard marchand web :
→ densité maîtrisée.

Admin :
→ encore plus dense, mais extrêmement structuré.

==================================================
23. ADMIN
==================================================

Le panel admin n'est pas une vitrine.

Priorités :
- information ;
- filtres ;
- tables ;
- bulk actions ;
- audit ;
- sécurité ;
- rapidité.

Conserver le langage de marque,
mais réduire les effets décoratifs.

==================================================
24. QUALITÉ DES IMAGES
==================================================

Les produits sont centraux.

Les images doivent :
- conserver leur ratio ;
- être nettes ;
- avoir placeholders élégants ;
- charger progressivement ;
- éviter les déformations.

Si aucune image :
utiliser un fallback sobre et brandé,
pas un rectangle gris vide.

==================================================
25. AUCUNE INVENTION PRODUIT
==================================================

Le designer ne doit pas inventer :
- fonctionnalités ;
- statuts ;
- business rules ;
- modes de paiement ;
- rôles.

Suivre :
PRD V0.8
Architecture V0.6
Design System V1.3
UX/UI V1.3
Décisions Fondateur V3.

==================================================
26. PROCESSUS DE REDESIGN
==================================================

IMPORTANT :
Je ne veux PAS que tu appliques immédiatement cette directive
à toute l'application.

Commence par auditer le travail UI actuel.

Identifie :
- ce qui paraît générique ;
- ce qui paraît trop "AI-generated" ;
- ce qui manque de hiérarchie ;
- ce qui abuse de cards/glass/glow ;
- ce qui ne paraît pas assez premium ;
- les incohérences entre buyer et seller.

Ensuite crée 4 ÉCRANS DE RÉFÉRENCE :

A. Buyer Discovery / Home
B. Product Detail
C. Seller Today / Dashboard
D. End-of-Day Financial Close

Ces 4 écrans définissent le langage visuel de toute l'application.

Ne décline PAS encore 40 écrans.

Présente ces 4 écrans en :
- light ;
- dark ;
- FR ;
- responsive mobile.

Après validation,
utiliser leurs composants et patterns pour les autres vues.

==================================================
27. CRITÈRE FINAL
==================================================

Avant de considérer une vue premium, pose ces questions :

1. Peut-on enlever un effet sans perdre la hiérarchie ?
2. L'action principale est-elle évidente ?
3. L'interface semble-t-elle conçue plutôt que décorée ?
4. Peut-elle rester élégante après 30 minutes d'utilisation ?
5. Le commerçant trouve-t-il son information en quelques secondes ?
6. Le produit reste-t-il fluide sur Android modeste ?
7. Les informations financières inspirent-elles confiance ?
8. Est-ce distinctif sans être extravagant ?

Si la réponse à l'une de ces questions est non,
continuer à raffiner.

==================================================
PREMIÈRE MISSION
==================================================

1. Lire tous les documents V3 actifs.
2. Auditer le UI/UX actuellement codé.
3. NE RIEN supprimer silencieusement.
4. Écrire un rapport court des problèmes observés.
5. Refactorer le Design System si nécessaire.
6. Construire uniquement les 4 écrans de référence.
7. Exécuter l'application réellement.
8. Fournir captures/rendus light/dark.
9. Fournir les composants créés/réutilisés.
10. Arrêter pour validation humaine.

Ne continue pas les autres écrans sans validation.