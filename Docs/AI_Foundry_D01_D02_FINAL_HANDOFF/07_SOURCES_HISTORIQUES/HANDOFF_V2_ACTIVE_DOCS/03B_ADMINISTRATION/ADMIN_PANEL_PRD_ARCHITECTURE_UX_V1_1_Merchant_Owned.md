# DOMAINE CENTRAL — ADMINISTRATION & OPERATIONS DE PLATEFORME D01 + D02

**Version :** 1.1 — 28 septembre 2026 — Merchant-Owned Commerce Network  
**Statut :** spécification de référence pour construction, à intégrer au PRD, architecture, UX, backlog et tests. Fonctionnalités proposées en réponse à la demande explicite du fondateur d'un **panel admin sophistiqué**, de contrôle des permissions, utilisateurs, commerçants, produits, transactions et moyens de paiement. Les conditions réelles des prestataires/pays restent des portes d'activation externes.  
**Sources internes :** dossier d'idéation v0.9, PRD construction v0.5, architecture construction v0.3, UX finale v1.0, et correction du fondateur du 25 septembre 2026.  
**Règle de préséance :** ce module complète et précise les mentions sommaires de `FR-59`, O01–O03 et `UX-021` ; il ne retire aucune exigence acheteur/vendeur. Les numéros ADMIN-FR n'altèrent pas FR-01–FR-70.

## 0. Diagnostic de la lacune et positionnement

Le pack initial couvrait la gestion de la plateforme par **trois vues opérateur seulement**, sans spécification transverse suffisante des réglages, des permissions administratives, de la monétisation, des corridors de paiement et de la supervision globale. Il était donc **prêt comme base de construction acheteur/vendeur**, mais **pas complet au niveau de l'exploitation**. Ce module ferme la lacune *documentaire*. Aucun écran admin déployé, contrôle réellement exécuté ou contrat PSP signé n'en résulte automatiquement.

**Promesse :** depuis une console interne premium FR/EN et clair/sombre/système, le propriétaire de la plateforme et son équipe autorisée peuvent *observer*, *configurer*, *autoriser*, *restreindre*, *assister* et *auditer* tout ce qui relève effectivement de la plateforme, sans accès illimité secret aux comptes, sans prétendre modifier un paiement chez un PSP par simple clic et sans contournement de la loi ou des règles de distribution.

Trois univers liés, aux frontières fermes : `app client` (achat et vente), `plateforme back-end` (vérité métier et exécution), `console admin` (commandes autorisées et supervision). **Une console admin ne remplace pas la sécurité serveur** et ne doit pas être une section publique de l'APK acheteur/vendeur. Surface proposée : application web privée responsive sur domaine/sous-domaine dédié, avec backend autorisé ; interface adaptée mobile pour consultation/urgences, bureau recommandé pour opérations financières et audits complexes. L'APK Android public demeure le produit principal.

## 1. Principes de gouvernance incontournables

1. **Contrôle configurable ≠ omnipotence bancaire.** L'admin choisit les moyens *affichés et autorisés par notre plateforme* seulement lorsqu'un contrat, un corridor, les droits requis et une intégration le permettent. Il ne peut ni forcer un PSP à accepter un paiement, ni transformer `pending` en `confirmed` sans preuve, ni ignorer une règle Play.
2. **Deny by default.** Absence de configuration/éligibilité/proof = OFF pour vente réelle ; le mode catalogue/consultation peut rester actif quand il est sans risque.
3. **Deux types de OFF :** `stop_new` interdit les nouvelles opérations, mais conserve le traitement des commandes/payments existants ; `incident_freeze` stoppe les actes engageants du périmètre tout en conservant réconciliation, accès aux dossiers et procédures d'urgence. Aucun OFF ne supprime la preuve d'une opération antérieure.
4. **Une valeur opérateur n'est pas vérité financière.** L'interface n'affiche jamais « remboursé » sans confirmation autorisée du prestataire ou preuve de règlement dans le flux admis.
5. **Moindre privilège.** Le fondateur définit qui peut voir, proposer, approuver et exécuter. Même le propriétaire reçoit des avertissements et confirmations pour les actions graves ; les administrateurs n'héritent pas des données privées de tous les clients par défaut.
6. **Traçabilité non effaçable par UI.** Chaque mutation sensible écrit un événement append-only avec auteur, session, motif, version, valeurs expurgées avant/après, corrélation et résultat. Conservation paramétrée selon besoin légal ; secrets et documents intimes exclus des traces ordinaires.
7. **Évolution contrôlée.** Brouillon → validation → éventuellement seconde approbation → activation prévue/immédiate → observation → rollback vers une configuration antérieure *si compatible*, avec journal. Aucune publication sauvage de règles globales.
8. **Priorité des obligations existantes.** Suspendre vendeur/produit/pays/paiement n'efface pas automatiquement commande payée, remboursement, licence délivrée, preuve ou réclamation. Une file de résolution doit rester accessible.
9. **Un environnement n'est pas un autre.** Dev/staging/production isolés ; simulation PSP réservée à dev/staging ; les acteurs admin ne peuvent confondre la bascule d'environnement avec un bouton de production.
10. **Bilingue intégral et thème.** FR/EN ; système/clair/sombre ; aucune couleur unique pour indiquer suspension, risque ou paiement.

## 2. Organisation et rôles — RBAC + périmètre + approbation

