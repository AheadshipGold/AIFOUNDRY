# Références produit UI — état vérifié

Date : 30 septembre 2026. Branche : `codex/ui-design-system-v3`.

## Écrans construits

### Espace acheteur

- S01 Découvrir : recherche, catégories, composition éditoriale, photographie produit, entrée D02.
- S07 Fiche produit : image dominante, prix/devise, disponibilité déclarée, variante, vendeur, retrait/livraison et conditions versionnées.
- S03 Exprimer un besoin : saisie manuelle, quantité, budget facultatif, lieu, consentement et aperçu avant publication.
- S06 Comparer : prix, frais connus ou à confirmer, total connu, délai, disponibilité, validité et quantité partielle.

### Espace vendeur

- S20 Aujourd’hui : tâches avant chiffres, vendu/encaissé/restant séparés, commandes, stock et opportunités.
- S28 Commandes : paiement et exécution séparés, filtres et détail de démonstration.
- S43 Caisse & journal : encaissements confirmés, déclarations non encaissées, source vendeur/prestataire et flux chronologique.
- S44 Clôture : totaux calculés, ventilation, écart, note, revue obligatoire et confirmation simulée.

Toutes les valeurs, boutiques, personnes, références et transactions sont fictives. Les actions restent locales : aucune publication, commande, confirmation de paiement ou clôture backend n'est exécutée.

## Design et composants

Réutilisés : tokens V1.3, DesignProvider, Button, Select, SearchField, TextField, Checkbox, Dialog, Toast, Price, Badge, PaymentStatusBadge, PaymentSourceBadge, OrderStatusBadge, Loading, Skeleton et ErrorState.

Compositions ajoutées : `EditorialProduct`, `FinancialMetric`, `OrderRow`, sélecteur acheteur/vendeur, comparaison structurée, formulaire de demande, liste opérationnelle, journal chronologique et tableau de rapprochement responsive.

Une photographie fictive de cabas a été générée avec l'outil d'image intégré et enregistrée dans `apps/web/public/reference-assets/market-tote.png`. Prompt final : photographie catalogue éditoriale d'un cabas quotidien en raphia naturel, anses cuir cognac, fond pierre chaude, lumière douce, cadrage vertical 4:5, sans marque, texte, personne ni watermark.

## Vérifications réussies

- ESLint web : réussi.
- TypeScript web : réussi.
- Build Next.js de production : réussi ; route interne statique compilée, First Load JS 111 kB avant gzip.
- Tests unitaires Design System : 5/5 réussis.
- Lint et typecheck Design System/mobile : réussis après l'extension web.
- Playwright Edge : 9/9 scénarios réussis.
- Chaque écran : FR et EN ; clair et sombre ; largeurs 360, 430 et 1280 px.
- Contrôle de débordement horizontal à 360 px et taille de texte 200 % : réussi.
- Audit axe automatisé clair/sombre sur les huit écrans : aucune violation remontée dans les scénarios.
- Saisie de demande conservée après état d'erreur : réussi.
- Clôture désactivée avant revue et en mode offline ; confirmation locale après revue : réussi.
- `git diff --check` : réussi, hors avertissements de conversion LF/CRLF Windows.

Captures light/dark mobile/desktop : `Docs/UI_IMPLEMENTATION/captures/`. Les fichiers suivent `<screen>-<theme>-<width>.png`.

## Limites honnêtes

- Ce lot valide le navigateur Next.js, pas l'APK Android.
- Aucun appareil/AVD n'était disponible lors du lot Design System ; TalkBack, clavier natif, safe areas et performances Android modestes restent à exécuter.
- Les états refreshing/stale/offline de cette référence sont des simulations UI. Cache, synchronisation et résolution de conflit ne sont pas implémentés par ces écrans.
- L'audit automatisé ne remplace pas une revue humaine ni un test lecteur d'écran réel.
- Les autres écrans V3 restent décrits par les documents normatifs ; ils ne doivent pas être déclarés réalisés à partir de ces huit références.

## Accès local

En développement : `/internal/references`. La route retourne 404 en production par conception, comme la Component Gallery.
