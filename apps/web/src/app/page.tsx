"use client";

import React from "react";
import Link from "next/link";
import { DesignProvider, useDesign } from "../design-system/provider";
import "../design-system/styles.css";
import "./landing.css";

function LandingContent() {
  const { locale, setLocale, mode, setMode, theme } = useDesign();

  const isDark = theme === "dark";
  const isEn = locale === "en";

  const toggleTheme = () => {
    setMode(isDark ? "light" : "dark");
  };

  const toggleLocale = () => {
    setLocale(isEn ? "fr" : "en");
  };

  return (
    <div className="oj-landing" data-theme={theme}>
      {/* 1. ANNOUNCEMENT BANNER */}
      <div className="oj-banner">
        <span>
          ✨ <strong>Ojarket V3</strong> &mdash;{" "}
          {isEn
            ? "The Marketplace Redefined. Discover curated craftsmanship & merchant control."
            : "Le Marché Réinventé. Découvrez l'artisanat d'exception et la rigueur marchande."}
        </span>
        <Link href="/internal/references">
          {isEn ? "Open Live Suite →" : "Explorer la suite live →"}
        </Link>
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav className="oj-nav">
        <div className="oj-nav-inner">
          <Link href="/" className="oj-nav-logo" aria-label="Ojarket Home">
            <img
              src={
                isDark
                  ? "/brand/Ojarket_03_Compact_Wordmark_Centered_Dark_Transparent.png"
                  : "/brand/Ojarket_03_Compact_Wordmark_Centered_Transparent.png"
              }
              alt="Ojarket"
            />
          </Link>

          <ul className="oj-nav-links">
            <li>
              <Link href="/internal/references?screen=home" className="oj-nav-link">
                {isEn ? "Discover" : "Découvrir"}
              </Link>
            </li>
            <li>
              <Link href="/internal/references?screen=requests" className="oj-nav-link">
                {isEn ? "Custom Request" : "Exprimer un besoin"}
              </Link>
            </li>
            <li>
              <Link href="/internal/references?screen=seller" className="oj-nav-link">
                {isEn ? "Seller OS" : "Espace Vendeur"}
              </Link>
            </li>
            <li>
              <Link href="/internal/references?screen=cashbook" className="oj-nav-link">
                {isEn ? "Finance & Cashbook" : "Caisse & Finances"}
              </Link>
            </li>
            <li>
              <Link href="/internal/components" className="oj-nav-link">
                {isEn ? "Design System" : "Galerie UI"}
              </Link>
            </li>
          </ul>

          <div className="oj-nav-controls">
            <button
              onClick={toggleLocale}
              className="oj-ctrl-btn"
              title="Changer de langue / Change language"
            >
              🌐 {isEn ? "EN" : "FR"}
            </button>
            <button
              onClick={toggleTheme}
              className="oj-ctrl-btn"
              title="Basculer le thème / Toggle theme"
            >
              {isDark ? "🌙 Nuit" : "☀️ Clair"}
            </button>
            <Link href="/internal/references" className="oj-cta-btn">
              {isEn ? "Enter App →" : "Entrer sur le Marché →"}
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <header className="oj-hero">
        <div className="oj-hero-content">
          <div className="oj-hero-badge">
            <span />
            {isEn
              ? "West-Africa-First & International Commerce"
              : "Commerce Ouest-Africain & International de Prestige"}
          </div>

          <h1 className="oj-hero-title">
            {isEn ? (
              <>
                The Art of Commerce, <br />
                <em>The Discipline of the Market.</em>
              </>
            ) : (
              <>
                L’Élégance du Commerce, <br />
                <em>La Discipline du Marché.</em>
              </>
            )}
          </h1>

          <p className="oj-hero-desc">
            {isEn
              ? "Ojarket unifies an editorial marketplace for discerning buyers with an uncompromising Merchant Commerce OS for creators, ateliers, and independent traders."
              : "Ojarket fusionne une marketplace éditoriale pour acheteurs exigeants et un système d'exploitation commercial d'une rigueur absolue pour les créateurs, ateliers et commerçants indépendants."}
          </p>

          <div className="oj-hero-actions">
            <Link href="/internal/references?screen=home" className="oj-btn-primary">
              {isEn ? "Explore Collections (S01)" : "Explorer les Collections (S01)"}
            </Link>
            <Link href="/internal/references?screen=seller" className="oj-btn-secondary">
              {isEn ? "Merchant Control Room (S20)" : "Control Room Vendeur (S20)"}
            </Link>
          </div>
        </div>

        {/* HERO SPOTLIGHT PIECE */}
        <div className="oj-spotlight">
          <div className="oj-spotlight-pill">
            {isEn ? "Curated Craftsmanship" : "Création Artisanale"}
          </div>
          <img
            src="/reference-assets/market-tote.png"
            alt="Cabas Éditorial en Raphia et Cuir"
            className="oj-spotlight-photo"
          />
          <div className="oj-spotlight-meta">
            <div>
              <div className="oj-spotlight-tag">
                {isEn ? "Atelier Cotonou · Natural Fiber" : "Atelier Cotonou · Fibres & Cuir"}
              </div>
              <h3 className="oj-spotlight-name">
                {isEn ? "Daily Raphia & Cognac Leather Tote" : "Cabas Quotidien en Raphia & Cuir Cognac"}
              </h3>
            </div>
            <div className="oj-spotlight-price">
              {isEn ? "18,500 FCFA" : "18 500 F CFA"}
            </div>
          </div>
        </div>
      </header>

      {/* 4. VALUE PROPOSITION: DOUBLE UNIVERSE */}
      <section className="oj-section">
        <div className="oj-section-header">
          <div className="oj-section-tag">
            {isEn ? "Dual Experience Architecture" : "Deux Univers, Une Seule Exigence"}
          </div>
          <h2 className="oj-section-title">
            {isEn
              ? "Designed for Desire. Engineered for Control."
              : "Conçu pour le Désir. Taillé pour le Contrôle."}
          </h2>
          <p className="oj-section-desc">
            {isEn
              ? "Unlike generic dashboards or noisy marketplaces, Ojarket strictly separates discovery desire from merchant operational precision."
              : "Loin des dashboards encombrés ou des vitrines génériques, Ojarket séduit l'acheteur par la beauté et donne au marchand le contrôle chirurgical de ses ventes et de son argent."}
          </p>
        </div>

        <div className="oj-universe-grid">
          {/* BUYER CARD */}
          <div className="oj-universe-card">
            <div>
              <div className="oj-universe-icon">🛍️</div>
              <h3 className="oj-universe-heading">
                {isEn ? "The Buyer Journey: Editorial Commerce" : "L'Acheteur : Commerce Éditorial & Désir"}
              </h3>
              <p className="oj-universe-text">
                {isEn
                  ? "Generous photography, verified creator trust badges, and direct demand matching when the product does not yet exist."
                  : "Des visuels généreux, une mise en valeur noble des créateurs, et la possibilité unique d'exprimer un besoin sur-mesure."}
              </p>
              <ul className="oj-feature-list">
                <li className="oj-feature-item">
                  <span className="oj-feature-bullet">✓</span>
                  <span>
                    <strong>{isEn ? "Curated Discovery (S01)" : "Découverte Curatée (S01)"} :</strong>{" "}
                    {isEn ? "Pure editorial catalog without visual noise" : "Photographies nobles sans pollution visuelle"}
                  </span>
                </li>
                <li className="oj-feature-item">
                  <span className="oj-feature-bullet">✓</span>
                  <span>
                    <strong>{isEn ? "Custom Need Posting (S03)" : "Expression de Besoin (S03)"} :</strong>{" "}
                    {isEn ? "Find the unfindable with bespoke artisan proposals" : "Trouvez l'introuvable auprès d'artisans vérifiés"}
                  </span>
                </li>
                <li className="oj-feature-item">
                  <span className="oj-feature-bullet">✓</span>
                  <span>
                    <strong>{isEn ? "Honest Comparison (S06)" : "Comparateur Transparent (S06)"} :</strong>{" "}
                    {isEn ? "Zero hidden fees, transparent delivery timelines" : "Frais réels et délais connus avant tout engagement"}
                  </span>
                </li>
              </ul>
            </div>
            <Link href="/internal/references?screen=home" className="oj-btn-secondary">
              {isEn ? "Experience Buyer Space →" : "Explorer l'Espace Acheteur →"}
            </Link>
          </div>

          {/* SELLER CARD */}
          <div className="oj-universe-card">
            <div>
              <div className="oj-universe-icon">⚖️</div>
              <h3 className="oj-universe-heading">
                {isEn ? "The Merchant OS: The Elegant Control Room" : "Le Vendeur : La Control Room Élégante"}
              </h3>
              <p className="oj-universe-text">
                {isEn
                  ? "Actionable tasks first. Crystal-clear financial operations with absolute separation between sold, collected, and outstanding cash."
                  : "Les tâches d'abord, les chiffres ensuite. Une séparation comptable stricte entre ce qui est vendu, encaissé et restant à percevoir."}
              </p>
              <ul className="oj-feature-list">
                <li className="oj-feature-item">
                  <span className="oj-feature-bullet">✓</span>
                  <span>
                    <strong>{isEn ? "Actionable Today (S20)" : "Dashboard Aujourd'hui (S20)"} :</strong>{" "}
                    {isEn ? "Know what needs your attention in under 5 seconds" : "Comprendre vos priorités du jour en 5 secondes"}
                  </span>
                </li>
                <li className="oj-feature-item">
                  <span className="oj-feature-bullet">✓</span>
                  <span>
                    <strong>{isEn ? "Financial Traceability (S43)" : "Journal & Caisse (S43)"} :</strong>{" "}
                    {isEn ? "Mobile Money, cash, and bank rails without double ledger" : "Espèces, MoMo, Wave et banques tracés sans double saisie"}
                  </span>
                </li>
                <li className="oj-feature-item">
                  <span className="oj-feature-bullet">✓</span>
                  <span>
                    <strong>{isEn ? "Daily Close (S44)" : "Clôture de Caisse (S44)"} :</strong>{" "}
                    {isEn ? "Instant reconciliation with mandatory discrepancy notes" : "Rapprochement en un clic et justification des écarts"}
                  </span>
                </li>
              </ul>
            </div>
            <Link href="/internal/references?screen=seller" className="oj-btn-secondary">
              {isEn ? "Access Merchant Room →" : "Accéder à la Control Room →"}
            </Link>
          </div>
        </div>

        {/* FINANCIAL RECONCILIATION HIGHLIGHT BANNER */}
        <div className="oj-finance-banner">
          <div>
            <div className="oj-section-tag" style={{ textAlign: "left" }}>
              {isEn ? "West-African FinOps Integrity" : "Intégrité FinOps Ouest-Africaine"}
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px 0", color: "var(--text)" }}>
              {isEn
                ? "Sold ≠ Collected ≠ Outstanding."
                : "Vendu ≠ Encaissé ≠ Restant à recevoir."}
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {isEn
                ? "In local commerce, buyer-declared transfers require seller confirmation before cash is treated as secured. Ojarket enforces this truth at the core of every calculation."
                : "Dans le commerce de proximité, un transfert déclaré par l'acheteur exige une confirmation explicite du marchand avant d'être comptabilisé comme argent acquis. Ojarket grave cette vérité au cœur de son moteur."}
            </p>
          </div>

          <div className="oj-finance-metrics">
            <div className="oj-metric-box">
              <div className="oj-metric-label">{isEn ? "Sold (Orders)" : "Vendu (Commandes)"}</div>
              <div className="oj-metric-value">124 500 F</div>
            </div>
            <div className="oj-metric-box">
              <div className="oj-metric-label">{isEn ? "Collected (Cash)" : "Encaissé (Réel)"}</div>
              <div className="oj-metric-value highlight">98 000 F</div>
            </div>
            <div className="oj-metric-box">
              <div className="oj-metric-label">{isEn ? "Outstanding" : "Restant à percevoir"}</div>
              <div className="oj-metric-value" style={{ color: "var(--pendingFg, #AD8455)" }}>26 500 F</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE DIRECTORY (8 REFERENCE SCREENS) */}
      <section className="oj-section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="oj-section-header">
          <div className="oj-section-tag">
            {isEn ? "Live Experience Suite" : "Parcours Complets Déjà Opérationnels"}
          </div>
          <h2 className="oj-section-title">
            {isEn ? "8 Live Reference Screens" : "8 Écrans de Référence Construits"}
          </h2>
          <p className="oj-section-desc">
            {isEn
              ? "Direct access to the responsive, accessible prototypes compliant with the V1.3 Design System."
              : "Accédez directement aux interfaces interactives responsive créées et validées sous Playwright et Axe-core."}
          </p>
        </div>

        <div className="oj-screens-grid">
          {/* S01 */}
          <Link href="/internal/references?screen=home" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Buyer · S01" : "Acheteur · S01"}</div>
              <h4 className="oj-screen-name">{isEn ? "Discover" : "Découvrir"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Editorial catalog showcase with verified seller trust." : "Catalogue éditorial et catégories de créateurs."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S07 */}
          <Link href="/internal/references?screen=product" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Buyer · S07" : "Acheteur · S07"}</div>
              <h4 className="oj-screen-name">{isEn ? "Product Detail" : "Fiche Produit"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Dominant photo, variants, verified price & terms." : "Variantes, conditions et disponibilité sans ambiguïté."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S03 */}
          <Link href="/internal/references?screen=requests" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Buyer · S03" : "Acheteur · S03"}</div>
              <h4 className="oj-screen-name">{isEn ? "Express Need" : "Exprimer un besoin"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Bespoke custom request with pre-publish confirmation." : "Dépôt de besoin sur-mesure avec récapitulatif."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S06 */}
          <Link href="/internal/references?screen=compare" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Buyer · S06" : "Acheteur · S06"}</div>
              <h4 className="oj-screen-name">{isEn ? "Compare Offers" : "Comparer"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Structured comparison of seller proposals and fees." : "Comparatif structuré des devis et des délais."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S20 */}
          <Link href="/internal/references?screen=seller" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Merchant · S20" : "Vendeur · S20"}</div>
              <h4 className="oj-screen-name">{isEn ? "Today Dashboard" : "Aujourd'hui"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Actionable tasks, orders requiring attention, metrics." : "Tâches à traiter, alertes stock et opportunités."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S28 */}
          <Link href="/internal/references?screen=orders" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Merchant · S28" : "Vendeur · S28"}</div>
              <h4 className="oj-screen-name">{isEn ? "Orders Ledger" : "Commandes"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Strict separation between payment and fulfillment." : "Dissociation paiement et livraison."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S43 */}
          <Link href="/internal/references?screen=cashbook" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Merchant · S43" : "Vendeur · S43"}</div>
              <h4 className="oj-screen-name">{isEn ? "Cashbook & Journal" : "Caisse & Journal"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Chronological cash, mobile money and bank entries." : "Flux chronologiques MoMo, espèces et virements."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>

          {/* S44 */}
          <Link href="/internal/references?screen=close" className="oj-screen-card">
            <div>
              <div className="oj-screen-badge">{isEn ? "Merchant · S44" : "Vendeur · S44"}</div>
              <h4 className="oj-screen-name">{isEn ? "Daily Close" : "Clôture de Caisse"}</h4>
              <p className="oj-screen-desc">
                {isEn ? "Reconciliation, notes on discrepancy and seal." : "Comptage, justification des écarts et validation."}
              </p>
            </div>
            <span className="oj-screen-cta">{isEn ? "Open screen →" : "Voir l'écran →"}</span>
          </Link>
        </div>
      </section>

      {/* 6. INSTITUTIONAL FOOTER */}
      <footer className="oj-footer">
        <div className="oj-footer-inner">
          <div className="oj-footer-logo">
            <img
              src={
                isDark
                  ? "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
                  : "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png"
              }
              alt="Ojarket Master Wordmark"
            />
          </div>

          <p className="oj-footer-tagline">
            {isEn
              ? "Ọjà (Market in Yoruba) + Arket (Scandinavian Clarity). World-Class Commerce Engineered for West Africa and Global Horizons."
              : "Ọjà (Le Marché en Yoruba) + Arket (La Pureté Scandinave). Le commerce de classe mondiale pensé pour l'Afrique de l'Ouest et l'international."}
          </p>

          <ul className="oj-footer-links">
            <li>
              <Link href="/internal/references" className="oj-footer-link">
                {isEn ? "Live Prototypes" : "Prototypes Live"}
              </Link>
            </li>
            <li>
              <Link href="/internal/components" className="oj-footer-link">
                {isEn ? "Component Gallery" : "Galerie Composants"}
              </Link>
            </li>
            <li>
              <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="oj-footer-link">
                API NestJS (:3001)
              </a>
            </li>
          </ul>

          <p className="oj-footer-copy">
            &copy; 2026 Ojarket. {isEn ? "All rights reserved. Design System V1.3." : "Tous droits réservés. Design System V1.3."}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <DesignProvider>
      <LandingContent />
    </DesignProvider>
  );
}