**Rôles de départ recommandés (configurables ensuite) :**

| Rôle | Lecture / actions autorisées | Restrictions |
|---|---|---|
| `platform_owner` | Politique de gouvernance, membres admin, activation des modules et rapports consolidés, approbation des changements critiques | Pas de contournement silencieux des préconditions financières/contractuelles ; toutes actions sensibles auditées. |
| `operations_admin` | Comptes/boutiques, files opérationnelles, activation des fonctions non financières selon délégation | Ne gère ni ses propres droits élevés ni seul un PSP/clé/payout. |
| `merchant_reviewer` | Dossiers de vendeurs, documents nécessaires, états de vérification, suspension limitée | Ne voit pas les détails financiers non requis ; ne s'auto-approuve pas. |
| `content_moderator` | Produits, avis, demandes signalées, preuves pertinentes, mesures temporaires et appels | Ne confirme aucun paiement ni ne change les frais. |
| `finance_operator` | Transactions, remboursements, reversements, rapprochement, cas bloqués ; initie une intervention | Pas d'édition directe du ledger ; seuils et actes sensibles sous double contrôle. |
| `finance_approver` | Examine/autorise un acte financier selon périmètre/seuils | Ne valide pas sa propre demande, pas de clé PSP en lecture. |
| `support_agent` | Incidents attribués, réponse aux parties, consultation minimale nécessaire | Pas d'export global de PII, pas de changement de statut payé. |
| `growth_analyst` | Rapports agrégés, campagnes et métriques autorisées | PII masquées ; pas de changements opérationnels. |
| `tech_operator` | Santé services, files, feature flags techniques, incidents et retour arrière autorisé | Pas de lecture de secrets en clair ni de montant financier arbitraire. |
| `auditor_readonly` | Historique immuable, décisions et preuves expurgées | Aucune modification ni export non autorisé. |

**Matrice d'action, pas simple rôle de façade :** `resource`, `verb`, `scope` (global/pays/boutique/case), `field_mask`, `risk_level`, `requires_mfa`, `requires_second_approval`, `limit_amount`, `environment`, `expires_at`. En cas de cumul de rôles, refuser les incompatibilités de séparation des fonctions ; test d'auto-approbation négatif. Les droits de vendeurs (`shop_membership`) et droits admin (`admin_membership`) restent dans des domaines différents.

**Sécurité admin :** MFA renforcée obligatoire ; session courte/reauth pour fonds, privilèges, activation PSP ; notifications changement droits ; gestion des appareils/session ; révocation immédiate ; réponse aux incidents d'accès ; compte de secours limité et contrôlé avec justification, alerte et revue après usage. Pas d'identifiants admin partagés.

## 3. Modules du centre de commande — périmètre complet

### ADM-01 — Vue de supervision : « état du monde »

Tuiles actionnables et explicables : utilisateurs actifs, vendeurs en attente de contrôle, offres actives/suspendues, demandes en attente, commandes par état, encaissements PSP confirmés, reversements en attente, remboursements, incidents non résolus, droits numériques en échec, statut des corridors, taux d'erreur/intégrations, consommation IA, coûts et revenu *propre à la plateforme*. Dates, source et fraîcheur affichées. Toute métrique renvoie à une liste filtrée ; pas de faux revenu basé sur ventes externes déclarées. Alertes `critical/high/normal` avec propriétaire, accusé de prise en charge et historique.

### ADM-02 — Utilisateurs acheteurs et comptes

Recherche, filtres pays/état/role/date, fiche compte, activité et transactions visibles selon rôle, vérification des coordonnées si fournie, dossiers de support et consentements pertinents. États : `active`, `restricted`, `suspended`, `closed_pending_obligations`, `closed`. Actions avec motif : restreindre achats/annonces/messages, suspendre, réactiver, fermer selon obligations, aide récupération compte ; processus d'appel, export/rectification/suppression des données quand applicable ; jamais lire mots de passe, conversations privées sans justification/permission, ou usurper un compte silencieusement. Une suspension préserve commandes/éventuels droits et obligations légitimes.

### ADM-03 — Vendeurs, boutiques, vérifications et collaborateurs

Répertoire boutiques, propriétaires, rôles, catégorie, pays, statut de vente, performances et incidents factuels, documents KYC/KYB uniquement via accès nécessaire et sécurisé, horodatage de revue, périmètre de badge. Workflow `application → additional_info → verified_for_scope / rejected` avec expiration/revue. Commandes admin `pause_publication`, `pause_new_orders`, `freeze_payout_if_contract_allows`, `suspend_shop`, `restore` ; chacune a effets explicités sur annonces, commandes existantes, remboursement/accès numérique et vente extérieure enregistrée. Pas de « identité vérifiée = produits authentiques ».

### ADM-04 — Produits, catégories, offres, numérique et modération

Taxonomie FR/EN et attributs, catégories pays/canal, interdictions selon politique validée, règles publication, file signalements, détection doublons/abus, politiques de preuves, retraits temporaires/permanents, appel vendeur. Produits physiques, numériques et mixtes contrôlés séparément ; preuves droits numériques et politique licence ; retrait ne révoque pas automatiquement des droits acquis. Traçabilité de l'auteur et de la raison ; dépublication d'une offre ne falsifie pas l'historique des commandes.

### ADM-05 — Centre commandes et exécutions

