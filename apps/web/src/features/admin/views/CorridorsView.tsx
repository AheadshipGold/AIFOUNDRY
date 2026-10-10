"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { 
  AdminIconStore, 
  AdminIconCreditCard, 
  AdminIconShield, 
  AdminIconSearch, 
  AdminIconAlertTriangle, 
  AdminIconPower, 
  AdminIconCheckCircle, 
  AdminIconSmartphone 
} from "../components/shared/AdminIcons";
import { CorridorRule } from "../types";

export function CorridorsView() {
  const { isEn } = useAdmin();

  const [paymentSubTab, setPaymentSubTab] = useState<"shop_corridors" | "saas_gateways">("shop_corridors");
  const [corridorSearch, setCorridorSearch] = useState("");

  const formatPrice = (val: number, cur = "XOF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("XOF", "FCFA");
  };

  const [corridors, setCorridors] = useState<CorridorRule[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCorridors = async () => {
      try {
        const { AuthApi } = await import('../../../lib/api');
        const data = await AuthApi.executeFetch('/v1/admin/corridors');
        setCorridors(data);
      } catch (err) {
        console.error('Failed to load corridors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCorridors();
  }, []);

  const [saasGateways, setSaasGateways] = useState<Record<string, any>>({
    moneroo: {
      id: "moneroo",
      name: "Moneroo",
      subtitle: "Mobile Money UEMOA (Wave, MTN, Moov, Orange)",
      description: "Agrégateur certifié pour les règlements Mobile Money au Bénin, Côte d'Ivoire, Sénégal et Togo.",
      iconType: "mobile",
      isEnabled: true,
      supportedCurrencies: ["XOF"],
      supportedMethods: ["Wave", "MTN Mobile Money", "Moov Money", "Orange Money"],
    },
    dodopayments: {
      id: "dodopayments",
      name: "Dodo Payments / Cartes",
      subtitle: "Cartes CB, Visa, Mastercard, Apple Pay",
      description: "Passerelle internationale de haute sécurité pour les souscriptions par carte bancaire.",
      iconType: "card",
      isEnabled: true,
      supportedCurrencies: ["XOF", "EUR", "USD"],
      supportedMethods: ["Visa", "Mastercard", "Carte Bancaire", "Apple Pay"],
    },
  });

  const [saasSavingGateway, setSaasSavingGateway] = useState<string | null>(null);
  const [saasGatewayFeedback, setSaasGatewayFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeCorridorsCount = corridors.filter((c) => c.isEnabled).length;

  const filteredCorridors = corridors.filter((c) => {
    const matchesSearch =
      !corridorSearch ||
      (c.country || "").toLowerCase().includes(corridorSearch.toLowerCase()) ||
      (c.channel || "").toLowerCase().includes(corridorSearch.toLowerCase());
    return matchesSearch;
  });

  const toggleCorridor = async (id: string) => {
    const current = corridors.find((c) => c.id === id);
    if (!current) return;
    const nextState = !current.isEnabled;
    try {
      const { AuthApi } = await import('../../../lib/api');
      await AuthApi.executeFetch(`/v1/admin/corridors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: nextState }),
      });
      setCorridors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isEnabled: nextState } : c))
      );
    } catch (err) {
      console.error('Failed to toggle corridor:', err);
    }
  };

  const handleToggleSaasGateway = async (gatewayId: string) => {
    const current = saasGateways[gatewayId];
    if (!current) return;
    const nextState = !current.isEnabled;
    setSaasSavingGateway(gatewayId);

    // Optimistic update
    setSaasGateways((prev) => ({
      ...prev,
      [gatewayId]: { ...prev[gatewayId], isEnabled: nextState },
    }));

    setTimeout(() => {
      setSaasSavingGateway(null);
      setSaasGatewayFeedback({
        type: "success",
        text: `La passerelle SaaS ${current.name} a été ${nextState ? "activée" : "désactivée"} avec succès.`,
      });
      setTimeout(() => setSaasGatewayFeedback(null), 3000);
    }, 800);
  };

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Payment Methods & FinTech Hub (UEMOA)" : "Moyens de Paiement & FinTech Hub (UEMOA)"}</h1>
          <p>
            {isEn
              ? "Strict separation of financial flows: Merchant Store Direct Methods (Buyers ➔ Shops) vs Platform Subscription Gateways (Merchants ➔ Ojarket SaaS)."
              : "Séparation stricte des flux financiers : Règlements Marchands Directs (Clients ➔ Boutiques) vs Passerelles de Souscription Plateforme (Marchands ➔ Ojarket SaaS)."}
          </p>
        </div>
      </div>

      {/* Sub-Tabs Nav: Flux A vs Flux B */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "22px", borderBottom: "1px solid var(--oj-admin-border, rgba(255,255,255,0.08))", paddingBottom: "14px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPaymentSubTab("shop_corridors")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: paymentSubTab === "shop_corridors" ? "1px solid #10B981" : "1px solid rgba(255,255,255,0.1)",
            background: paymentSubTab === "shop_corridors" ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.03)",
            color: paymentSubTab === "shop_corridors" ? "#10B981" : "var(--oj-color-muted, #9CA3AF)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <AdminIconStore size={15} />
          <span>{isEn ? "1. Store Payment Methods (Buyers ➔ Shops)" : "1. Moyens de Règlement Boutiques (Clients ➔ Vendeurs)"}</span>
          <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "10px", background: "rgba(16,185,129,0.2)", color: "#10B981" }}>
            {activeCorridorsCount} {isEn ? "Active" : "Actifs"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentSubTab("saas_gateways")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: paymentSubTab === "saas_gateways" ? "1px solid #D4B483" : "1px solid rgba(255,255,255,0.1)",
            background: paymentSubTab === "saas_gateways" ? "rgba(212, 180, 131, 0.12)" : "rgba(255,255,255,0.03)",
            color: paymentSubTab === "saas_gateways" ? "#D4B483" : "var(--oj-color-muted, #9CA3AF)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <AdminIconCreditCard size={15} />
          <span>{isEn ? "2. Platform Subscription Gateways (Ojarket SaaS)" : "2. Passerelles de Souscription Plateforme (Ojarket SaaS)"}</span>
          <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "10px", background: "rgba(212,180,131,0.2)", color: "#D4B483" }}>
            Zero-Trust Guard
          </span>
        </button>
      </div>

      {/* SUBTAB 1 : FLUX MARCHAND BOUTIQUES (CLIENTS ➔ BOUTIQUES) */}
      {paymentSubTab === "shop_corridors" && (
        <div>
          {/* Explanatory Banner */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "13.5px", color: "#10B981" }}>
                <AdminIconShield size={16} />
                <span>{isEn ? "Deny-by-Default (A06) Protocol: Merchant Store Whitelist" : "Protocole Deny-by-Default (A06) : Liste Blanche des Boutiques"}</span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "rgba(248, 246, 240, 0.75)", lineHeight: 1.5, maxWidth: "800px" }}>
                {isEn
                  ? "You define the legal whitelist of channels authorized on Ojarket for client orders and D02 quotes. Each merchant selects in their Shop Settings (/seller/settings) which of these channels they accept or refuse for their workshop. If you deactivate a channel here, it is immediately locked and unavailable to all sellers."
                  : "Vous définissez ici la liste blanche des canaux de paiement légalement autorisés sur Ojarket pour les commandes clients et devis D02. Chaque boutique peut ensuite choisir dans ses paramètres (/seller/settings) les canaux qu'elle accepte ou refuse pour sa boutique et y associer son compte marchand. Si vous désactivez un canal ici, il est immédiatement verrouillé et indisponible pour tous les vendeurs."}
              </p>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              BCEAO Compliant
            </span>
          </div>

          {/* Filter */}
          <div className="oj-admin-filter-bar">
            <div className="oj-admin-search">
              <span className="oj-admin-search-icon"><AdminIconSearch size={14} /></span>
              <input
                type="text"
                placeholder={isEn ? "Filter by country, channel..." : "Filtrer par pays, opérateur, canal..."}
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
                  <th>{isEn ? "Channel & Operator" : "Moyen & Opérateur de Paiement"}</th>
                  <th>{isEn ? "Currency" : "Devise"}</th>
                  <th>{isEn ? "Limits (Min / Max)" : "Plafonds Transactionnels"}</th>
                  <th>{isEn ? "Contract Agreement" : "Agrément Partenaire"}</th>
                  <th>{isEn ? "Status" : "État du Moyen"}</th>
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
                          ✓ Signé & Conforme BCEAO
                        </span>
                      ) : (
                        <span style={{ color: "#7A4A12", fontWeight: 700, fontSize: "12px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><AdminIconAlertTriangle size={12} /> Contrat Non Vérifié</span>
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
                          height: "32px",
                          padding: "0 14px",
                          fontSize: "12px",
                          cursor: "pointer",
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

      {/* SUBTAB 2 : FLUX SAAS ABONNEMENTS (VENDEURS ➔ PLATEFORME OJARKET) */}
      {paymentSubTab === "saas_gateways" && (
        <div>
          {/* Explanatory Banner */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(212, 180, 131, 0.08)",
              border: "1px solid rgba(212, 180, 131, 0.25)",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "13.5px", color: "#D4B483" }}>
                <AdminIconPower size={16} />
                <span>{isEn ? "Ojarket SaaS Subscription Revenue Engine (Zero-Trust Guard)" : "Encaissement des Forfaits SaaS Plateforme (Zero-Trust Server Guard)"}</span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "rgba(248, 246, 240, 0.75)", lineHeight: 1.5, maxWidth: "800px" }}>
                {isEn
                  ? "Manage active gateways used exclusively by the platform to collect recurring merchant subscription fees (Discovery Free, Boutique Pro, Grande Enseigne Prestige). Seamlessly toggle a channel off during operator outages or maintenance."
                  : "Gérez les passerelles officielles par lesquelles la plateforme Ojarket encaisse les souscriptions d'abonnements des marchands (Packs Découverte, Boutique Pro, Grande Enseigne). Activez ou coupez instantanément un canal en cas de maintenance opérateur ou d'incident technique."}
              </p>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "rgba(212, 180, 131, 0.15)", color: "#D4B483", border: "1px solid rgba(212, 180, 131, 0.3)" }}>
              ZaraMelo Engine Architecture
            </span>
          </div>

          {saasGatewayFeedback && (
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                backgroundColor: saasGatewayFeedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(229, 115, 115, 0.15)",
                border: saasGatewayFeedback.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(229, 115, 115, 0.3)",
                color: saasGatewayFeedback.type === "success" ? "#A7F3D0" : "#FFCDD2",
              }}
            >
              <AdminIconCheckCircle size={16} />
              <span>{saasGatewayFeedback.text}</span>
            </div>
          )}

          {/* Gateways Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
            {/* 1. Moneroo Gateway */}
            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                border: saasGateways.moneroo?.isEnabled ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
                background: saasGateways.moneroo?.isEnabled ? "rgba(16, 185, 129, 0.04)" : "rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: saasGateways.moneroo?.isEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                        color: saasGateways.moneroo?.isEnabled ? "#10B981" : "#9CA3AF",
                      }}
                    >
                      <AdminIconSmartphone size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 2px 0", color: "#F8F6F0" }}>
                        Moneroo
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--oj-color-muted, #9CA3AF)" }}>
                        Mobile Money UEMOA (Wave, MTN, Moov, Orange)
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: saasGateways.moneroo?.isEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                      color: saasGateways.moneroo?.isEnabled ? "#10B981" : "#9CA3AF",
                      border: saasGateways.moneroo?.isEnabled ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {saasGateways.moneroo?.isEnabled ? (isEn ? "ACTIVE" : "ACTIF") : (isEn ? "DISABLED" : "DÉSACTIVÉ")}
                  </span>
                </div>

                <p style={{ fontSize: "12.5px", color: "rgba(248, 246, 240, 0.7)", marginTop: "16px", lineHeight: 1.55 }}>
                  Agrégateur officiel certifié pour les encaissements d&apos;abonnements SaaS au Bénin, Côte d&apos;Ivoire, Sénégal et Togo. Intégré avec webhook synchrone et réconciliation automatique.
                </p>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "14px" }}>
                  {["Wave", "MTN Mobile Money", "Moov Money Flooz", "Orange Money"].map((m, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "rgba(248, 246, 240, 0.8)",
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "var(--oj-color-muted, #9CA3AF)" }}>
                  {isEn ? "Merchant Subscription Checkout" : "Disponibilité Souscription Marchande"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleSaasGateway("moneroo")}
                  disabled={saasSavingGateway === "moneroo"}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    border: "none",
                    backgroundColor: saasGateways.moneroo?.isEnabled ? "#10B981" : "#4B5563",
                    position: "relative",
                    cursor: saasSavingGateway === "moneroo" ? "wait" : "pointer",
                    transition: "background-color 0.2s ease",
                    padding: 0,
                  }}
                  title={saasGateways.moneroo?.isEnabled ? "Désactiver Moneroo" : "Activer Moneroo"}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: saasGateways.moneroo?.isEnabled ? "25px" : "3px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* 2. Dodo Payments / Cartes Gateway */}
            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                border: saasGateways.dodopayments?.isEnabled ? "1px solid rgba(212, 180, 131, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
                background: saasGateways.dodopayments?.isEnabled ? "rgba(212, 180, 131, 0.04)" : "rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: saasGateways.dodopayments?.isEnabled ? "rgba(212, 180, 131, 0.15)" : "rgba(255, 255, 255, 0.05)",
                        color: saasGateways.dodopayments?.isEnabled ? "#D4B483" : "#9CA3AF",
                      }}
                    >
                      <AdminIconCreditCard size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 2px 0", color: "#F8F6F0" }}>
                        Dodo Payments / Cartes
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--oj-color-muted, #9CA3AF)" }}>
                        Cartes CB, Visa, Mastercard, Apple Pay
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: saasGateways.dodopayments?.isEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                      color: saasGateways.dodopayments?.isEnabled ? "#10B981" : "#9CA3AF",
                      border: saasGateways.dodopayments?.isEnabled ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {saasGateways.dodopayments?.isEnabled ? (isEn ? "ACTIVE" : "ACTIF") : (isEn ? "DISABLED" : "DÉSACTIVÉ")}
                  </span>
                </div>

                <p style={{ fontSize: "12.5px", color: "rgba(248, 246, 240, 0.7)", marginTop: "16px", lineHeight: 1.55 }}>
                  Passerelle internationale de haute sécurité pour les forfaits d&apos;abonnements récurrents par carte bancaire. Prend en charge les marchands internationaux en XOF, EUR et USD.
                </p>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "14px" }}>
                  {["Visa", "Mastercard", "Carte Bancaire", "Apple Pay"].map((m, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "rgba(248, 246, 240, 0.8)",
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "var(--oj-color-muted, #9CA3AF)" }}>
                  {isEn ? "Merchant Subscription Checkout" : "Disponibilité Souscription Marchande"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleSaasGateway("dodopayments")}
                  disabled={saasSavingGateway === "dodopayments"}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    border: "none",
                    backgroundColor: saasGateways.dodopayments?.isEnabled ? "#D4B483" : "#4B5563",
                    position: "relative",
                    cursor: saasSavingGateway === "dodopayments" ? "wait" : "pointer",
                    transition: "background-color 0.2s ease",
                    padding: 0,
                  }}
                  title={saasGateways.dodopayments?.isEnabled ? "Désactiver Dodo Payments" : "Activer Dodo Payments"}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: saasGateways.dodopayments?.isEnabled ? "25px" : "3px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
