"use client";

import React, { useEffect, useState } from "react";


export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissed = localStorage.getItem("ojarket-pwa-dismissed");
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // We show immediately if not dismissed, as requested in Option 1
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
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
    // Dismiss for 7 days
    localStorage.setItem("ojarket-pwa-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      backgroundColor: "var(--oj-color-surface, #FFFFFF)",
      boxShadow: "0 12px 32px rgba(21, 30, 28, 0.12)",
      borderRadius: "16px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      width: "calc(100% - 32px)",
      maxWidth: "400px",
      border: "1px solid var(--oj-color-border, #E7E1D9)",
      animation: "slideUpPwa 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
    }}>
      <style>{`
        @keyframes slideUpPwa {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
      
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        backgroundColor: "var(--oj-color-subtle, #F4F0EA)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--oj-color-action, #0D4A38)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ 
          margin: 0, 
          fontSize: "14px", 
          fontWeight: 600, 
          color: "var(--oj-color-text, #151E1C)",
          fontFamily: "var(--oj-font-ui, sans-serif)"
        }}>
          Installer Ojarket
        </h4>
        <p style={{ 
          margin: "4px 0 0 0", 
          fontSize: "12px", 
          color: "var(--oj-color-muted, #5B6661)",
          fontFamily: "var(--oj-font-ui, sans-serif)"
        }}>
          L'expérience premium sur votre écran d'accueil.
        </p>
      </div>

      <button 
        onClick={handleInstall}
        style={{
          backgroundColor: "var(--oj-color-action, #0D4A38)",
          color: "var(--oj-color-onAction, #FFFFFF)",
          border: "none",
          padding: "8px 16px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--oj-font-ui, sans-serif)",
          transition: "transform 0.2s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.05)"}
      >
        Ajouter
      </button>

      <button 
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          color: "var(--oj-color-muted, #5B6661)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        aria-label="Fermer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