Recherche par order ID, seller, buyer, corridor, statut paiement, obligation, date et incident ; chronologie non confondue `order/payment/fulfillment/incident`; plusieurs vendeurs = sous-commandes ; fournisseur B2B jamais exposé à l'acheteur retail. Opérations limitées : demande d'informations, marquage d'examen, médiation, escalade, annulation selon politique et état réel. Aucun bouton admin « terminé » qui efface une livraison non réalisée. Montant / devise / vendeur contractuel figés et visibles.

### ADM-06 — Centre de configuration des paiements (**central**)

Inventaire PSP + Play Billing lorsque applicable, adaptateur, état `not_configured`, `sandbox_only`, `verification_pending`, `eligible_disabled`, `enabled`, `degraded`, `paused`, `retired` ; méthode (`MTN MoMo`, autre wallet, carte, Play selon intégration), **sens de flux** (collecte / remboursement / reversement / abonnement), pays acheteur/vendeur, devise, catégorie physique/numérique/service, canal APK Play/web, profil vendeur, limites, frais et taxes paramétrées selon accord, capacité webhook/réconciliation et preuve contractuelle. Un moyen peut être actif pour collecte mais indisponible en remboursement ; afficher ces capacités distinctement. Le nom d'un PSP dans le catalogue ne vaut pas éligibilité effective.

**Activation = règle calculée, pas `payment_enabled = true`.** `eligible = contract_verified && provider_live_ready && seller_approved && buyer_country_allowed && seller_country_allowed && currency_supported && category_allowed && distribution_policy_satisfied && compliance_current && operational_health_ok && admin_switch_enabled`. Les composantes non applicables doivent être explicitement justifiées, pas automatiquement vraies. Une règle peut être restreinte pays/corridor/boutique et date de début/fin. Pas de code secret PSP en clair ; secrets stockés dans service sécurisé, saisie/rotation contrôlée sans restitution. Tester sandbox/routage avant GO LIVE. Double approbation pour activer prod, changer destination de fonds, commission sensible, clés/routage et gros remboursements.

**Désactivation d'urgence :** stop `new_payment_intents` dans le périmètre ; ne pas effacer transactions initiées ; callbacks, rapprochement et demandes de remboursement persistent ; l'UI annonce l'indisponibilité honnêtement. PSP dégradé : notifier, cesser proposition si risque réel, alternative **seulement éligible**, jamais redirection interdite d'achat numérique. L'admin peut configurer Play et ses catégories, **pas contourner sa politique**. Toute activation et tout refus de routage sont traçables.

### ADM-07 — Finance plateforme / Ledger / reversements / remboursements

Écrans distincts `transactions`, `reconciliation`, `payouts`, `refunds`, `chargebacks`, `platform_revenue`, `fees_and_costs`. Chiffre d'affaires vendeur, encaissement PSP, revenu commission/abonnement plateforme et fonds à reverser ≠ synonymes. Pas de solde fictif déduit des captures. Écritures compensatoires plutôt que modifier l'historique ; rapprochement par référence externe, devise et période ; événements PSP dupliqués idempotents ; anomalie triable et assignable. Remboursement `requested/approved/submitted/confirmed/failed/rejected` et reversement distinct. Autorisation conforme à la véritable capacité du PSP ; si remboursement manuel admis, exiger pièce et confirmation indépendante. Deux paires d'yeux sur changements monétaires sensibles ; aucun opérateur ne valide sa demande.

### ADM-08 — Plans, prix, commission, limites et économie

Configurer **après arbitrage commercial** plans vendeur, essais, fonctionnalités, tarifs par devise, commissions par catégorie/corridor, seuils, coupons éventuels, limites de stockage/IA, taxes et dates d'effet ; afficher impact en simulation avant activation ; conserver version tarifaire sur vente déjà acceptée. Pas de commission automatique sur ventes externes seulement enregistrées sauf modèle accepté expressément. Ne pas activer checkout d'abonnement numérique dans APK Play tant que règles exactes vérifiées. Résultats : marge plateforme après frais réels, coûts support/IA/fichiers, pertes, cohortes ; toute donnée incomplète signalée.

### ADM-09 — Pays, corridors, devises, livraison et disponibilité commerciale

Registre des pays de comptes/découverte, pays d'achats réels, relations transfrontalières, mode remise, transporteur/partenaire déclaré, frais, support, langue, devise et catégorie. Statuts `discoverable`, `seller_onboarding`, `transactions_disabled`, `physical_enabled`, `digital_enabled` et variantes ciblées. FR/EN partout, jamais conditionnés à un pays. Changer un corridor ne modifie pas rétroactivement les commandes conclues ; commandes en cours restent visibles et gérables. Politique locale/retrait/livraison/numérique et contrats enregistrés avec preuves et échéances.

### ADM-10 — Modules, feature flags et kill switches

Console de capacités par `global → pays/corridor → type de compte → boutique → cohorte`, avec prévalence restrictive des interdictions contractuelles et de sécurité. Flag d'expérience séparé du droit de commercialiser. Exemples : publication produit, création demande, IA d'aide, numériques, recherche, avis, promotions, ventes extérieures, fournisseurs, notifications, checkout physique, checkout numérique, nouveaux vendeurs. **Un flag OFF n'enlève pas silencieusement une fonction essentielle promise à un achat déjà confirmé.** Rollout ciblé, prévisualisation FR/EN, échéance, auteur, raison, état précédent, dernière modification et retour arrière. Aucune activation d'une capacité bloquée par une porte externe via simple flag.

