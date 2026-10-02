"use client";

import React, { useState } from "react";
import Link from "next/link";
import { translations, Locale } from "@aifoundry/shared";
import "../../design-system/styles.css";
import "../landing.css";

interface CorridorRule {
  id: string;
  country: string;
  countryCode: string;
  currency: string;
  channel: string;
  isEnabled: boolean;
  minAmountMinor: number;
  maxAmountMinor: number;
  kycRequired: string;
  contractVerified: boolean;
}

interface ShopReview {
  id: string;
  name: string;
  owner: string;
  city: string;
  country: string;
  craft: string;
  status: "VERIFIED" | "PENDING_KYC" | "SUSPENDED";
  joinedDate: string;
  salesCount: number;
  documentType: string;
}

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  operator: string;
  role: string;
  time: string;
  ip: string;
  status: "SUCCESS" | "BLOCKED" | "REVIEW";
}

export default function AdminPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<
    "overview" | "shops" | "corridors" | "d02" | "finops" | "audit"
  >("overview");

  // Filters
  const [shopSearch, setShopSearch] = useState("");
  const [shopFilter, setShopFilter] = useState<string>("ALL");
  const [corridorSearch, setCorridorSearch] = useState("");

  const isDark = theme === "dark";
  const isEn = locale === "en";

  const [corridors, setCorridors] = useState<CorridorRule[]>([
    {
      id: "corr-01",
      country: "Bénin",
      countryCode: "BJ",
      currency: "XOF",
      channel: "MTN Mobile Money Direct",
      isEnabled: true,
      minAmountMinor: 10000,
      maxAmountMinor: 500000000,
      kycRequired: "Standard",
      contractVerified: true,
    },
    {
      id: "corr-02",
      country: "Bénin",
      countryCode: "BJ",
      currency: "XOF",
      channel: "Moov Money Direct",
      isEnabled: true,
      minAmountMinor: 10000,
      maxAmountMinor: 300000000,
      kycRequired: "Standard",
      contractVerified: true,
    },
    {
      id: "corr-03",
      country: "Bénin",
      countryCode: "BJ",
      currency: "XOF",
      channel: "Celtiis Cash",
      isEnabled: true,
      minAmountMinor: 10000,
      maxAmountMinor: 200000000,
      kycRequired: "Standard",
      contractVerified: true,
    },
    {
      id: "corr-04",
      country: "Côte d'Ivoire",
      countryCode: "CI",
      currency: "XOF",
      channel: "Wave / Orange Money",
      isEnabled: false,
      minAmountMinor: 50000,
      maxAmountMinor: 1000000000,
      kycRequired: "Renforcé (KYB)",
      contractVerified: false,
    },
    {
      id: "corr-05",
      country: "Togo",
      countryCode: "TG",
      currency: "XOF",
      channel: "T-Money Direct",
      isEnabled: false,
      minAmountMinor: 20000,
      maxAmountMinor: 400000000,
      kycRequired: "Standard",
      contractVerified: false,
    },
    {
      id: "corr-06",
      country: "International",
      countryCode: "INT",
      currency: "EUR/USD",
      channel: "Stripe Gateway Vendeur",
      isEnabled: false,
      minAmountMinor: 100000,
      maxAmountMinor: 5000000000,
      kycRequired: "Passeport + RCCM",
      contractVerified: false,
    },
  ]);

  const [shops, setShops] = useState<ShopReview[]>([
    {
      id: "shop-01",
      name: "Maison Laurent & Ganvié",
      owner: "Laurent Ganvié",
      city: "Cotonou",
      country: "Bénin",
      craft: "Maroquinerie d'Art",
      status: "VERIFIED",
      joinedDate: "12 Sep 2026",
      salesCount: 142,
      documentType: "RCCM + Certificat Maître Artisan",
    },
    {
      id: "shop-02",
      name: "Fonderie Royale d'Abomey",
      owner: "Maître Dah Kpassè",
      city: "Abomey",
      country: "Bénin",
      craft: "Bronze Cire Perdue",
      status: "VERIFIED",
      joinedDate: "15 Sep 2026",
      salesCount: 88,
      documentType: "Registre de Commerce + Attestation Royale",
    },
    {
      id: "shop-03",
      name: "Studio Djoliba Horlogerie",
      owner: "Amadou Touré",
      city: "Bamako",
      country: "Mali",
      craft: "Horlogerie Mécanique",
      status: "PENDING_KYC",
      joinedDate: "28 Sep 2026",
      salesCount: 14,
      documentType: "Passeport + Bail d'atelier",
    },
    {
      id: "shop-04",
      name: "Atelier Indigo Ouidah",
      owner: "Safiath Dossou",
      city: "Ouidah",
      country: "Bénin",
      craft: "Tissage & Teinture Végétale",
      status: "PENDING_KYC",
      joinedDate: "29 Sep 2026",
      salesCount: 3,
      documentType: "Carte Nationale d'Identité + Photos atelier",
    },
    {
      id: "shop-05",
      name: "Ébénisterie Sacrée Dassa",
      owner: "Koffi Mensah",
      city: "Dassa",
      country: "Bénin",
      craft: "Sculpture Bois d'Iroko",
      status: "SUSPENDED",
      joinedDate: "04 Août 2026",
      salesCount: 31,
      documentType: "Dossier incomplet (re-contrôle)",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    {
      id: "aud-01",
      action: "CORRIDOR_VERIFIED",
      target: "Bénin MTN MoMo Direct",
      operator: "platform_owner",
      role: "SUPERADMIN",
      time: "Aujourd'hui 02:20",
      ip: "192.168.1.42",
      status: "SUCCESS",
    },
    {
      id: "aud-02",
      action: "KYC_APPROVED",
      target: "Maison Laurent & Ganvié",
      operator: "merchant_reviewer",
      role: "COMPLIANCE",
      time: "Hier 23:45",
      ip: "10.0.4.11",
      status: "SUCCESS",
    },
    {
      id: "aud-03",
      action: "DENY_BY_DEFAULT_ENFORCED",
      target: "Wave / Orange CI (sans contrat)",
      operator: "system_security_gate",
      role: "AUTOMATION",
      time: "30/09/2026 21:15",
      ip: "127.0.0.1",
      status: "BLOCKED",
    },
    {
      id: "aud-04",
      action: "DAY_CLOSURE_SEALED",
      target: "Caisse Atelier #042 Alexandre",
      operator: "finops_engine",
      role: "AUDIT_LEDGER",
      time: "30/09/2026 19:00",
      ip: "10.0.8.2",
      status: "SUCCESS",
    },
  ]);

  const toggleCorridor = (id: string) => {
    setCorridors((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (!c.contractVerified && !c.isEnabled) {
            alert(
              isEn
                ? "Deny by Default Rule: Cannot activate corridor without verified legal and partner contract agreement."
                : "Règle Deny by Default : activation impossible sans contrat légal et convention partenaire vérifiée."
            );
            return c;
          }
          const nextState = !c.isEnabled;
          // Add audit entry
          setAuditLogs((a) => [
            {
              id: `aud-${Date.now()}`,
              action: nextState ? "CORRIDOR_ACTIVATED" : "CORRIDOR_DEACTIVATED",
              target: `${c.country} ${c.channel}`,
              operator: "platform_owner",
              role: "SUPERADMIN",
              time: "À l'instant",
              ip: "127.0.0.1",
              status: "SUCCESS",
            },
            ...a,
          ]);
          return { ...c, isEnabled: nextState };
        }
        return c;
      })
    );
  };

  const updateShopStatus = (
    id: string,
    status: "VERIFIED" | "PENDING_KYC" | "SUSPENDED"
  ) => {
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    setAuditLogs((a) => [
      {
        id: `aud-${Date.now()}`,
        action: `SHOP_STATUS_${status}`,
        target: `Boutique #${id}`,
        operator: "platform_owner",
        role: "SUPERADMIN",
        time: "À l'instant",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
      ...a,
    ]);
  };

  const formatPrice = (val: number, cur = "XOF") => {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(val) + ` ${cur}`;
  };

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      shopSearch === "" ||
      s.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
      s.owner.toLowerCase().includes(shopSearch.toLowerCase()) ||
      s.city.toLowerCase().includes(shopSearch.toLowerCase());
    const matchesFilter =
      shopFilter === "ALL" || s.status === shopFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCorridors = corridors.filter((c) => {
    return (
      corridorSearch === "" ||
      c.country.toLowerCase().includes(corridorSearch.toLowerCase()) ||
      c.channel.toLowerCase().includes(corridorSearch.toLowerCase())
    );
  });

  const pendingKycsCount = shops.filter((s) => s.status === "PENDING_KYC").length;
  const activeCorridorsCount = corridors.filter((c) => c.isEnabled).length;

  return (
    <div
      className={`oj-admin-app ${isDark ? "theme-dark" : "theme-light"}`}
      data-theme={theme}
    >
      {/* ==================== COMPACT TOPBAR ==================== */}
      <header className="oj-admin-topbar">
        <div className="oj-admin-topbar-left">
          {/* Toggle Sidebar Button */}
          <button
            className="oj-admin-toggle-btn"
            onClick={() => {
              if (window.innerWidth <= 1024) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            title={isEn ? "Toggle Sidebar" : "Réduire / Agrandir la barre latérale"}
          >
            {sidebarCollapsed ? "⇥" : "⇤"}
          </button>

          {/* Official Ojarket Logo */}
          <Link href="/" className="oj-admin-brand-wrap">
            <img
              src={
                isDark
                  ? "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
                  : "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png"
              }
              alt="Ojarket"
              className="oj-admin-brand-logo"
            />
            <span className="oj-admin-os-pill">ADMIN OS</span>
          </Link>

          {/* Security Badge */}
          <span
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: "var(--oj-color-subtle)",
              color: "var(--oj-color-action)",
              fontWeight: 700,
              display: "none",
            }}
            className="oj-desktop-badge"
          >
            🔒 Deny-by-Default ACTIF
          </span>
        </div>

        <div className="oj-admin-topbar-right">
          {/* Platform Role Pill */}
          <span
            style={{
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "20px",
              backgroundColor: "rgba(173, 132, 85, 0.15)",
              color: "var(--oj-color-accent)",
              fontWeight: 800,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>👑</span>
            <span className="oj-admin-role-text">PLATFORM_OWNER</span>
          </span>

          {/* Language Switch */}
          <button
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="oj-admin-toggle-btn"
            style={{ width: "auto", padding: "0 10px", fontSize: "11px", fontWeight: 700 }}
          >
            {locale === "fr" ? "FR" : "EN"}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="oj-admin-toggle-btn"
            title={isDark ? "Passer en mode jour" : "Passer en mode nuit"}
          >
            {isDark ? "☼" : "☾"}
          </button>

          {/* Storefront Link */}
          <Link
            href="/"
            className="oj-btn-secondary"
            style={{
              height: "34px",
              padding: "0 14px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            }}
          >
            <span>←</span>
            <span>{isEn ? "Store" : "Vitrine"}</span>
          </Link>
        </div>
      </header>

      {/* ==================== ADMIN BODY (SIDEBAR + MAIN) ==================== */}
      <div className="oj-admin-body">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="oj-admin-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Collapsible Sidebar */}
        <aside
          className={`oj-admin-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
            mobileSidebarOpen ? "open" : ""
          }`}
        >
          <div>
            {/* GROUP 1: PILOTAGE */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "Supervision" : "Pilotage & Supervision"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "overview" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("overview");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">📊</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Overview (A01)" : "Tableau de Bord"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "shops" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("shops");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">🏬</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Shops & KYC (A03)" : "Boutiques & KYC"}
                </span>
                {pendingKycsCount > 0 && (
                  <span className="oj-admin-badge warning">{pendingKycsCount}</span>
                )}
              </button>
            </div>

            {/* GROUP 2: COMMERCE & D02 */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "Bespoke & Commerce" : "Opérations D02 & Flux"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "d02" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("d02");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">✦</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Bespoke Requests (D02)" : "Demandes Sur-Mesure"}
                </span>
                <span className="oj-admin-badge">3</span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "corridors" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("corridors");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">🔒</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Payment Corridors (A06)" : "Corridors Financiers"}
                </span>
                <span className="oj-admin-badge success">{activeCorridorsCount}</span>
              </button>
            </div>

            {/* GROUP 3: FINANCES & CONTRÔLE */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "FinOps & Ledger" : "Finance & Grand Livre"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "finops" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("finops");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">💰</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "FinOps Cashbook (S44)" : "Caisse & FinOps"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "audit" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("audit");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">🛡️</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Audit Ledger (A07)" : "Grand Livre Immuable"}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="oj-admin-sidebar-footer">
            <div className="oj-admin-user-card">
              <div className="oj-admin-user-avatar">AD</div>
              <div className="oj-admin-user-info">
                <div className="oj-admin-user-name">Administrateur Chef</div>
                <div className="oj-admin-user-role">PLATFORM_OWNER</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="oj-admin-main">
          {/* ==================== COMPACT SECURITY BANNER ==================== */}
          <div className="oj-admin-compact-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>🔒</span>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {isEn
                  ? "Deny by Default Corridor Rule Active — Zero money movement permitted without verified merchant credentials & partner agreements."
                  : "Règle de Sécurité Deny-by-Default Active — Aucun mouvement financier n'est toléré sans agrément marchand vérifié."}
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                background: "rgba(255,255,255,0.2)",
                padding: "3px 8px",
                borderRadius: "4px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              PRD D-V3-007
            </span>
          </div>

          {/* ==================== TAB 1: OVERVIEW (A01) ==================== */}
          {activeNav === "overview" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Platform Overview & Health" : "Supervision Globale de la Plateforme"}</h1>
                  <p>
                    {isEn
                      ? "Consolidated transaction volume, active workshops, and infrastructure telemetry."
                      : "Volume d'affaires consolidé, ateliers actifs et télémétrie d'infrastructure."}
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "Gross Merchandise Volume" : "Volume Global d'Affaires"}</span>
                    <span className="oj-kpi-trend positive">↗ +28.4%</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
                    54 800 000 FCFA
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    {isEn ? "Total committed sales (30d)" : "CA engagé sur 30 jours"}
                  </small>
                </div>

                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "Active Workshops" : "Boutiques & Ateliers"}</span>
                    <span className="oj-kpi-trend positive">28 vérifiés</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {shops.length} Ateliers
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    Bénin (3), Mali (1), Côte d'Ivoire (1)
                  </small>
                </div>

                <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-accent)" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "KYC Pending Reviews" : "Dossiers KYC à Contrôler"}</span>
                    <span className="oj-kpi-trend negative">⚠ {pendingKycsCount} requis</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "var(--oj-color-accent)" }}>
                    {pendingKycsCount} Dossiers
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    {isEn ? "Action required by compliance" : "Validation requise"}
                  </small>
                </div>

                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "Active Payment Corridors" : "Corridors Ouverts"}</span>
                    <span className="oj-kpi-trend positive">3 / 6</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {activeCorridorsCount} Canaux
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    MTN MoMo, Moov, Celtiis
                  </small>
                </div>
              </div>

              {/* Service Health Telemetry Grid */}
              <div className="oj-admin-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 16px", fontFamily: "var(--oj-font-editorial)" }}>
                  {isEn ? "Platform Flow & Integration Health" : "Santé des Flux & Intégrations Plateforme"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>MTN MoMo Sandbox & Webhooks</strong>
                      <small style={{ color: "var(--oj-color-muted)" }}>Latence moyenne : 240ms</small>
                    </div>
                    <span className="oj-status-pill success">OPÉRATIONNEL</span>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>Moteur D02 IA Structuration</strong>
                      <small style={{ color: "var(--oj-color-muted)" }}>Pipeline V3 Gemini / Extraction</small>
                    </div>
                    <span className="oj-status-pill success">PRÊT</span>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>PostgreSQL & Grand Livre FinOps</strong>
                      <small style={{ color: "var(--oj-color-muted)" }}>Prisma Schema V3 ACID</small>
                    </div>
                    <span className="oj-status-pill success">CONFORME</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: SHOPS & KYC (A03) ==================== */}
          {activeNav === "shops" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Workshops & Merchant KYC (A03)" : "Boutiques & Modération KYC"}</h1>
                  <p>
                    {isEn
                      ? "Control verified status, examine legal trade certificates, and manage artisan onboarding."
                      : "Contrôlez les statuts marchands, examinez les registres de commerce et validez les maîtres artisans."}
                  </p>
                </div>
              </div>

              {/* Filter bar */}
              <div className="oj-admin-filter-bar">
                <div className="oj-admin-search">
                  <span className="oj-admin-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder={isEn ? "Search workshop, owner, city..." : "Rechercher un atelier, propriétaire, ville..."}
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {(["ALL", "PENDING_KYC", "VERIFIED", "SUSPENDED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setShopFilter(st)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: shopFilter === st ? 700 : 500,
                        border: "1px solid var(--oj-color-border)",
                        background: shopFilter === st ? "var(--oj-color-action)" : "var(--oj-color-surface)",
                        color: shopFilter === st ? "#FFFFFF" : "var(--oj-color-text)",
                        cursor: "pointer",
                      }}
                    >
                      {st === "ALL"
                        ? isEn ? "All" : "Tous"
                        : st === "PENDING_KYC"
                        ? isEn ? "Pending" : "En attente"
                        : st === "VERIFIED"
                        ? isEn ? "Verified" : "Vérifiés"
                        : isEn ? "Suspended" : "Suspendus"}
                    </button>
                  ))}
                </div>
              </div>

              {/* High density shops table */}
              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Workshop / Atelier" : "Atelier & Propriétaire"}</th>
                      <th>{isEn ? "Craft & Location" : "Savoir-faire & Ville"}</th>
                      <th>{isEn ? "Legal Credentials" : "Pièces Justificatives"}</th>
                      <th>{isEn ? "Sales" : "Ventes"}</th>
                      <th>{isEn ? "Status" : "Statut KYC"}</th>
                      <th style={{ textAlign: "right" }}>{isEn ? "Actions" : "Actions de Modération"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>{s.owner}</small>
                        </td>
                        <td>
                          <div>{s.craft}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>
                            {s.city}, {s.country}
                          </small>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                            📄 {s.documentType}
                          </span>
                        </td>
                        <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {s.salesCount} {isEn ? "orders" : "commandes"}
                        </td>
                        <td>
                          {s.status === "VERIFIED" ? (
                            <span className="oj-status-pill success">
                              ✓ {isEn ? "Verified Pro" : "Vérifié Pro"}
                            </span>
                          ) : s.status === "PENDING_KYC" ? (
                            <span className="oj-status-pill pending">
                              ⏳ {isEn ? "Pending Review" : "En attente"}
                            </span>
                          ) : (
                            <span className="oj-status-pill error">
                              ✕ {isEn ? "Suspended" : "Suspendu"}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {s.status !== "VERIFIED" && (
                              <button
                                className="oj-btn-primary"
                                style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                                onClick={() => updateShopStatus(s.id, "VERIFIED")}
                              >
                                {isEn ? "Approve Pro" : "Valider Pro"}
                              </button>
                            )}
                            {s.status !== "SUSPENDED" && (
                              <button
                                className="oj-btn-secondary"
                                style={{ height: "30px", padding: "0 10px", fontSize: "11px", borderColor: "rgba(180,44,62,0.4)", color: "#B42C3E" }}
                                onClick={() => updateShopStatus(s.id, "SUSPENDED")}
                              >
                                {isEn ? "Suspend" : "Suspendre"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: CORRIDORS (A06) ==================== */}
          {activeNav === "corridors" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Payment Corridors Governance (A06)" : "Corridors de Paiement & Deny-by-Default"}</h1>
                  <p>
                    {isEn
                      ? "Deny-by-Default security matrix: every payment channel requires an explicit contractual whitelist."
                      : "Matrice de sécurité Deny-by-Default : tout canal de règlement requiert un agrément contractuel vérifié."}
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="oj-admin-filter-bar">
                <div className="oj-admin-search">
                  <span className="oj-admin-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder={isEn ? "Filter by country, channel..." : "Filtrer par pays, canal..."}
                    value={corridorSearch}
                    onChange={(e) => setCorridorSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Corridors table */}
              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Country / Territory" : "Pays & Territoire"}</th>
                      <th>{isEn ? "Channel & Operator" : "Canal de Paiement"}</th>
                      <th>{isEn ? "Currency" : "Devise"}</th>
                      <th>{isEn ? "Limits (Min / Max)" : "Plafonds Transactionnels"}</th>
                      <th>{isEn ? "Contract Agreement" : "Contrat Partenaire"}</th>
                      <th>{isEn ? "Status" : "État du Corridor"}</th>
                      <th style={{ textAlign: "right" }}>{isEn ? "Security Switch" : "Bascule de Sécurité"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCorridors.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.country}</strong>
                          <span style={{ marginLeft: "6px", fontSize: "11px", color: "var(--oj-color-muted)" }}>
                            ({c.countryCode})
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.channel}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>KYC requis : {c.kycRequired}</small>
                        </td>
                        <td style={{ fontWeight: 700 }}>{c.currency}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums", fontSize: "12px" }}>
                          {formatPrice(c.minAmountMinor / 100, c.currency)} — {formatPrice(c.maxAmountMinor / 100, c.currency)}
                        </td>
                        <td>
                          {c.contractVerified ? (
                            <span style={{ color: "var(--oj-color-action)", fontWeight: 700, fontSize: "12px" }}>
                              ✓ Signé & Conforme
                            </span>
                          ) : (
                            <span style={{ color: "#7A4A12", fontWeight: 700, fontSize: "12px" }}>
                              ⚠ Contrat Non Vérifié
                            </span>
                          )}
                        </td>
                        <td>
                          {c.isEnabled ? (
                            <span className="oj-status-pill success">{isEn ? "ACTIVE" : "ACTIF"}</span>
                          ) : (
                            <span className="oj-status-pill pending">{isEn ? "DENIED / BLOCKED" : "VERROUILLÉ"}</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className={c.isEnabled ? "oj-btn-secondary" : "oj-btn-primary"}
                            style={{
                              height: "30px",
                              padding: "0 12px",
                              fontSize: "12px",
                              background: c.isEnabled ? "transparent" : undefined,
                            }}
                            onClick={() => toggleCorridor(c.id)}
                          >
                            {c.isEnabled ? (isEn ? "Deactivate" : "Désactiver") : (isEn ? "Activate" : "Activer")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: D02 BESPOKE (D02) ==================== */}
          {activeNav === "d02" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Bespoke Requests & Quotes (D02)" : "Supervision des Demandes Sur-Mesure"}</h1>
                  <p>
                    {isEn
                      ? "Track buyer demand structuring, workshop response rates, and awarded orders."
                      : "Suivi des demandes acheteurs, taux de réponse des ateliers et commandes issues de devis."}
                  </p>
                </div>
              </div>

              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Request Title" : "Demande Sur-Mesure"}</th>
                      <th>{isEn ? "Buyer" : "Acheteur"}</th>
                      <th>{isEn ? "Category" : "Catégorie"}</th>
                      <th>{isEn ? "Target Budget" : "Budget indicatif"}</th>
                      <th>{isEn ? "Quotes Submitted" : "Devis Reçus"}</th>
                      <th>{isEn ? "Status" : "Statut"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { title: "Parure royale en bronze ciselé pour cérémonie traditionnelle", buyer: "Amina Diop (Cotonou)", cat: "Joaillerie & Bronze", budget: "280 000 FCFA", quotes: 2, status: "MATCHED" },
                      { title: "Table console sculptée en bois d'Iroko massif", buyer: "Marcelle Houngbo (Porto-Novo)", cat: "Mobilier d'Art", budget: "450 000 FCFA", quotes: 1, status: "MATCHED" },
                      { title: "Sac de voyage weekend en cuir pleine fleur patiné", buyer: "Didier Agossa (Parakou)", cat: "Maroquinerie", budget: "190 000 FCFA", quotes: 0, status: "OPEN" },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.title}</td>
                        <td style={{ color: "var(--oj-color-muted)" }}>{r.buyer}</td>
                        <td><span className="oj-status-pill success">{r.cat}</span></td>
                        <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{r.budget}</td>
                        <td><strong>{r.quotes} devis</strong></td>
                        <td><span className="oj-status-pill pending">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: FINOPS (S44/S46) ==================== */}
          {activeNav === "finops" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Merchant FinOps & Cashbook Ledger (S44)" : "Livre de Caisse & Rapprochement FinOps"}</h1>
                  <p>
                    {isEn
                      ? "Triad monitoring: Total Gross Sold != Amount Collected != Remaining Receivable. Append-only events."
                      : "Surveillance de la triade : Vendu ≠ Encaissé ≠ Restant. Grand livre immuable non-custodial."}
                  </p>
                </div>
              </div>

              {/* Triade summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
                  <div className="oj-kpi-header"><span>Chiffre d'Affaires Engagé (Vendu)</span></div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>1 280 000 FCFA</strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Total des commandes fermes</small>
                </div>
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                  <div className="oj-kpi-header"><span>Liquidités Encaissées (Direct MoMo/Comptoir)</span></div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#185F46" }}>850 000 FCFA</strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Relevés de caisse confirmés</small>
                </div>
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #AD8455" }}>
                  <div className="oj-kpi-header"><span>Créances Clients en Attente</span></div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#AD8455" }}>430 000 FCFA</strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Soldes à percevoir à livraison</small>
                </div>
              </div>

              {/* Recent FinOps flows */}
              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>Libellé & Référence</th>
                      <th>Canal de Paiement</th>
                      <th>Heure</th>
                      <th>Statut Audit</th>
                      <th style={{ textAlign: "right" }}>Montant Encaissé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Commande OJK-2026-0891 (Sac Cabas Grand Marché)", ref: "TXN-MTN-89021", channel: "MTN Mobile Money", time: "14:32", status: "Confirmé par PSP", amount: 185000 },
                      { label: "Vente directe comptoir — Porte-carte cuir cognac", ref: "REC-CPT-004", channel: "Espèces", time: "11:15", status: "Confirmé par vendeur", amount: 45000 },
                      { label: "Commande Galerie Royale — Solde à livraison", ref: "CMD-GAL-990", channel: "Virement", time: "09:10", status: "Créance en attente", amount: 120000 },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.label}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>{row.ref}</small>
                        </td>
                        <td>{row.channel}</td>
                        <td style={{ color: "var(--oj-color-muted)" }}>{row.time}</td>
                        <td><span className="oj-status-pill success">{row.status}</span></td>
                        <td style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {formatPrice(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 6: AUDIT LOG (A07) ==================== */}
          {activeNav === "audit" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Immutable Audit Trail (A07)" : "Journal d'Audit Immuable (Append-Only)"}</h1>
                  <p>
                    {isEn
                      ? "Non-tamperable administrative event log. Cryptographic security records."
                      : "Historique inaltérable et horodaté de toutes les actions de sécurité et gouvernance."}
                  </p>
                </div>
              </div>

              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>Action de Sécurité</th>
                      <th>Cible / Ressource</th>
                      <th>Opérateur & Rôle</th>
                      <th>Horodatage</th>
                      <th>IP Source</th>
                      <th>Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "var(--oj-color-action)" }}>
                            [{log.action}]
                          </span>
                        </td>
                        <td>{log.target}</td>
                        <td>
                          <div>{log.operator}</div>
                          <small style={{ color: "var(--oj-color-accent)", fontWeight: 700 }}>{log.role}</small>
                        </td>
                        <td style={{ color: "var(--oj-color-muted)" }}>{log.time}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--oj-color-muted)" }}>{log.ip}</td>
                        <td>
                          <span className={`oj-status-pill ${log.status === "SUCCESS" ? "success" : log.status === "BLOCKED" ? "error" : "pending"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
