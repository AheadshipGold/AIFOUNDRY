"use client";

import React, { useEffect, useState } from "react";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [locale, setLocale] = useState<"fr" | "en">("fr");

  useEffect(() => {
    // 1. Détecter la langue active (depuis document, storage ou navigateur)
    try {
      const docLang = document.documentElement.lang;
      if (docLang === "en" || docLang === "fr") {
        setLocale(docLang as "fr" | "en");
      } else {
        const storedPref = localStorage.getItem("aifoundry.ui-gallery");
        if (storedPref) {
          const parsed = JSON.parse(storedPref);
          if (parsed.locale === "en" || parsed.locale === "fr") {
            setLocale(parsed.locale);
          }
        } else if (navigator.language && navigator.language.startsWith("en")) {
          setLocale("en");
        }
      }
    } catch {}

    // 2. Détection de plateforme
    const ua = navigator.userAgent || "";
    const android = /android/i.test(ua);
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsAndroid(android);
    setIsIos(ios);

    // 3. Gestion de l'affichage (session-based pour ne pas bloquer les tests)
    // Si l'utilisateur l'a masquée pendant cette session précise, on respecte, sinon on l'affiche
    const dismissedSession = sessionStorage.getItem("ojarket-banner-dismissed-session");

    if (!dismissedSession) {
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissedSession) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Masqué pour la durée de la session courante du navigateur
    sessionStorage.setItem("ojarket-banner-dismissed-session", "true");
  };

  if (!showBanner) return null;

  const isEn = locale === "en";

  // Textes bilingues
  const title = isAndroid
    ? (isEn ? "Native Android App" : "App Android Native")
    : isIos
    ? (isEn ? "Ojarket on iPhone" : "Ojarket sur iPhone")
    : (isEn ? "Official Ojarket App" : "Application Officielle");

  const subtitle = isAndroid
    ? (isEn ? "POS register & offline sync" : "Caisse POS & mode hors-ligne")
    : isIos
    ? (isEn ? "Add to Home Screen via Share menu" : "Ajouter à l'écran d'accueil (Partager)")
    : (isEn ? "Available for Android & Desktop" : "Disponible sur Android & Bureau");

  const ctaText = isAndroid
    ? (isEn ? "Get APK" : "Obtenir l'APK")
    : deferredPrompt
    ? (isEn ? "Install" : "Installer")
    : (isEn ? "Get App" : "Obtenir l'App");

  return (
    <aside
      aria-label="Application Banner"
      className="oj-pwa-banner-aside"
    >
      <style>{`
        .oj-pwa-banner-aside {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100000;
          width: calc(100% - 24px);
          max-width: 440px;
          background-color: rgba(10, 18, 16, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 180, 131, 0.42);
          border-radius: 999px;
          padding: 7px 12px 7px 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55), 0 2px 10px rgba(212, 180, 131, 0.15);
          animation: capsuleSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
        }

        /* Sur mobile, flotter au-dessus de la barre de navigation du bas (.oj-bottom-nav) */
        @media (max-width: 768px) {
          .oj-pwa-banner-aside {
            bottom: calc(70px + env(safe-area-inset-bottom, 0px)) !important;
            width: calc(100% - 20px) !important;
            max-width: 420px !important;
            z-index: 100000 !important;
          }
        }

        @keyframes capsuleSlideUp {
          from { transform: translate(-50%, 28px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .oj-capsule-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .oj-capsule-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        }
        .oj-capsule-btn:active {
          transform: scale(0.96);
        }
        .oj-capsule-close {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .oj-capsule-close:hover {
          opacity: 1 !important;
          transform: scale(1.1);
        }
      `}</style>

      {/* Icône Mobile / App compacte dorée */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#06241D",
          border: "1px solid rgba(212, 180, 131, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>

      {/* Contenu textuel slim bilingue */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "#D4B483",
              fontFamily: "var(--oj-font-ui, system-ui, sans-serif)",
              lineHeight: 1.2,
            }}
          >
            {title}
          </span>
        </div>
        <p
          style={{
            margin: "1px 0 0",
            fontSize: "11px",
            color: "#E2E8F0",
            fontFamily: "var(--oj-font-ui, system-ui, sans-serif)",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Bouton d'action tactile */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        {isAndroid || !deferredPrompt ? (
          <a
            href="/download/android"
            className="oj-capsule-btn"
            style={{
              backgroundColor: "#0D4A38",
              color: "#FFFFFF",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.3px",
              fontFamily: "var(--oj-font-ui, system-ui, sans-serif)",
              border: "1px solid #10B981",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {ctaText}
          </a>
        ) : (
          <button
            onClick={handleInstallPwa}
            className="oj-capsule-btn"
            style={{
              backgroundColor: "#0D4A38",
              color: "#FFFFFF",
              border: "1px solid #10B981",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--oj-font-ui, system-ui, sans-serif)",
              whiteSpace: "nowrap",
            }}
          >
            {ctaText}
          </button>
        )}

        {/* Bouton Fermer discret */}
        <button
          onClick={handleDismiss}
          className="oj-capsule-close"
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
            color: "#94A3B8",
            opacity: 0.65,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isEn ? "Close" : "Fermer"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