### ADM-11 — Centre IA, fournisseurs, modèles et coûts

Cas d'usage autorisés, fournisseur/modèle actif par langue et usage, budget mensuel / par boutique / tâche, limite de volume, latence/erreurs, mode repli manuel ; prompt/version, règles sur PII, journaux expurgés, revue qualité, arrêt d'urgence IA sans arrêter achat/vente. L'IA propose des brouillons, pas des décisions d'argent, de légalité, de stock ou de vérification de vendeurs ; absence de résultat est affichée.

### ADM-12 — Service client, litiges, appels et arbitrage

Boîte unifiée dossiers acheteur/vendeur/catégorie/sevérité/statut, propriétaire d'incident, SLA internes candidats réglables après mesure, pièces autorisées, chronologie, message bilingue de plateforme, version des CGV, pièces expurgées ; procédures de recours pour suspension/remboursement/modération ; décisions motivées et notification ; escalade finance/juridique/sécurité. Aucun agent support ne doit agir sur une transaction par l'édition d'un statut de base.

### ADM-13 — Messages, notifications, éditorial FR/EN et contenu plateforme

Modèles de notifications transactionnelles, emails, aide, politique, pages statiques, messages de maintenance, FAQ, bannières, version FR et EN, version acceptée, possibilité d'aperçu clair/sombre/Android/web ; ciblage conforme au consentement. Pas de diffusion marketing confondue avec notification transactionnelle ; pas d'envoi à tous sans prévisualisation, autorisation et limite anti-spam.

### ADM-14 — Rapports, insights et exports

Volumes et qualité utilisateurs, boutiques actives, offre/demande, propositions acceptées, conversion par étape, incidents, temps de réponse, GMV **distinct** revenu plateforme, paiements confirmés, reversements, chargebacks, stockage, IA, coûts/transaction ; filtres et export limité au rôle, masquage de données personnelles, événements de téléchargement audités ; chiffres datés, sourcés et pas de certitude causale fictive.

### ADM-15 — Santé système, logs, jobs, incidents et maintenance

PSP webhook age/failures, queue retry, base/storage/error rates, réconciliation due, entitlements manquants, jobs bloqués, latence, appels IA, disponibilité pages, lien Android, sauvegardes et restauration testées. Files d'alertes, responsable, accusé et escalade ; `read_only_maintenance`, `pause_new_orders`, `pause_provider`, `pause_digital_checkout`, `pause_AI` séparés ; exécution sans double traitement. Journal des déploiements/config versions et feuille d'incident. Ne pas afficher secrètement un service en panne comme disponible.

### ADM-16 — Centre de gouvernance, rôles et journal

Invitations/suppression admin, rôles, sessions/MFA, autorisations, changement de portée, approbations croisées, journal append-only, comparaison diff config, date d'expiration des preuves PSP, contrôle accès exports, inventaire des secrets par *référence* non valeur, politiques conservation/privacy, opérations de sauvegarde/reprise. L'admin ne peut effacer son propre audit ni désactiver toute traçabilité via UI ; journaux protégés hors de sa surface de modification ordinaire.

## 4. Navigation UX haute classe — console dédiée

**Identité visuelle :** reprendre le Design System Premium v1.1 ; surfaces bureau et tablette adaptées, hiérarchie forte, typographie sans-serif pour données/tabulaires, fond ivoire/nuit/émeraude avec champagne parcimonieux, focus et contrastes vérifiés ; apparence `system/light/dark`, FR/EN intégral. La console n'est pas un clone mobile acheteur ni un empilement de dashboards ; tâches et exception avant décoration. Aucune iconographie « paiement sûr » sans preuve.

**Navigation proposée :**

```text
Vue d'ensemble                   A01 Dashboard / Santé / Alertes
Personnes                        A02 Utilisateurs / Acheteurs
Commerces                        A03 Vendeurs / Boutiques / KYB
Catalogue & contenu              A04 Catégories / Offres / Modération
Commerce                         A05 Commandes / Fourniture / Incidents
Finance                          A06 Transactions & Réconciliation
                                 A07 Reversements & Remboursements
                                 A08 Revenus / Abonnements / Commissions
Paiements & Couverture           A09 PSP / Moyens / Éligibilité / Couloirs
                                 A10 Pays / Devises / Livraisons
Configuration produit            A11 Modules / Feature Flags
                                 A12 IA / Modèles / Budgets
                                 A13 Notifications / Traductions / Politiques
Support                          A14 Litiges / Appels / Centre de réponses
Analyses                         A15 Rapports / Exports
Sécurité & exploitation          A16 Santé / Files / Maintenance
                                 A17 Équipe admin / Rôles / Approbations
                                 A18 Audit / Versions / Accès
```

**Fiche écran obligatoire** (pour A01–A18) : intention, permission, objet(s), filtres, données, actions, confirmation, statut, état vide/chargement/échec, texte FR/EN, thème clair/sombre, accessibilité, journal, lien ADMIN-FR/test. Nav cachée pour un rôle = confort UX ; le serveur refuse également l'opération.

### Parcours admin majeurs

