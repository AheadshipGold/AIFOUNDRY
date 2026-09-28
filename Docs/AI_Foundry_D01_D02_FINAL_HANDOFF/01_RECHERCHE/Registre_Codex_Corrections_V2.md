# REGISTRE CODEX — CONSTATS À CONSERVER ET CORRECTIONS V2

**Version : 1.0 — 28 septembre 2026**  
**Source :** évaluation Codex fournie par le fondateur le 27 septembre 2026.  
**Principe :** Codex est une revue externe utile, pas une autorité produit. Les réductions de vision non approuvées par le fondateur ne sont pas adoptées.

## A. Points retenus

1. **Vision complète ≠ ordre de construction.** Le dossier V1.1 décrivait un écosystème très large. V2 conserve la vision mais impose un ordre de réalisation et des portes de validation.
2. **Client et marché d'entrée à préciser.** Le fondateur a depuis clarifié : Bénin comme premier marché commercial, vendeurs/commerçants et acheteurs, particulièrement ceux utilisant réseaux sociaux et canaux informels ; extension pays par pays avec isolation de marché.
3. **Valeur vendeur indépendante du trafic marketplace.** Catalogue, stock, ventes physiques/sociales, commandes, CRM et boutique autonome doivent créer une utilité directe.
4. **Physique et numérique séparés opérationnellement.** Ils restent dans la même plateforme mais ne partagent pas les mêmes obligations de paiement/fulfillment.
5. **Modèle économique.** V2 retient comme hypothèse principale un SaaS freemium/paid/add-ons inspiré de Take App ; prix locaux non fixés.
6. **Design à tester sur vrai Android, faible réseau et usage pressé.** Le premium visuel demeure, mais vitesse, densité, contraste, gros tap targets et performance priment.
7. **Validation terrain.** Adoption réelle et retour volontaire doivent être mesurés ; une intention en entretien ne suffit pas.
8. **Références documentaires incohérentes.** Corriger les liens PRD/Architecture/UX/Backlog qui pointaient vers d'anciennes versions.

## B. Points non adoptés comme réduction produit

- Réduire D01+D02 à un simple outil de stock/catalogue : **REFUSÉ**.
- Supprimer l'administration complète : **REFUSÉ** ; l'administration reste centrale, mais son implémentation suit les fonctions activées.
- Supprimer l'acheteur, les demandes ou la marketplace D02 : **REFUSÉ**.
- Considérer les paiements intégrés comme forcément gérés par la plateforme : **REMPLACÉ** par merchant-owned payments.

## C. Anomalies documentaires vérifiées dans V1.1 et corrigées en V2

- `PRD_Construction_V0_6.md` ligne historique ~802 pointait vers `UX_UI_Specification_Finale_V1_0.md` et `Backlog_Final_V1_0.md` alors que V1.1 existait.
- `Backlog_Final_V1_1.md` ligne historique ~161 demandait encore de lire PRD v0.5, Architecture v0.3 et UX v1.0.
- `Architecture_Construction_V0_4.md` ligne historique ~12 se décrivait encore comme « cette v0.2 ».

V2 remplace ces références dans les documents actifs. Les anciennes versions restent dans `07_SOURCES_HISTORIQUES/HANDOFF_V1_1_COMPLET` comme preuve d'historique seulement.

## D. Questions toujours à prouver, pas à inventer

- volonté de payer et prix par marché ;
- fournisseurs de paiement réellement connectables par commerçant ;
- parcours KYC et responsabilité contractuelle des PSP ;
- taux de conversion des besoins acheteurs ;
- comportement de stock et ventes externes ;
- performance offline/low bandwidth ;
- catégories prioritaires au lancement ;
- conformité et canaux des produits numériques ;
- règles locales de marketplace/intermédiation et protection consommateur.
