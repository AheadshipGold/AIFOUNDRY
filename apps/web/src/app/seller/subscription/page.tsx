"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../../landing.css";

interface PlanFeature {
  tier: string;
  title: string;
  priceMonthlyMinor: number;
  priceAnnualMinor: number;
  maxProducts: number;
  hasPriorityD02: boolean;
  hasFecExport: boolean;
  hasVipConcierge: boolean;
  featuresList: string[];
}

interface CurrentSubscription {
  id: string;
  shopId: string;
  shopName: string;
  planTier: string;
  status: string;
  billingSource: string;
  billingInterval: string;
  priceMinor: number;
  currency: string;
  maxProducts: number;
  hasPriorityD02: boolean;
  hasFecExport: boolean;
  hasVipConcierge: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  externalPaymentRef?: string;
}

export default function SellerSubscriptionPage() {
  const [interval, setInterval] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [email] = useState("contact@kingstonbio.bj");
  const [phone] = useState("+229 97 00 11 22");
  const [merchantName] = useState("Boutique Kingston Bio");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const plans: PlanFeature[] = [
    {
      tier: "DECOUVERTE_FREE",
      title: "Plan Découverte Boutique",
      priceMonthlyMinor: 0,
      priceAnnualMinor: 0,
      maxProducts: 5,
      hasPriorityD02: false,
      hasFecExport: false,
      hasVipConcierge: false,
      featuresList: [
        "Jusqu’à 5 produits phares en vitrine",
        "Livre de caisse direct & balances certifiées",
        "Réception des paiements MTN MoMo & Moov Money",
        "0% de commission d'intermédiation",
      ],
    },
    {
      tier: "ATELIER_PRO",
      title: "Plan Boutique Pro",
      priceMonthlyMinor: 1500000, // 15 000 FCFA
      priceAnnualMinor: 15000000, // 150 000 FCFA
      maxProducts: 9999,
      hasPriorityD02: true,
      hasFecExport: true,
      hasVipConcierge: false,
      featuresList: [
        "Produits & variantes illimités en vitrine",
        "Accès prioritaire aux devis et commandes sur-mesure (D02)",
        "Badge Commerçant / Boutique Vérifiée",
        "Export comptable FEC / FinOps certifié",
        "Comptes multi-utilisateurs gérants & caissiers",
      ],
    },
    {
      tier: "MAISON_D_ART_PRESTIGE",
      title: "Grande Enseigne & Prestige",
      priceMonthlyMinor: 4500000, // 45 000 FCFA
      priceAnnualMinor: 45000000, // 450 000 FCFA
      maxProducts: 9999,
      hasPriorityD02: true,
      hasFecExport: true,
      hasVipConcierge: true,
      featuresList: [
        "Toutes les options du Plan Boutique Pro",
        "Conciergerie dédiée 7j/7 & arbitrage VIP sous 2h",
        "Mise en avant éditoriale sur la vitrine Web",
        "Distribution d'actifs numériques & guides protégés",
        "Passerelles multi-devises & corridors régionaux",
      ],
    },
  ];

  useEffect(() => {
    fetch("/api/v1/subscriptions/current")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCurrentSub(data);
      })
      .catch(() => {
        // Fallback mock
        setCurrentSub({
          id: "sub-01",
          shopId: "shop-01",
          shopName: "Boutique d'Excellence Kingston Bio",
          planTier: "ATELIER_PRO",
          status: "ACTIVE",
          billingSource: "MONEROO",
          billingInterval: "MONTHLY",
          priceMinor: 1500000,
          currency: "XOF",
          maxProducts: 9999,
          hasPriorityD02: true,
          hasFecExport: true,
          hasVipConcierge: false,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        });
      });
  }, []);

  const handleCheckoutMoneroo = async (planTier: string) => {
    setLoading(true);
    setCheckoutMessage(null);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/v1/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: currentSub?.shopId || "shop-01",
          planTier,
          billingInterval: interval,
          customerEmail: email,
          customerName: merchantName,
          customerPhone: phone,
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'initialiser la session de paiement.");
      }

      const result = await response.json();

      if (result.checkoutUrl) {
        if (result.isSandbox || result.checkoutUrl.startsWith("/")) {
          // Simulation locale acceptée
          setCheckoutMessage("Paiement Mobile Money validé avec succès (Environnement de démonstration). Votre abonnement a été synchronisé.");
          setCurrentSub((prev) =>
            prev
              ? {
                  ...prev,
                  planTier,
                  billingInterval: interval,
                  status: "ACTIVE",
                  billingSource: "MONEROO",
                }
              : null
          );
        } else {
          // Redirection vers la passerelle Moneroo
          window.location.href = result.checkoutUrl;
        }
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Erreur lors de l'initialisation du paiement Moneroo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-root">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand-link">
            <div className="brand-symbol">Ọ</div>
            <div className="brand-text-block">
              <span className="brand-title">OJAR盤KET</span>
              <span className="brand-sub">GESTION DES ABONNEMENTS SAAS</span>
            </div>
          </Link>
          <div className="landing-header-actions">
            <Link href="/seller" className="btn-portal-secondary">
              ← Tableau de Bord Vendeur
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="landing-container" style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Title Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#AD8455", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            OFFRES MARCHANDES & FACTURATION (FR-37 À FR-41)
          </div>
          <h1 style={{ margin: "12px 0 8px", fontSize: "32px", color: "var(--oj-text-primary)", fontFamily: "Playfair Display, Georgia, serif" }}>
            Abonnements Marchands & Passerelle Mobile Money
          </h1>
          <p style={{ margin: 0, color: "var(--oj-text-secondary)", fontSize: "15px", maxWidth: "600px", marginInline: "auto" }}>
            Débloquez la puissance du système d&apos;exploitation commercial Ojarket avec un règlement sécurisé par MTN MoMo, Moov Money, Wave ou Orange Money.
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSub && (
          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #D4B483",
              background: "linear-gradient(135deg, rgba(173, 132, 85, 0.08) 0%, rgba(7, 93, 73, 0.06) 100%)",
              marginBottom: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#AD8455", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                ABONNEMENT ACTIF DE LA BOUTIQUE
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#075D49", margin: "4px 0" }}>
                {currentSub.planTier === "ATELIER_PRO"
                  ? "Plan Boutique Pro"
                  : currentSub.planTier === "MAISON_D_ART_PRESTIGE"
                  ? "Grande Enseigne & Prestige"
                  : "Plan Découverte Boutique"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--oj-text-secondary)" }}>
                Statut : <span style={{ color: "#10B981", fontWeight: 600 }}>ACTIF</span> · Fin de période :{" "}
                {new Date(currentSub.currentPeriodEnd).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--oj-text-secondary)", textTransform: "uppercase" }}>Quota Produits</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--oj-text-primary)" }}>
                  {currentSub.maxProducts > 100 ? "Illimités" : currentSub.maxProducts + " Produits"}
                </div>
              </div>
              <div style={{ height: "32px", width: "1px", backgroundColor: "var(--oj-border)" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--oj-text-secondary)", textTransform: "uppercase" }}>Devis Sur-Mesure</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: currentSub.hasPriorityD02 ? "#10B981" : "var(--oj-text-secondary)" }}>
                  {currentSub.hasPriorityD02 ? "Prioritaire" : "Standard"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Interval Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "4px",
              borderRadius: "30px",
              backgroundColor: "rgba(7, 93, 73, 0.08)",
              border: "1px solid var(--oj-border)",
            }}
          >
            <button
              type="button"
              onClick={() => setInterval("MONTHLY")}
              style={{
                padding: "8px 20px",
                borderRadius: "24px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: interval === "MONTHLY" ? "#075D49" : "transparent",
                color: interval === "MONTHLY" ? "#FFFFFF" : "var(--oj-text-secondary)",
                transition: "all 0.2s ease",
              }}
            >
              Facturation Mensuelle
            </button>
            <button
              type="button"
              onClick={() => setInterval("ANNUAL")}
              style={{
                padding: "8px 20px",
                borderRadius: "24px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: interval === "ANNUAL" ? "#075D49" : "transparent",
                color: interval === "ANNUAL" ? "#FFFFFF" : "var(--oj-text-secondary)",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Facturation Annuelle
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  backgroundColor: "#AD8455",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                2 MOIS OFFERTS
              </span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {checkoutMessage && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              color: "#075D49",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              marginBottom: "24px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            ✓ {checkoutMessage}
          </div>
        )}

        {checkoutError && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              color: "#DC2626",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              marginBottom: "24px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            ✕ {checkoutError}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "48px" }}>
          {plans.map((p) => {
            const isCurrent = currentSub?.planTier === p.tier;
            const price = interval === "ANNUAL" ? p.priceAnnualMinor / 100 : p.priceMonthlyMinor / 100;
            const isFeatured = p.tier === "ATELIER_PRO";

            return (
              <div
                key={p.tier}
                style={{
                  borderRadius: "18px",
                  border: isFeatured ? "2px solid #075D49" : "1px solid var(--oj-border)",
                  backgroundColor: "var(--oj-surface)",
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: isFeatured ? "0 12px 32px rgba(7, 93, 73, 0.12)" : "none",
                }}
              >
                {isFeatured && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#075D49",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: "20px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    RECOMMANDÉ POUR BOUTIQUE
                  </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "20px", color: "var(--oj-text-primary)" }}>{p.title}</h3>
                  <div style={{ fontSize: "13px", color: "var(--oj-text-secondary)" }}>
                    {p.tier === "DECOUVERTE_FREE"
                      ? "Idéal pour lancer sa boutique"
                      : p.tier === "ATELIER_PRO"
                      ? "Pour les boutiques en forte croissance"
                      : "Pour les grandes enseignes et joailliers"}
                  </div>
                </div>

                <div style={{ margin: "16px 0 24px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 700, color: "#075D49", fontVariantNumeric: "tabular-nums" }}>
                    {price.toLocaleString("fr-FR")}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--oj-text-secondary)", marginLeft: "6px" }}>
                    FCFA / {interval === "ANNUAL" ? "an" : "mois"}
                  </span>
                </div>

                <div style={{ height: "1px", backgroundColor: "var(--oj-border)", marginBottom: "24px" }} />

                <div style={{ flex: 1, marginBottom: "32px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--oj-text-secondary)", marginBottom: "12px", textTransform: "uppercase" }}>
                    Inclus dans l&apos;offre :
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {p.featuresList.map((feat, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "var(--oj-text-primary)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={loading || (isCurrent && currentSub?.billingInterval === interval)}
                  onClick={() => handleCheckoutMoneroo(p.tier)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: isCurrent ? "default" : "pointer",
                    backgroundColor: isCurrent ? "rgba(7, 93, 73, 0.12)" : isFeatured ? "#075D49" : "var(--oj-border)",
                    color: isCurrent ? "#075D49" : isFeatured ? "#FFFFFF" : "var(--oj-text-primary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading
                    ? "Connexion Passerelle..."
                    : isCurrent
                    ? "✓ Plan Actuel"
                    : p.tier === "DECOUVERTE_FREE"
                    ? "Sélectionner Gratuit"
                    : "Payer par Mobile Money (Moneroo)"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Corridor Badge */}
        <div
          style={{
            padding: "20px 28px",
            borderRadius: "14px",
            backgroundColor: "var(--oj-surface)",
            border: "1px solid var(--oj-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(7, 93, 73, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#075D49",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--oj-text-primary)" }}>
                Paiement Sécurisé Panafricain Moneroo
              </div>
              <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)" }}>
                Corridors certifiés : MTN MoMo (*880#), Moov Money (*155#), Wave, Orange Money.
              </div>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#AD8455", fontWeight: 600 }}>
            Conformité FinOps & Audits Immuables
          </div>
        </div>
      </main>
    </div>
  );
}