**P-ADMIN-01 Activer un nouveau moyen de paiement :** découvrir adaptateur → config non secrète et secret côté coffre → preuve contrat/corridor/canal/produit/remboursement/reversement → sandbox → rapport vérifié → proposition de config versionnée → approbation séparée → activation limitée → surveillance → généralisation ou rollback ; échec à n'importe quelle porte = OFF sans option de paiement mensongère à l'acheteur.

**P-ADMIN-02 PSP en panne :** alerte → pause des **nouvelles** transactions du périmètre → le client voit le moyen indisponible → commandes en cours et callbacks toujours enregistrés → autre route éligible si disponible → rapprochement → levée par acteur autorisé après contrôle.

**P-ADMIN-03 Vendeur problématique :** signalement → revue des éléments nécessaires → mesure proportionnée (annonces/new orders/payout selon contrat) → notification et recours → stock historique, commandes payées et litiges toujours suivis → levée si conditions réunies.

**P-ADMIN-04 Demande de remboursement :** dossier + identité/transaction → politique + capacité PSP → finance initie → autre acteur approuve au besoin → PSP confirme ou traitement manuel documenté → ledger compensatoire → acheteur/vendeur informés ; jamais `pending → refunded` par seule action UI.

**P-ADMIN-05 Bascule global numérique :** catalogue numérique peut rester consultable selon politique ; nouveau checkout Play suspendu si conformité/capacité en défaut ; commandes payées, licences existantes et support restent gérables ; retour conditionné aux portes de production.

**P-ADMIN-06 Changement plan ou commission :** brouillon avec simulation revenus/vendeurs touchés → version + date d'effet → approbation + notification selon termes applicables → nouvelles opérations seulement → historique des commandes et prix acceptés préservés.

**P-ADMIN-07 Incident de sécurité :** alerte → limitation ciblée → révocation sessions/secrets depuis systèmes appropriés → audit préservé → obligations existantes accessibles pour gestion → restauration vérifiée → compte rendu.

**P-ADMIN-08 Réclamation acheteur en FR, vendeur en EN :** réponse plateforme traduite via modèles validés, texte libre original conservé, version accord consultable, décisions identiques dans les deux langues.

## 5. Modèle de données et API — extensions de l'architecture

**Entités nouvelles ou explicitées** (champs minimum, à adapter avec migrations) :

| Entité | Champs/relations essentiels | Invariant |
|---|---|---|
| `admin_membership` | user_id, role_id, scope, state, granted_by, expiry | indépendant de shop membership ; révocable |
| `admin_role_permission` | role/action/resource/scope/limit/approval | deny-by-default et séparation des fonctions |
| `admin_session_security` | actor_id, MFA state, last_step_up, session_revoked | contrôle serveur, aucune confiance dans local storage |
| `admin_action_request` | actor, type, target, policy/config version, reason, evidence_ref, status | procédure avant effet externe |
| `admin_approval` | request, approver, decision, time, independence_check | initiateur ≠ approbateur si exigé |
| `admin_audit_event` | event_id, actor, request_id, action, target, redacted_diff, result, occurred_at | append-only; admin UI ne le supprime pas |
| `platform_config_version` | scope, config_type, schema_version, before_hash, after_hash, status, effective_at | historique/rollback conditionnel |
| `feature_policy` | feature, scope, state, start/end, dependencies, version | aucune fail-open de compliance |
| `payment_capability` | provider, flow, countries, category, channel, currency, limits, proof refs, state | collecte/remboursement/payout séparés |
| `provider_health` | provider, method, observed_at, failures, incident, health | santé ne remplace contrat |
| `country_corridor_policy` | buyer/seller country, product/channel, logistics, tax/refund reference, state | route default off |
| `merchant_review_case` | shop, reviewer, scope, evidence, decision, expiry, appeal | badge précis, pas garantie d'articles |
| `moderation_case` | target, reporter, evidence, reason, decision, appeal | décision motivée, preuves protégées |
| `support_case` | order/shop/user, assigned_role, priority, events, resolution | historique non effacé |
| `operations_incident` | severity, impact_scope, owner, ack, actions, closure | traçabilité de crise |
| `platform_finance_entry` | ref paiement externe, devise, type, amount_minor, status, source | append-only ou compensations |
| `admin_export_job` | actor, scope, fields, file_expiry, purpose | export limité, trace, durée |
| `localised_policy` | policy_id, revision, FR/EN, effective_at, historical | la version acceptée persiste |

**Commandes d'API exemples (HTTPS admin exclusivement, validation côté serveur) :**

```text
GET    /admin/v1/overview
GET    /admin/v1/users?status=&country=
POST   /admin/v1/users/{id}/restrictions:propose
GET    /admin/v1/shops?review_state=
POST   /admin/v1/shops/{id}/review:decide
GET    /admin/v1/orders/{id}/timeline
GET    /admin/v1/payment-capabilities
POST   /admin/v1/payment-capabilities/config:propose
POST   /admin/v1/actions/{requestId}:approve
POST   /admin/v1/actions/{requestId}:execute
POST   /admin/v1/payment-capabilities/{id}:pause-new
GET    /admin/v1/finance/reconciliation
POST   /admin/v1/refunds/{id}:request
GET    /admin/v1/feature-policies
POST   /admin/v1/feature-policies:propose
GET    /admin/v1/incidents
POST   /admin/v1/incidents/{id}:acknowledge
GET    /admin/v1/audit?request_id=
```

