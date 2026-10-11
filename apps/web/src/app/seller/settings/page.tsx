"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredToken, getStoredUser } from "@/lib/api";
import { sellerTranslations, SellerLocale } from "@/lib/seller-i18n";

interface ShopPaymentChannelItem {
  channel: string;
  name: string;
  category: "MOBILE_MONEY" | "CASH" | "BANK" | "CARD";
  platformEnabled: boolean;
  shopEnabled: boolean;
  merchantPhone: string;
  merchantNumber: string;
  description: string;
}

function IconPhone({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function IconCreditCard({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconCash({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconBank({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="20" x2="22" y2="20" />
      <line x1="4" y1="9" x2="4" y2="20" />
      <line x1="9" y1="9" x2="9" y2="20" />
      <line x1="15" y1="9" x2="15" y2="20" />
      <line x1="20" y1="9" x2="20" y2="20" />
      <polygon points="12 2 2 7 22 7" />
    </svg>
  );
}

function IconLock({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function SellerSettingsPage() {
  const [locale, setLocale] = useState<SellerLocale>("fr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [shopName, setShopName] = useState("");
  const [craftType, setCraftType] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [country, setCountry] = useState("Bénin");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [storefrontTheme, setStorefrontTheme] = useState("light");
  const [slug, setSlug] = useState("kingston-bio");
  const [kycStatus, setKycStatus] = useState("PENDING");
  const [isVerified, setIsVerified] = useState(false);

  // Shop Payment Connections (Flux A: Clients -> Vendeurs)
  const [paymentConnections, setPaymentConnections] = useState<ShopPaymentChannelItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ojarket_seller_locale") as SellerLocale;
      if (saved === "en" || saved === "fr") setLocale(saved);
    } catch {}

    const token = getStoredToken();
    const storedUser = getStoredUser();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    };

    fetch("/api/v1/seller/shop", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.shop) {
          const s = data.shop;
          setShopName(s.name || "");
          setSlug(s.slug || s.id || "kingston-bio");
          setCraftType(s.craftType || "");
          setCity(s.city || "Cotonou");
          setCountry(s.country || "Bénin");
          setDescription(s.description || "");
          setBannerUrl(s.bannerUrl || "");
          setStorefrontTheme(s.storefrontTheme || "light");
          setKycStatus(s.kycStatus || "PENDING");
          setIsVerified(s.isVerified || false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Chargement des connexions de paiement de la boutique
    fetch("/api/v1/seller/shop/payment-connections", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.connections && Array.isArray(data.connections)) {
          setPaymentConnections(data.connections);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPayments(false));
  }, []);

  const handleTogglePaymentChannel = (channel: string) => {
    setPaymentConnections((prev) =>
      prev.map((conn) => {
        if (conn.channel !== channel) return conn;
        // Deny-by-default : si la plateforme a désactivé le moyen, la boutique ne peut pas l'activer
        if (!conn.platformEnabled) return conn;
        return { ...conn, shopEnabled: !conn.shopEnabled };
      })
    );
  };

  const handleUpdateMerchantPhone = (channel: string, phone: string) => {
    setPaymentConnections((prev) =>
      prev.map((conn) => (conn.channel === channel ? { ...conn, merchantPhone: phone } : conn))
    );
  };

  const handleUpdateMerchantNumber = (channel: string, number: string) => {
    setPaymentConnections((prev) =>
      prev.map((conn) => (conn.channel === channel ? { ...conn, merchantNumber: number } : conn))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const token = getStoredToken();
    try {
      // 1. Sauvegarde des informations générales de la boutique
      const res = await fetch("/api/v1/seller/shop", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: shopName.trim(),
          craftType: craftType.trim(),
          city: city.trim(),
          country: country.trim(),
          description: description.trim(),
          bannerUrl: bannerUrl.trim(),
          storefrontTheme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur de mise à jour");
      }

      // 2. Sauvegarde des moyens de paiement de la boutique
      if (paymentConnections.length > 0) {
        const payRes = await fetch("/api/v1/seller/shop/payment-connections", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ connections: paymentConnections }),
        });
        const payData = await payRes.json();
        if (!payRes.ok) {
          throw new Error(payData.message || "Erreur d'enregistrement des moyens de paiement");
        }
      }

      setSuccessMsg("Paramètres et moyens de règlement de la boutique enregistrés avec succès.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de sauvegarder");
    } finally {
      setSaving(false);
    }
  };

  const t = sellerTranslations[locale];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 6px 0" }}>
          {t.settings.title}
        </h1>
        <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
          {t.settings.subtitle}
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#A7F3D0",
            fontSize: "13.5px",
            marginBottom: "24px",
          }}
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(229, 115, 115, 0.15)",
            border: "1px solid rgba(229, 115, 115, 0.3)",
            color: "#FFCDD2",
            fontSize: "13.5px",
            marginBottom: "24px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "rgba(248, 246, 240, 0.5)" }}>
          Chargement des informations de la boutique...
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Identity Card */}
          <div
            className="seller-card"
            style={{
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", color: "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", margin: 0 }}>
                Certificat & Identité Marchande
              </h2>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: isVerified ? "rgba(16, 185, 129, 0.15)" : "rgba(173, 132, 85, 0.2)",
                  color: isVerified ? "#10B981" : "#D4B483",
                  border: isVerified ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(173, 132, 85, 0.3)",
                }}
              >
                {isVerified ? "Boutique Officielle Certifiée" : `Statut KYC : ${kycStatus}`}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.settings.shopName} *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.settings.craftType}
                </label>
                <input
                  type="text"
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                  placeholder="Ex: Maroquinerie d'art & Cuir ébène"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.settings.city}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.settings.country}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                {t.settings.description}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'héritage, le savoir-faire et l'engagement d'excellence de votre atelier..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#F8F6F0",
                  fontSize: "13.5px",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Storefront Customization */}
          <div
            className="seller-card"
            style={{
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "16px", color: "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", margin: "0 0 16px 0" }}>
              Personnalisation de la Vitrine Publique
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  Bannière d'en-tête (URL)
                </label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "8px", fontWeight: 500 }}>
                  Thème d'affichage de la Vitrine Publique
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setStorefrontTheme("light")}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: storefrontTheme === "light" ? "2px solid #D4B483" : "1px solid rgba(255, 255, 255, 0.12)",
                      backgroundColor: storefrontTheme === "light" ? "rgba(212, 180, 131, 0.15)" : "rgba(0, 0, 0, 0.25)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#F8F6F0", border: "2px solid #D4B483", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: storefrontTheme === "light" ? "#D4B483" : "#F8F6F0" }}>Ivoire Impérial</div>
                      <div style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.55)" }}>Mode Clair &amp; Lin noble</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorefrontTheme("dark")}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: storefrontTheme === "dark" ? "2px solid #D4B483" : "1px solid rgba(255, 255, 255, 0.12)",
                      backgroundColor: storefrontTheme === "dark" ? "rgba(212, 180, 131, 0.15)" : "rgba(0, 0, 0, 0.25)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#081018", border: "2px solid #D4B483", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: 700, color: storefrontTheme === "dark" ? "#D4B483" : "#F8F6F0" }}>Ébène &amp; Or</div>
                      <div style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.55)" }}>Mode Sombre &amp; Or satiné</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MOYENS DE RÈGLEMENT ACCEPTÉS EN BOUTIQUE (CLIENTS ➔ VENDEURS) */}
          {/* ========================================================================= */}
          <div
            className="seller-card"
            style={{
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "16px", color: "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", margin: "0 0 6px 0" }}>
                  Moyens de Règlement Acceptés en Boutique (Clients ➔ Atelier)
                </h2>
                <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "13px", margin: 0, maxWidth: "700px", lineHeight: 1.5 }}>
                  Sélectionnez parmi les canaux légaux validés par Ojarket ceux que vous acceptez dans votre boutique. Renseignez vos comptes marchands pour l&apos;encaissement direct et sans intermédiaire de vos commandes.
                </p>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10B981",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                Encaissement Direct Atelier
              </span>
            </div>

            {loadingPayments ? (
              <div style={{ padding: "24px", textAlign: "center", color: "rgba(248, 246, 240, 0.5)", fontSize: "13px" }}>
                Chargement des canaux de paiement autorisés...
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
                {paymentConnections.map((conn) => {
                  const isPlatformBlocked = !conn.platformEnabled;
                  const isAccepted = conn.shopEnabled && !isPlatformBlocked;
                  const needsPhone = ["MTN_MOMO", "MOOV_MONEY", "CELTIIS_CASH"].includes(conn.channel);
                  const isBank = conn.channel === "DIRECT_TRANSFER";

                  return (
                    <div
                      key={conn.channel}
                      style={{
                        padding: "16px 18px",
                        borderRadius: "10px",
                        border: isPlatformBlocked
                          ? "1px solid rgba(255, 255, 255, 0.08)"
                          : isAccepted
                          ? "1px solid rgba(16, 185, 129, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.12)",
                        background: isPlatformBlocked
                          ? "rgba(0, 0, 0, 0.22)"
                          : isAccepted
                          ? "rgba(16, 185, 129, 0.04)"
                          : "rgba(0, 0, 0, 0.16)",
                        opacity: isPlatformBlocked ? 0.65 : 1,
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: isAccepted ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.06)",
                              color: isAccepted ? "#10B981" : "#9CA3AF",
                              flexShrink: 0,
                            }}
                          >
                            {conn.category === "MOBILE_MONEY" && <IconPhone size={18} />}
                            {conn.category === "CARD" && <IconCreditCard size={18} />}
                            {conn.category === "CASH" && <IconCash size={18} />}
                            {conn.category === "BANK" && <IconBank size={18} />}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#F8F6F0" }}>
                                {conn.name}
                              </h3>
                              {isPlatformBlocked && (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                                    color: "#FCA5A5",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <IconLock size={10} />
                                  Désactivé par la plateforme
                                </span>
                              )}
                              {!isPlatformBlocked && isAccepted && (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                                    color: "#10B981",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                  }}
                                >
                                  Accepté en Boutique
                                </span>
                              )}
                              {!isPlatformBlocked && !isAccepted && (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontSize: "10.5px",
                                    fontWeight: 600,
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    color: "#9CA3AF",
                                  }}
                                >
                                  Refusé / Non Proposé
                                </span>
                              )}
                            </div>
                            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(248, 246, 240, 0.6)", lineHeight: 1.4 }}>
                              {isPlatformBlocked
                                ? "Ce moyen de paiement a été suspendu au niveau global par l'administration Ojarket (Protocole Deny-by-Default A06). Votre boutique ne peut pas le proposer."
                                : conn.description}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "12px", color: isPlatformBlocked ? "#9CA3AF" : isAccepted ? "#10B981" : "rgba(248, 246, 240, 0.5)", fontWeight: 600 }}>
                            {isPlatformBlocked ? "Indisponible" : isAccepted ? "Accepté" : "Refusé"}
                          </span>
                          <button
                            type="button"
                            disabled={isPlatformBlocked}
                            onClick={() => handleTogglePaymentChannel(conn.channel)}
                            style={{
                              width: "44px",
                              height: "24px",
                              borderRadius: "12px",
                              border: "none",
                              backgroundColor: isPlatformBlocked
                                ? "rgba(255, 255, 255, 0.1)"
                                : isAccepted
                                ? "#10B981"
                                : "#4B5563",
                              position: "relative",
                              cursor: isPlatformBlocked ? "not-allowed" : "pointer",
                              transition: "background-color 0.2s ease",
                              padding: 0,
                            }}
                            title={isPlatformBlocked ? "Désactivé par la plateforme" : isAccepted ? "Désactiver pour ma boutique" : "Activer pour ma boutique"}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: "3px",
                                left: isAccepted ? "23px" : "3px",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                backgroundColor: "#FFFFFF",
                                transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                              }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Inputs for Phone / Account number when active */}
                      {!isPlatformBlocked && isAccepted && (needsPhone || isBank) && (
                        <div
                          style={{
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                            display: "grid",
                            gridTemplateColumns: isBank ? "1fr 1fr" : "1fr",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <label style={{ display: "block", fontSize: "11.5px", color: "#D4B483", marginBottom: "4px", fontWeight: 600 }}>
                              {needsPhone
                                ? `Numéro Marchand / Réception ${conn.name.split(" ")[0]} *`
                                : "Numéro de Compte / IBAN d'Atelier *"}
                            </label>
                            <input
                              type="text"
                              value={conn.merchantPhone}
                              onChange={(e) => handleUpdateMerchantPhone(conn.channel, e.target.value)}
                              placeholder={needsPhone ? "+229 97 00 00 00" : "BJ660 01001 00000000000 12"}
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                color: "#F8F6F0",
                                fontSize: "13px",
                              }}
                            />
                          </div>
                          {isBank && (
                            <div>
                              <label style={{ display: "block", fontSize: "11.5px", color: "#D4B483", marginBottom: "4px", fontWeight: 600 }}>
                                Nom de la Banque & Titulaire du Compte
                              </label>
                              <input
                                type="text"
                                value={conn.merchantNumber}
                                onChange={(e) => handleUpdateMerchantNumber(conn.channel, e.target.value)}
                                placeholder="BOA Bénin - Atelier Kingston Bio"
                                style={{
                                  width: "100%",
                                  boxSizing: "border-box",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                                  border: "1px solid rgba(255, 255, 255, 0.15)",
                                  color: "#F8F6F0",
                                  fontSize: "13px",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Row: Direct Link to Shop & Submit Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <Link
              href={`/shop/${slug}`}
              target="_blank"
              className="seller-storefront-btn"
              style={{ padding: "10px 18px", fontSize: "12.5px" }}
              title="Ouvrir la vitrine publique pour voir le résultat en direct"
            >
              <span>Voir le résultat sur ma vitrine en direct ↗</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="seller-action-btn"
              style={{ padding: "12px 28px", fontSize: "14px", cursor: saving ? "wait" : "pointer" }}
            >
              {saving ? "Enregistrement..." : t.settings.saveChanges}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
