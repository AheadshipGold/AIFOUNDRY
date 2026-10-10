"use client";

import React, { useState } from "react";
import Link from "next/link";
import "../../design-system/styles.css";
import "../landing.css";
import { AdminProvider, useAdmin } from "../../features/admin/context/AdminContext";
import { 
  AdminIconBarChart, 
  AdminIconStore, 
  AdminIconCreditCard, 
  AdminIconGavel, 
  AdminIconActivity, 
  AdminIconShield, 
  AdminIconMenu, 
  AdminIconLogOut, 
  AdminIconSparkle,
  AdminIconUsers
} from "../../features/admin/components/shared/AdminIcons";

import { CmsConfigView } from "../../features/admin/views/CmsConfigView";
import { FinOpsView } from "../../features/admin/views/FinOpsView";
import { UsersView } from "../../features/admin/views/UsersView";
import { CrmView } from "../../features/admin/views/CrmView";
import { OverviewView } from "../../features/admin/views/OverviewView";
import { DisputesView } from "../../features/admin/views/DisputesView";
import { ShopsView } from "../../features/admin/views/ShopsView";
import { CorridorsView } from "../../features/admin/views/CorridorsView";
import { D02View } from "../../features/admin/views/D02View";
import { AuditView } from "../../features/admin/views/AuditView";

import { SecurityGateView } from "../../features/admin/views/SecurityGateView";

function AdminConsoleLayout() {
  const { isEn, locale, setLocale, theme, setTheme, currentUser, authChecked, handleAdminLogout } = useAdmin();
  const [activeNav, setActiveNav] = useState<
    "overview" | "shops" | "corridors" | "d02" | "disputes" | "finops" | "audit" | "cms" | "crm" | "admins"
  >("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const isDark = theme === "dark";

  // Render Luxury Security Gate Wall if unauthenticated or not an admin
  if (authChecked && (!currentUser || currentUser.role !== "ADMIN")) {
    return <SecurityGateView />;
  }

  return (
    <div className={`oj-admin-app ${isDark ? "theme-dark" : "theme-light"}`} data-theme={theme}>
      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="oj-admin-topbar">
        <div className="oj-admin-topbar-left">
          <button
            className="oj-admin-toggle-btn"
            onClick={() => {
              if (window.innerWidth <= 1024) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
          >
            <AdminIconMenu size={20} />
          </button>
          
          <Link href="/" className="oj-admin-brand-wrap" style={{ textDecoration: "none" }}>
            <img 
              src={isDark ? "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png" : "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png"} 
              alt="Ojarket Logo" 
              className="oj-admin-brand-logo" 
            />
            <span className="oj-admin-os-pill">
              ADMIN OS
            </span>
          </Link>
        </div>

        <div className="oj-admin-topbar-right">
          <button
            className="oj-admin-toggle-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={isEn ? "Toggle Light/Dark Mode" : "Basculer Jour/Nuit"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="oj-admin-toggle-btn"
            onClick={() => setLocale(isEn ? "fr" : "en")}
            style={{ width: "auto", padding: "0 10px", fontSize: "11px", fontWeight: 700 }}
          >
            {isEn ? "FR" : "EN"}
          </button>
          <button className="oj-btn-secondary" onClick={handleAdminLogout} style={{
              height: "34px",
              padding: "0 12px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--oj-color-errorFg)",
              borderColor: "var(--oj-color-border)",
            }}>
            <AdminIconLogOut size={14} />
            <span className="oj-desktop-badge">{isEn ? "Sign Out" : "Déconnexion"}</span>
          </button>
        </div>
      </header>

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
                <span className="oj-admin-nav-icon"><AdminIconBarChart size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Overview (A01)" : "Tableau de Bord"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "cms" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("cms");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconSparkle size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "App Landing Studio" : "Studio d'Accueil"}
                </span>
              </button>
            </div>

            {/* GROUP 2: FINOPS & SECURITY */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "FinOps & TrustGuard" : "FinOps & Sécurité"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "shops" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("shops");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconStore size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Stores KYC (A03)" : "Boutiques & KYC"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "corridors" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("corridors");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconCreditCard size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Corridors (A06)" : "Corridors UEMOA"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "finops" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("finops");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconActivity size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "FinOps Ledger (S44)" : "Livre de Caisse"}
                </span>
              </button>
            </div>

            {/* GROUP 3: OPERATIONS & AUDIT */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "Compliance & Audit" : "Régulation & Audit"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "d02" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("d02");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconSparkle size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Bespoke D02" : "Sur-Mesure (D02)"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "disputes" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("disputes");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconGavel size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Disputes (A04)" : "Arbitrage Litiges"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "audit" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("audit");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconShield size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Audit Log (A07)" : "Grand Livre Audit"}
                </span>
              </button>
              
              <button
                className={`oj-admin-nav-item ${activeNav === "crm" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("crm");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconUsers size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Clients & CRM" : "Clients & Utilisateurs"}
                </span>
              </button>
              
              <button
                className={`oj-admin-nav-item ${activeNav === "admins" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("admins");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconUsers size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Platform Admins" : "Gestion Administrateurs"}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="oj-admin-sidebar-footer">
            <div className="oj-admin-user-card">
              <div className="oj-admin-user-avatar">
                {currentUser?.name
                  ? currentUser.name
                      .split(" ")
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "AB"}
              </div>
              <div className="oj-admin-user-info">
                <div className="oj-admin-user-name">
                  {currentUser?.name || "ABRAHAM B. A."}
                </div>
                <div className="oj-admin-user-role">
                  {currentUser?.role === "ADMIN" ? "PLATFORM_OWNER" : currentUser?.role || "PLATFORM_OWNER"}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ----------------- MAIN CONTENT AREA ----------------- */}
        <main className="oj-admin-main">
          {activeNav === "overview" && <OverviewView />}
          {activeNav === "shops" && <ShopsView />}
          {activeNav === "corridors" && <CorridorsView />}
          {activeNav === "d02" && <D02View />}
          {activeNav === "disputes" && <DisputesView />}
          {activeNav === "finops" && <FinOpsView />}
          {activeNav === "audit" && <AuditView />}
          {activeNav === "cms" && <CmsConfigView />}
          {activeNav === "crm" && <CrmView />}
          {activeNav === "admins" && <UsersView />}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminConsoleLayout />
    </AdminProvider>
  );
}