**Contrat mutation sensible :** `request_id`, `idempotency_key`, authenticated actor, MFA/step-up, permission+scope, expected_config_version / optimistic lock, reason, source evidence, dry-run impact where applicable, approval state, server-side validation, audit atomic/outbox, response deterministic, monitoring. A stale config update gets `409 conflict`, not a silent overwrite. For refunds, asynchronous PSP confirmation controls `confirmed`; retries reuse an idempotency key. Exports privileged require justification, controlled expiry and optional approval.

**Séparation technique :** serveur privé admin isolé ou groupe de routes spécialisé ; jamais clé de service dans navigateur/Flutter ; RLS+GRANT pour toutes tables exposées, et permissions métier explicitement contrôlées *avant* toute opération avec clé élevée. Ne pas exposer `admin_membership` en écriture aux comptes. Une table de logs seule n'est pas une garantie de non-altération : permissions DB restreintes + export/tamper evidence/rétention appropriés.

## 6. Exigences fonctionnelles testables — ADMIN-FR-001 à ADMIN-FR-050

| ID | Exigence | Critère d'acceptation |
|---|---|---|
| ADMIN-FR-001 | Connexion admin distincte, MFA forte | compte client normal → 403 ; admin sans MFA → refus des actes administratifs |
| ADMIN-FR-002 | Rôles et périmètres | support ne peut modifier PSP, vendeur ne voit pas console |
| ADMIN-FR-003 | Créer/révoquer membres admin | révocation effective avant prochaine action |
| ADMIN-FR-004 | Séparation initiateur/approbateur | auto-approbation d'un acte financier risqué refusée |
| ADMIN-FR-005 | Journal de toute action sensible | qui/quoi/quand/pourquoi/issue/version traçables |
| ADMIN-FR-006 | Tableau santé et alertes | chaque alerte possède source/fraîcheur/propriétaire |
| ADMIN-FR-007 | Répertoire acheteurs/utilisateurs | filtres et masquage champs selon permissions |
| ADMIN-FR-008 | Restriction et suspension compte | les commandes et preuves historiques restent consultables |
| ADMIN-FR-009 | Demande de correction/export/effacement | état explicite et obligations de conservation documentées |
| ADMIN-FR-010 | Appel contre sanction compte | décision et communications historisées |
| ADMIN-FR-011 | Dossiers de boutiques | identité vendeur et entité boutique distinctes |
| ADMIN-FR-012 | Vérification vendeur ciblée | badge dit exactement ce qui a été vérifié et quand |
| ADMIN-FR-013 | Pause publication/nouvelles commandes/payout | scopes distincts et effets sur existants expliqués |
| ADMIN-FR-014 | Permissions collaborateurs et multi-boutiques | aucune permission admin héritée d'un rôle boutique |
| ADMIN-FR-015 | Modération annonces/demandes/avis | mesures motivées, recours possible |
| ADMIN-FR-016 | Taxonomie et règles de catégorie FR/EN | catégorie bloquée uniquement dans le périmètre configuré |
| ADMIN-FR-017 | Droits numériques et licences | suppression annonce ne détruit pas automatiquement droits acquis |
| ADMIN-FR-018 | Recherche/chronologie commande | paiement, exécution et incident sont distincts |
| ADMIN-FR-019 | Supervision commandes en anomalie | paiement confirmé mais non livré visible et assignable |
| ADMIN-FR-020 | Liste PSP et adaptateurs | state sandbox/production et capacités visibles séparément |
| ADMIN-FR-021 | Configuration méthodes/pays/devises/canaux | une option non éligible n'apparaît pas au checkout |
| ADMIN-FR-022 | Collecte/remboursement/reversement distincts | collecte active n'implique pas remboursement actif |
| ADMIN-FR-023 | Porte d'activation preuve/corridor | sans contrat ou Play admissible → impossible activer prod |
| ADMIN-FR-024 | Validation + version du changement PSP | auteur, approbateur et config avant/après traçables |
| ADMIN-FR-025 | Coupure d'urgence PSP ciblée | nouveaux paiements arrêtés, callbacks/anciens dossiers continuent |
| ADMIN-FR-026 | Alternative de paiement éligible | fallback n'affiche jamais PSP/canal interdit |
| ADMIN-FR-027 | Consultation paiements et preuve PSP | capture acheteur ne marque pas paid |
| ADMIN-FR-028 | Idempotence reconciliation/webhooks | double événement n'inscrit pas deux revenus |
| ADMIN-FR-029 | Workflow remboursement | demandé/accepté/soumis/confirmé/échoué distincts |
| ADMIN-FR-030 | Reversement et chargeback | soldes vendeur/plateforme séparés, traces consultables |
| ADMIN-FR-031 | Ledger à écriture compensatoire | audit ne modifie pas silencieusement le passé |
| ADMIN-FR-032 | Config plans/commissions versionnés | prix ancien de commande déjà acceptée conservé |
| ADMIN-FR-033 | Frais/coûts et marge plateforme | GMV ≠ revenu plateforme ; champs incomplets signalés |
| ADMIN-FR-034 | Corridor pays/boutique/canal/catégorie | visibilité catalogue possible sans checkout illégal |
| ADMIN-FR-035 | Livraison/retrait par zone | pas de garantie logistique non validée |
| ADMIN-FR-036 | Feature flags ciblés et auditables | globale OFF prime sur ciblage boutique ON si restrictive |
| ADMIN-FR-037 | Retour arrière configuration | version antérieure restaurée si compatible, journal conservé |
| ADMIN-FR-038 | Préservation obligations sous coupure | droit numérique et commande déjà payée restent gérables |
| ADMIN-FR-039 | Gouvernance IA / modèles / budgets | dépassement coupe IA, pas la saisie manuelle |
| ADMIN-FR-040 | Support et litiges assignables | cas ouvert persiste après suspension vendeur |
| ADMIN-FR-041 | Notifications et templates FR/EN | message critique traduit en langue choisie |
| ADMIN-FR-042 | Politiques légales versionnées | conditions d'achat acceptées retrouvables langue/version |
| ADMIN-FR-043 | Rapports contrôlés et export | chaque export affiche portée et journalise extraction |
| ADMIN-FR-044 | Santé jobs, PSP, stockage et IA | alerte déclenche responsabilité et action documentée |
| ADMIN-FR-045 | Mode maintenance / kill switches | OFF nouvelles actions sans supprimer traitement historique |
| ADMIN-FR-046 | Historique approbations admin | acteur ne s'attribue pas seul l'accès superadmin |
| ADMIN-FR-047 | Séparation dev/staging/prod | simulation PSP n'apparaît pas sur domaine prod |
| ADMIN-FR-048 | UX premium FR/EN clair/sombre | tâches sensibles accessibles et lisibles sur deux langues/thèmes |
| ADMIN-FR-049 | PII / secrets à accès minimal | compte sans permission ne voit ni données non nécessaires ni secrets |
| ADMIN-FR-050 | Rapport gouvernance de production | portes non levées = module concerné OFF avec cause et responsable |

