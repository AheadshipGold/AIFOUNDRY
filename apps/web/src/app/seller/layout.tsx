"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sellerTranslations, SellerLocale, getInitialSellerLocale } from "@/lib/seller-i18n";
import { getStoredToken, getStoredUser, clearSession, AuthApi, type AuthUser } from "@/lib/api";
import { WebAuthModal } from "@/components/WebAuthModal";
import "../landing.css";
import "./seller.css";

interface ActiveShopData {
  id: string;
  slug: string;
  name: string;
  craftType?: string;
  city: string;
  country: string;
  currency: string;
  isVerified: boolean;
  kycStatus: string;
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [locale, setLocale] = useState<SellerLocale>("fr");
  const [shop, setShop] = useState<ActiveShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize locale and sidebar collapse state from storage
  useEffect(() => {
    setMounted(true);
    try {
      const initial = getInitialSellerLocale();
      setLocale(initial);
      const savedCollapsed = localStorage.getItem("ojarket_seller_sidebar_collapsed");
      if (savedCollapsed === "true") {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ojarket_seller_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const changeLocale = (newLocale: SellerLocale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem("ojarket_seller_locale", newLocale);
    } catch {}
  };

  const t = sellerTranslations[locale];

  // Fetch active shop details
  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    setUser(storedUser);

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    };

    fetch("/api/v1/seller/shop", { headers })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          // If 403 or 401, check if user is logged in
          if (!token && !storedUser) {
            setAuthRequired(true);
          } else {
            // User logged in but no shop yet
            setShop({
              id: "new",
              slug: "ma-boutique",
              name: storedUser?.name ? `Maison ${storedUser.name}` : "Boutique en Création",
              city: "Cotonou",
              country: "Bénin",
              currency: "XOF",
              isVerified: false,
              kycStatus: "PENDING",
            });
          }
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.shop) {
          setShop(data.shop);
          setAuthRequired(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [pathname]);

  const handleAuthSuccess = async (authUser: AuthUser) => {
    setUser(authUser);
    setAuthModalOpen(false);
    setAuthRequired(false);
    setLoading(true);

    const token = getStoredToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(authUser?.id ? { "x-user-id": authUser.id } : {}),
    };

    try {
      const res = await fetch("/api/v1/seller/shop", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data?.shop) {
          setShop(data.shop);
        }
      } else {
        setShop({
          id: "new",
          slug: "ma-boutique",
          name: authUser?.name ? `Maison ${authUser.name}` : "Boutique en Création",
          city: "Cotonou",
          country: "Bénin",
          currency: "XOF",
          isVerified: false,
          kycStatus: "PENDING",
        });
      }
    } catch (err) {
      console.error("Failed to load shop after login", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setQuickLoginLoading(true);
    try {
      const res = await AuthApi.quickSellerLogin();
      if (res.user) {
        await handleAuthSuccess(res.user);
      }
    } catch (err) {
      console.error("Quick login error", err);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const navItems = [
    {
      href: "/seller",
      label: t.nav.today,
      exact: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      href: "/seller/catalog",
      label: t.nav.catalog,
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      ),
    },
    {
      href: "/seller/orders",
      label: t.nav.orders,
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
    },
    {
      href: "/seller/cashbook",
      label: t.nav.cashbook,
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      ),
    },
    {
      href: "/seller/opportunities",
      label: t.nav.opportunities,
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
    {
      href: "/seller/subscription",
      label: t.nav.subscription,
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      ),
    },
    {
      href: "/seller/settings",
      label: t.nav.settings,
      exact: false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setShop(null);
    setAuthRequired(true);
    router.push("/seller");
  };

  return (
    <div className="seller-shell" data-theme="dark">
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className={`seller-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        {/* Brand & Store Header */}
        <div style={{ padding: isCollapsed ? "16px 8px 14px" : "16px 14px 14px", borderBottom: "1px solid #1C2E2A" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", marginBottom: "12px", gap: "6px" }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }} title="Accueil Ojarket">
              {isCollapsed ? (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: "#075D49",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D4B483",
                    fontWeight: 800,
                    fontSize: "14px",
                    fontFamily: "var(--oj-font-editorial, serif)",
                  }}
                >
                  O
                </div>
              ) : (
                <img
                  src="/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
                  alt="Ojarket"
                  style={{ height: "22px", width: "auto", objectFit: "contain" }}
                />
              )}
            </Link>
            
            {/* Toggle Button Directly Inside Sidebar */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="seller-sidebar-toggle-btn"
              title={isCollapsed ? "Déployer la barre latérale" : "Rétracter la barre latérale"}
              aria-label={isCollapsed ? "Déployer la barre latérale" : "Rétracter la barre latérale"}
              style={{
                background: "rgba(212, 180, 131, 0.08)",
                border: "1px solid rgba(212, 180, 131, 0.3)",
                borderRadius: "6px",
                width: isCollapsed ? "28px" : "26px",
                height: isCollapsed ? "28px" : "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D4B483",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                marginTop: isCollapsed ? "8px" : 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {isCollapsed ? (
                  <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                ) : (
                  <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                )}
              </svg>
            </button>
          </div>

          {/* Boutique Profile Box */}
          <div
            style={{
              padding: isCollapsed ? "6px" : "8px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              justifyContent: isCollapsed ? "center" : "flex-start",
            }}
            title={shop?.name || "Boutique"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: isCollapsed ? "center" : "flex-start" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "5px",
                  backgroundColor: "#075D49",
                  color: "#D4B483",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "13px",
                  fontFamily: "var(--oj-font-editorial, serif)",
                  flexShrink: 0,
                }}
              >
                {shop?.name ? shop.name.charAt(0).toUpperCase() : "M"}
              </div>
              {!isCollapsed && (
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "12px", color: "#F8F6F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {shop?.name || (authRequired ? "Compte Artisan" : "Boutique")}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "rgba(248, 246, 240, 0.55)", display: "flex", alignItems: "center", gap: "3px" }}>
                    <span>{shop?.city || "Cotonou"}</span>
                    <span>•</span>
                    <span style={{ color: shop?.isVerified ? "#10B981" : "#D4B483", fontWeight: 600 }}>
                      {shop?.isVerified ? "Vérifiée" : "KYC Attente"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: isCollapsed ? "10px 4px" : "10px 8px", flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`seller-nav-link ${active ? "active" : ""}`}
                  title={item.label}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: active ? 600 : 500 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer with Live Store link & Logout/Login */}
        <div style={{ padding: isCollapsed ? "10px 6px 14px" : "10px 12px 14px", borderTop: "1px solid #1C2E2A", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          {shop?.id && shop.id !== "new" && (
            <Link
              href={`/shop/${shop.slug || shop.id}`}
              target="_blank"
              className="seller-storefront-btn"
              title="Ouvrir la vitrine publique dans un nouvel onglet"
            >
              <span>{t.nav.viewStorefront}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </Link>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", paddingTop: "4px" }} suppressHydrationWarning>
            {!isCollapsed && (
              <Link
                href="/"
                style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.55)", textDecoration: "none", transition: "color 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F8F6F0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248, 246, 240, 0.55)")}
              >
                {t.nav.backToMarketplace}
              </Link>
            )}
            {!mounted ? (
              <span style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.3)" }}>—</span>
            ) : user ? (
              <button
                onClick={handleLogout}
                className="seller-footer-logout"
                title="Se déconnecter de la session marchand"
                style={isCollapsed ? { padding: "4px 8px", fontSize: "10px" } : {}}
              >
                {isCollapsed ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                ) : (
                  t.nav.logout
                )}
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="seller-footer-login"
                title="Se connecter au compte marchand"
              >
                {isCollapsed ? "Entrer" : "Se Connecter"}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="seller-main">
        {/* Top Header */}
        <header className="seller-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#D4B483", letterSpacing: "0.5px" }}>
              Merchant Commerce OS
            </span>
            <span style={{ color: "rgba(248, 246, 240, 0.4)", fontSize: "12px" }}>/</span>
            <span style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.8)" }}>
              {shop?.name || "Boutique"}
            </span>
          </div>


          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Quick Action */}
            <Link
              href="/seller/catalog/new"
              className="seller-action-btn"
              style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>+</span>
              <span>{t.header.quickNewProduct}</span>
            </Link>

            {/* Language Switcher */}
            <div style={{ display: "flex", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(212, 180, 131, 0.3)" }}>
              <button
                onClick={() => changeLocale("fr")}
                className={`seller-lang-btn ${locale === "fr" ? "active" : ""}`}
              >
                FR
              </button>
              <button
                onClick={() => changeLocale("en")}
                className={`seller-lang-btn ${locale === "en" ? "active" : ""}`}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="seller-content">
          {authRequired ? (
            <div
              style={{
                maxWidth: "560px",
                margin: "64px auto",
                padding: "40px 36px",
                backgroundColor: "var(--oj-color-surface, #111C1A)",
                borderRadius: "14px",
                border: "1px solid var(--oj-color-border, #233834)",
                textAlign: "center",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 18px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(212, 180, 131, 0.12)",
                  border: "1px solid rgba(212, 180, 131, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D4B483",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <h2 style={{ fontFamily: "var(--oj-font-editorial, serif)", color: "#D4B483", fontSize: "26px", marginBottom: "12px", fontWeight: 700 }}>
                Accès Privé Marchand
              </h2>
              <p style={{ color: "rgba(248, 246, 240, 0.82)", fontSize: "14.5px", lineHeight: "1.65", marginBottom: "28px" }}>
                Veuillez vous connecter à votre compte artisan pour administrer vos créations, vos commandes et vos liquidités sur le Merchant Commerce OS.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "420px", margin: "0 auto" }}>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="seller-action-btn"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Se Connecter à mon Compte
                </button>

                <button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={quickLoginLoading}
                  className="seller-action-btn"
                  style={{
                    cursor: quickLoginLoading ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                  </svg>
                  {quickLoginLoading ? "Connexion en cours..." : "Connexion Directe Boutique Kingston Bio"}
                </button>

                <Link
                  href="/"
                  className="seller-secondary-btn"
                  style={{
                    textAlign: "center",
                    padding: "10px 20px",
                    fontSize: "13px",
                    marginTop: "6px",
                  }}
                >
                  Retour Galerie Publique
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Official Luxury Auth Modal */}
      <WebAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        isEn={locale === "en"}
      />
    </div>
  );
}
