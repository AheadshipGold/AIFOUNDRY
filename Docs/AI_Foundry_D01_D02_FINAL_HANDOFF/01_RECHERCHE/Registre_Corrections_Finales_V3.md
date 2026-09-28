# REGISTRE DES CORRECTIONS FINALES — V3

## Corrections issues de Codex conservées
- cohérence versions/références : corrigée dans les documents actifs V3 ;
- ordre d'implémentation explicite : backlog V1.3 ;
- Android modestes/réseau lent : design/tests V1.3 ;
- validation terrain : toujours ouverte ;
- vision complète ≠ tout construire simultanément : confirmé ;
- réduction à simple catalogue/stock : rejetée.

## Corrections découvertes après Handoff V2
- Design System V1.2 avait un header `Version 1.1` et refs PRD/architecture anciennes : corrigé V1.3 ;
- UX V1.2 citait PRD 0.6/architecture 0.4/design 1.1 : corrigé V1.3 ;
- stack Flutter/Supabase-all-in-one devenue obsolète après revue : remplacée par stack V3 ;
- Edge Functions Deno ne sont plus backend principal : NestJS devient source active ;
- rôle Supabase clarifié : PostgreSQL managé cible, remplaçable ;
- paiement vendeur automatique n'est plus présumé simple API-key onboarding ; UX non technique exigée ;
- Moneroo reclassé correctement comme orchestration pour notre billing web, non PSP marchand par défaut ;
- Merchant Financial Operations ajouté comme capacité centrale.

## Éléments historiques conservés
Les versions V2/V1.1 restent dans `07_SOURCES_HISTORIQUES`; elles ne doivent pas être données seules à un agent de build.