## 7. Tickets de backlog — le panel commence dès la fondation, pas après le lancement

| Lot / ticket | Travail | Dépendances | Preuve de sortie |
|---|---|---|---|
| ADMIN-L0-01 | Modèle rôles admin, MFA, sessions, restrictions API | auth, schéma privé | non-admin 403, MFA, révocation |
| ADMIN-L0-02 | Audit append-only et request ID/approbations | commandes sensibles et outbox | refus auto-approbation + log complet |
| ADMIN-L0-03 | Registre pays/capacités PSP et feature policies default OFF | modèle pays/paiement | aucune route non prouvée active |
| ADMIN-L1-01 | Console shell premium FR/EN thème, menu selon rôle | Design System + auth admin | navigation A01–A18 maquette/test |
| ADMIN-L1-02 | Overview santé, alertes, assignation | métriques + logs | aucun KPI sans provenance |
| ADMIN-L2-01 | Utilisateurs, restrictions, recours | comptes + cas support | états historique conservés |
| ADMIN-L2-02 | Boutiques, KYB/KYC, vérification et sanctions | shop + documents privés | vendeur suspendu n'efface pas obligations |
| ADMIN-L2-03 | Modération/taxonomie/propriété numérique | offre/demandes/entitlements | retrait avec trace et recours |
| ADMIN-L3-01 | Centre commandes et litiges | order/payment/fulfillment | payé ≠ livré, multi-vendeur isolé |
| ADMIN-L3-02 | Centre PSP config/corridor et activation contrôlée | adaptateurs + preuves + approbations | méthode OFF si porte manquante |
| ADMIN-L3-03 | Finance ledger/reconcile/refunds/payouts | PSP + ledger | double webhook unique, double validation |
| ADMIN-L3-04 | Tarification/commission/plans | modèle économique validé + Play | changements non rétroactifs |
| ADMIN-L4-01 | Feature flags/kill switches | policy engine | disable new, previous obligations persist |
| ADMIN-L4-02 | IA et coût, modèles/fallback | IA provider + policy | IA coupée, saisie manuelle marche |
| ADMIN-L4-03 | Notifications/conditions FR EN | l10n + policy versions | bonne version au bon destinataire |
| ADMIN-L4-04 | Rapports, exports, sécurité et maintenance | instrumentation/permissions | données masquées + audit export |
| ADMIN-L5-01 | QA complète admin + audit indépendant | A01–A18 | tous ADMIN-T PASS, preuves |

**Ordre critique :** ADMIN-L0 (permissions/config/audit) démarre *avant ou en parallèle* des commandes sensibles ; la console visuelle détaillée peut suivre progressivement mais la possibilité de couper les nouvelles ventes et d'inspecter les dossiers doit exister avant la première transaction réelle. Aucun grand panneau facultatif « après lancement » pour gouvernance paiement.

## 8. Matrice de preuves et tests ADMIN-T01…ADMIN-T20

| Test | Manipulation | PASS |
|---|---|---|
| ADMIN-T01 | Acheteur accède console/API admin | 403 / aucun champ privé |
| ADMIN-T02 | Admin support lance activation PSP | 403 / refus côté serveur |
| ADMIN-T03 | Admin sans MFA tente action sensible | refus + événement |
| ADMIN-T04 | Finance initiateur approuve sa propre opération | refus séparation fonctions |
| ADMIN-T05 | Compte admin révoqué utilise token/session ancien | refus / session invalidée |
| ADMIN-T06 | Pays/méthode hors contrat activé via UI et API | impossible, raison précise |
| ADMIN-T07 | Collecte active mais refunds absents | aucun remboursement automatique promis |
| ADMIN-T08 | PSP coupé pendant `pending` | nouveaux paiements stoppés, callbacks anciens traités |
| ADMIN-T09 | Réception webhook dupliqué | unique transaction logique |
| ADMIN-T10 | Admin essaie confirmer paiement sans preuve PSP | refus, aucune écriture paid |
| ADMIN-T11 | Coupure catégorie numérique | checkout suspendu, droits achetés conservés |
| ADMIN-T12 | Vendeur suspendu ayant commandes payées | achat/historique/litige restent suivables |
| ADMIN-T13 | Double update config même version | second obtient conflit, pas écrasement |
| ADMIN-T14 | Off global + boutique on | refus nouvelle action dans périmètre |
| ADMIN-T15 | Modification commission après accord | commandes anciennes intouchées |
| ADMIN-T16 | Support exporte tout le fichier client | refus / masquage + audit |
| ADMIN-T17 | A/B vendeurs et admin périmètre pays limité | aucun accès excessif inter-boutiques/pays |
| ADMIN-T18 | FR/EN × light/dark/système A01…A18 + erreur | lisible, cohérent, pas données changées |
| ADMIN-T19 | Panne IA puis action utilisateur | mode manuel complet, logs/coûts imputables |
| ADMIN-T20 | Simulation prod/rollback/incident | version et conséquences explicites, audit et rapport |

**QA non réalisée à la rédaction** : les scénarios sont des exigences, pas des tests PASS. Conserver vidéos/captures, logs expurgés, IDs de test, rapports signés et anomalies. Tests PSP/Play en sandbox selon flux exact ; preuves partenaires, droit/fiscalité et traitement des données selon marchés envisagés.

## 9. Instructions au futur agent / ordre de lecture

1. Lire `00_LIRE_EN_PREMIER.md`, puis ce document avant de coder le modèle utilisateur/paiement/feature flags.
2. Étendre le PRD avec ADMIN-FR-001–050 et l'architecture avec les entités, contrôles et commandes ci-dessus ; ne jamais considérer trois vues O01–03 comme couverture suffisante.
3. Étendre l'UX aux A01–A18 sans copier d'identité premium de banque/luxe ou promesses factices. Le fondateur n'a pas encore validé des maquettes admin haute fidélité.
4. Construire les fondations ADMIN-L0, puis l'exploitation par domaines en parallèle du client, conformément aux dépendances.
5. Tester ADMIN-T01–20 et enregistrer les portes avant la première mise en service publique ; aucun PSP mis en production via un toggle seul.
6. Reporter explicitement : `documented`, `implemented`, `tested`, `production-eligible`, `enabled` comme statuts **différents**.

## 10. Références officielles à vérifier lors de la construction

- Google Play Payments Policy (les flux numériques et physiques n'ont pas les mêmes régimes) : https://support.google.com/googleplay/android-developer/answer/9858738?hl=fr
- Supabase Row Level Security (politiques, GRANT et clés privilégiées strictement serveur) : https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API keys et risques de clé privilégiée : https://supabase.com/docs/guides/getting-started/api-keys

**Ces références justifient des contraintes générales ; aucune ne constitue l'approbation contractuelle de notre configuration exacte ni un avis juridique.**


---
# ANNEXE V2 — GOUVERNANCE MERCHANT-OWNED

## A. Changement de responsabilité financière

Le panel admin ne doit plus supposer que la plateforme possède un ledger de dettes vendeurs ou qu'elle orchestre systématiquement des payouts. Les vues Finance sont séparées :

1. **Finance plateforme SaaS** : abonnements, Play Billing, web billing, add-ons, taxes/frais propres à notre société.
2. **Supervision paiements marchands** : état des connexions PSP, webhooks, incidents, références et capacités, sans accès arbitraire aux fonds marchands.
3. **Paiements manuels** : déclarations/confirmations vendeur et dossiers d'incident, jamais transformés en confirmation PSP.

## B. Nouveaux contrôles admin

- `A06 Merchant Payment Connections` : provider, shop, market, capabilities, health, KYC/connection state ; aucun secret visible.
- `A08 SaaS Billing & Plans` : Basic/Business/Enterprise, quota, add-ons, Play/web entitlement, grace/cancel.
- `A09 Provider Registry` : providers autorisés par marché et fonctions (collect/card/mobile-money/refund) ; default OFF.
- `A10 Markets` : country/currency/categories/fulfillment/integrations.
- `A11 Feature Flags` : custom domain, POS, CRM, WhatsApp Business, digital, booking, B2B, etc.
- `A13 Communication Integrations` : Meta/WhatsApp templates, consent, quotas, health.
- `A15 Analytics` : marketplace demand, merchant SaaS activation, plan conversion, no false GMV attribution.

## C. Actions interdites

- « déplacer » l'argent d'un marchand depuis l'admin sans API/contrat et permission explicites ;
- marquer provider-paid depuis un bouton arbitraire ;
- afficher une clé API secrète marchande ;
- activer un provider pour un marché non vérifié ;
- transformer une vérification d'identité en garantie produit ;
- diriger un user Play Bénin vers checkout SaaS externe depuis l'APK tant que non autorisé.

## D. Audit

Chaque changement plan/quota/provider/market/integration est versionné, avec before/after, acteur, raison et rollback lorsque possible. Toute consultation de données sensibles ou export marchand est auditée.
