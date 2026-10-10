"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../seller.css";

interface PlanFeature {
  tier: "DECOUVERTE_FREE" | "ATELIER_PRO" | "MAISON_D_ART_PRESTIGE";
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

interface PaymentCorridor {
  id?: string;
  code: string;
  title: string;
  category: "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER" | "OTHER";
  operator: string;
  currency?: string;
  country?: string;
  description?: string;
  isEnabled?: boolean;
  minAmountMinor?: number;
  maxAmountMinor?: number;
}

export default function SellerSubscriptionPage() {
  const [interval, setInterval] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Active payment corridors from admin
  const [corridors, setCorridors] = useState<PaymentCorridor[]>([]);
  const [loadingCorridors, setLoadingCorridors] = useState(true);

  // Modal checkout state
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<PlanFeature | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>("MTN_MOMO");
  const [phone, setPhone] = useState("+229 97 00 11 22");
  const [cardHolder, setCardHolder] = useState("Boutique Kingston Bio");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("489");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
        "Jusqu’à 5 créations phares en vitrine",
        "Livre de caisse direct & balances certifiées",
        "Réception des règlements clients en direct",
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
        "Créations & variantes illimitées en vitrine",
        "Accès prioritaire aux commandes sur-mesure D02",
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
        "Conciergerie VIP dédiée 7j/7 & arbitrage sous 2h",
        "Mise en avant éditoriale sur la vitrine Web Ojarket",
        "Distribution d'actifs numériques & guides protégés",
        "Passerelles multi-devises & corridors régionaux",
      ],
    },
  ];

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/subscriptions/current");
      if (res.ok) {
        const data = await res.json();
        setCurrentSub(data);
      }
    } catch (err) {
      console.error("Erreur de chargement de l'abonnement:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCorridors = async () => {
    try {
      setLoadingCorridors(true);
      // Flux B : Passerelles de souscription SaaS officielles de la plateforme (Zero-Trust Guard)
      const res = await fetch("/api/v1/subscriptions/gateways");
      if (res.ok) {
        const data = await res.json();
        if (data.gateways) {
          const list: PaymentCorridor[] = [];
          if (data.gateways.moneroo?.isEnabled) {
            list.push({
              code: "MONEROO",
              title: "Moneroo Mobile Money",
              operator: "Wave, MTN MoMo, Moov Money, Orange Money",
              country: "Zone UEMOA (Bénin, CI, Sénégal, Togo)",
              category: "MOBILE_MONEY",
              description: "Paiement instantané par Mobile Money agréé",
            });
          }
          if (data.gateways.dodopayments?.isEnabled) {
            list.push({
              code: "CARD",
              title: "Cartes Bancaires Internationales",
              operator: "CB, Visa, Mastercard, Apple Pay",
              country: "International (Multi-devises)",
              category: "CARD",
              description: "Règlement sécurisé par carte bancaire",
            });
          }
          if (list.length > 0) {
            setCorridors(list);
            setSelectedChannel(list[0].code);
            return;
          }
        }
      }

      // Fallback sur corridors généraux si nécessaire
      const fallbackRes = await fetch("/api/v1/corridors");
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data.corridors && Array.isArray(data.corridors)) {
          setCorridors(data.corridors);
          if (data.corridors.length > 0) {
            setSelectedChannel(data.corridors[0].code);
          }
        }
      }
    } catch (err) {
      console.error("Erreur de chargement des passerelles de souscription:", err);
    } finally {
      setLoadingCorridors(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchCorridors();
  }, []);

  const handleOpenCheckoutModal = (plan: PlanFeature) => {
    setFeedback(null);
    setCheckoutModalPlan(plan);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setCheckoutModalPlan(null);
  };

  const handleActivateFreePlan = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: currentSub?.shopId,
          planTier: "DECOUVERTE_FREE",
          billingInterval: interval,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'activation du forfait gratuit.");

      setFeedback({ type: "success", message: "Le Forfait Découverte a été activé avec succès." });
      if (data.subscription) {
        setCurrentSub(data.subscription);
      } else {
        await fetchSubscription();
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erreur lors de l'activation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutModalPlan) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: currentSub?.shopId,
          planTier: checkoutModalPlan.tier,
          billingInterval: interval,
          paymentChannel: selectedChannel,
          payerPhone: phone,
          payerName: cardHolder,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec du règlement de l'abonnement.");
      }

      setFeedback({
        type: "success",
        message: data.message || `Votre forfait ${checkoutModalPlan.title} est désormais actif !`,
      });

      if (data.subscription) {
        setCurrentSub(data.subscription);
      } else {
        await fetchSubscription();
      }

      // Close modal smoothly after brief celebration
      setTimeout(() => {
        setCheckoutModalPlan(null);
      }, 1400);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erreur lors du traitement de la transaction.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "32px" }}>
      {/* Title Header - Zero Vendor Leak, Pure Prestige */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#AD8455",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Forfaits Marchands &amp; Capacités Commerciales
        </div>
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "32px",
            color: "#F8F6F0",
            fontFamily: "var(--oj-font-editorial, serif)",
            letterSpacing: "0.02em",
          }}
        >
          Abonnements Marchands &amp; Services d&apos;Élite
        </h1>
        <p
          style={{
            margin: 0,
            color: "rgba(248, 246, 240, 0.72)",
            fontSize: "14.5px",
            maxWidth: "680px",
            marginInline: "auto",
            lineHeight: 1.6,
          }}
        >
          Débloquez l&apos;intégralité du Merchant Commerce OS : gestion multi-créations, accès prioritaire aux devis sur-mesure D02, balances certifiées et conciergerie d&apos;exception.
        </p>
      </div>

      {/* Global Inline Notification */}
      {feedback && !checkoutModalPlan && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            backgroundColor: feedback.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            color: feedback.type === "success" ? "#34D399" : "#F87171",
            border: `1px solid ${feedback.type === "success" ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)}"}`,
            marginBottom: "28px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontWeight: 500,
          }}
        >
          {feedback.type === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Current Subscription Status Card */}
      {currentSub && (
        <div
          style={{
            padding: "24px 28px",
            borderRadius: "16px",
            border: "1px solid rgba(212, 180, 131, 0.35)",
            background: "linear-gradient(135deg, rgba(173, 132, 85, 0.08) 0%, rgba(7, 93, 73, 0.08) 100%)",
            marginBottom: "36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11.5px",
                color: "#D4B483",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              FORFAIT ACTIF DE LA BOUTIQUE · {currentSub.shopName || "Kingston Bio"}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#F8F6F0", margin: "6px 0 4px" }}>
              {currentSub.planTier === "ATELIER_PRO"
                ? "Plan Boutique Pro"
                : currentSub.planTier === "MAISON_D_ART_PRESTIGE"
                ? "Grande Enseigne & Prestige"
                : "Plan Découverte Boutique"}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.65)" }}>
              Statut :{" "}
              <span style={{ color: "#34D399", fontWeight: 700 }}>
                {currentSub.status === "ACTIVE" ? "ACTIF & CERTIFIÉ" : currentSub.status}
              </span>{" "}
              · Fin de période :{" "}
              <span style={{ color: "#F8F6F0" }}>
                {new Date(currentSub.currentPeriodEnd).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Quota Créations
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#F8F6F0" }}>
                {currentSub.maxProducts > 100 ? "Illimitées" : `${currentSub.maxProducts} Produits`}
              </div>
            </div>

            <div style={{ height: "36px", width: "1px", backgroundColor: "rgba(255, 255, 255, 0.12)" }} />

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Devis Sur-Mesure
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: currentSub.hasPriorityD02 ? "#34D399" : "rgba(248, 246, 240, 0.5)" }}>
                {currentSub.hasPriorityD02 ? "Prioritaire" : "Standard"}
              </div>
            </div>

            <div style={{ height: "36px", width: "1px", backgroundColor: "rgba(255, 255, 255, 0.12)" }} />

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Export FEC
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: currentSub.hasFecExport ? "#34D399" : "rgba(248, 246, 240, 0.5)" }}>
                {currentSub.hasFecExport ? "Certifié" : "Non inclus"}
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
            backgroundColor: "#0B1614",
            border: "1px solid #1C2E2A",
          }}
        >
          <button
            type="button"
            onClick={() => setInterval("MONTHLY")}
            style={{
              padding: "8px 22px",
              borderRadius: "24px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: interval === "MONTHLY" ? "#075D49" : "transparent",
              color: interval === "MONTHLY" ? "#FFFFFF" : "rgba(248, 246, 240, 0.65)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            Facturation Mensuelle
          </button>
          <button
            type="button"
            onClick={() => setInterval("ANNUAL")}
            style={{
              padding: "8px 22px",
              borderRadius: "24px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: interval === "ANNUAL" ? "#075D49" : "transparent",
              color: interval === "ANNUAL" ? "#FFFFFF" : "rgba(248, 246, 240, 0.65)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
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
                letterSpacing: "0.04em",
              }}
            >
              2 MOIS OFFERTS (-17%)
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "48px" }}>
        {plans.map((p) => {
          const isCurrent = currentSub?.planTier === p.tier;
          const price = interval === "ANNUAL" ? p.priceAnnualMinor / 100 : p.priceMonthlyMinor / 100;
          const isFeatured = p.tier === "ATELIER_PRO";
          const isPrestige = p.tier === "MAISON_D_ART_PRESTIGE";

          return (
            <div
              key={p.tier}
              className={`seller-plan-card ${isFeatured ? "featured" : ""} ${isPrestige ? "prestige" : ""}`}
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
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: "20px",
                    letterSpacing: "0.1em",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  RECOMMANDÉ POUR BOUTIQUE
                </div>
              )}

              {isPrestige && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#AD8455",
                    color: "#081018",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: "20px",
                    letterSpacing: "0.1em",
                    border: "1px solid #E2CA9D",
                    whiteSpace: "nowrap",
                  }}
                >
                  PRESTIGE &amp; CONCIERGERIE
                </div>
              )}

              <div style={{ marginBottom: "18px" }}>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: "20px",
                    color: "#F8F6F0",
                    fontFamily: "var(--oj-font-editorial, serif)",
                  }}
                >
                  {p.title}
                </h3>
                <div style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.65)" }}>
                  {p.tier === "DECOUVERTE_FREE"
                    ? "Idéal pour lancer sa boutique"
                    : p.tier === "ATELIER_PRO"
                    ? "Pour les créateurs & boutiques en croissance"
                    : "Pour les grandes maisons & joailliers d'art"}
                </div>
              </div>

              <div style={{ margin: "12px 0 22px" }}>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: isPrestige ? "#D4B483" : isFeatured ? "#34D399" : "#F8F6F0",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {price.toLocaleString("fr-FR")}
                </span>
                <span style={{ fontSize: "13.5px", color: "rgba(248, 246, 240, 0.65)", marginLeft: "8px" }}>
                  FCFA / {interval === "ANNUAL" ? "an" : "mois"}
                </span>
              </div>

              <div style={{ height: "1px", backgroundColor: "#1C2E2A", marginBottom: "24px" }} />

              <div style={{ flex: 1, marginBottom: "32px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#AD8455",
                    marginBottom: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Privilèges inclus :
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {p.featuresList.map((feat, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "13px",
                        color: "rgba(248, 246, 240, 0.88)",
                        lineHeight: 1.45,
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: "2px" }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button - Zero Vendor Leak, Pure Prestige */}
              {isCurrent ? (
                <div className="seller-plan-current-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Votre Forfait Actuel</span>
                </div>
              ) : p.tier === "DECOUVERTE_FREE" ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleActivateFreePlan}
                  className="seller-plan-choose-btn free-btn"
                >
                  {isSubmitting ? "Activation en cours..." : "Activer le Forfait Découverte"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenCheckoutModal(p)}
                  className={`seller-plan-choose-btn ${isPrestige ? "prestige-btn" : ""}`}
                >
                  <span>Choisir ce Forfait</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Security & Corridor Badge - Pure White-Label Standard */}
      <div
        style={{
          padding: "22px 28px",
          borderRadius: "14px",
          backgroundColor: "#0B1614",
          border: "1px solid #1C2E2A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(7, 93, 73, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#34D399",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#F8F6F0" }}>
              Infrastructure de Paiement Sécurisée &amp; Agréée
            </div>
            <div style={{ fontSize: "12.5px", color: "rgba(248, 246, 240, 0.65)", marginTop: "2px" }}>
              Corridors certifiés UEMOA : Cartes Bancaires (Visa, Mastercard), MTN Mobile Money, Moov Money, Celtiis Cash, Virement Bancaire.
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "11.5px",
            color: "#D4B483",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
          Conformité FinOps &amp; Audits Immuables (Deny-by-Default A06)
        </div>
      </div>

      {/* Prestige Checkout Modal */}
      {checkoutModalPlan && (
        <div className="seller-modal-overlay" onClick={handleCloseModal}>
          <div className="seller-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button type="button" onClick={handleCloseModal} className="seller-modal-close-btn" aria-label="Fermer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#AD8455",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                RÈGLEMENT SÉCURISÉ DU FORFAIT D&apos;ÉLITE
              </div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "24px",
                  color: "#F8F6F0",
                  fontFamily: "var(--oj-font-editorial, serif)",
                }}
              >
                Souscrire au {checkoutModalPlan.title}
              </h2>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#34D399" }}>
                  {(interval === "ANNUAL"
                    ? checkoutModalPlan.priceAnnualMinor / 100
                    : checkoutModalPlan.priceMonthlyMinor / 100
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </span>
                <span style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.65)" }}>
                  / {interval === "ANNUAL" ? "an" : "mois"}
                </span>
                {interval === "ANNUAL" && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      backgroundColor: "#AD8455",
                      color: "#081018",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    2 MOIS OFFERTS
                  </span>
                )}
              </div>
            </div>

            {/* Modal Error/Success feedback */}
            {feedback && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: feedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: feedback.type === "success" ? "#34D399" : "#F87171",
                  border: `1px solid ${feedback.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)}"}`,
                  marginBottom: "20px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Step 1: Select Administrator-Approved Corridor */}
            <div style={{ marginBottom: "22px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#D4B483",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                1. MOYEN DE PAIEMENT SÉCURISÉ (CONTRÔLE ADMINISTRATEUR)
              </div>

              {loadingCorridors ? (
                <div style={{ color: "rgba(248, 246, 240, 0.6)", fontSize: "13px", padding: "16px 0" }}>
                  Chargement des corridors agréés...
                </div>
              ) : corridors.length === 0 ? (
                <div style={{ color: "#F87171", fontSize: "13px", padding: "12px" }}>
                  Aucun canal de paiement n&apos;est actuellement ouvert par l&apos;administrateur (Deny-by-Default actif).
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {corridors.map((c) => {
                    const isSelected = selectedChannel === c.code;
                    return (
                      <div
                        key={c.code}
                        onClick={() => setSelectedChannel(c.code)}
                        className={`seller-corridor-tile ${isSelected ? "selected" : ""}`}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {/* Channel Vector Icon */}
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              backgroundColor: isSelected ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isSelected ? "#34D399" : "#D4B483",
                            }}
                          >
                            {c.category === "CARD" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                              </svg>
                            ) : c.category === "BANK_TRANSFER" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="21" x2="21" y2="21" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                                <polyline points="5 6 12 3 19 6" />
                                <line x1="4" y1="10" x2="4" y2="21" />
                                <line x1="20" y1="10" x2="20" y2="21" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#F8F6F0" }}>{c.title}</div>
                            <div style={{ fontSize: "11.5px", color: "rgba(248, 246, 240, 0.6)" }}>{c.operator}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? "#10B981" : "rgba(255, 255, 255, 0.3)}"}`,
                            backgroundColor: isSelected ? "#10B981" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Payment Parameters */}
            <div style={{ marginBottom: "26px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#D4B483",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                2. DÉTAILS DU RÈGLEMENT
              </div>

              {selectedChannel === "CARD" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", display: "block", marginBottom: "4px" }}>
                      Titulaire de la carte
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#F8F6F0",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", display: "block", marginBottom: "4px" }}>
                      Numéro de Carte Sécurisé
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#F8F6F0",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                        letterSpacing: "0.08em",
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", display: "block", marginBottom: "4px" }}>
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          color: "#F8F6F0",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", display: "block", marginBottom: "4px" }}>
                        Cryptogramme (CVC)
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          color: "#F8F6F0",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "rgba(248, 246, 240, 0.55)", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Paiement crypté 256-bit certifié PCI-DSS. Vos coordonnées ne sont jamais stockées en clair.</span>
                  </div>
                </div>
              ) : selectedChannel === "DIRECT_TRANSFER" ? (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(212, 180, 131, 0.08)",
                    border: "1px solid rgba(212, 180, 131, 0.25)",
                    fontSize: "12.5px",
                    color: "rgba(248, 246, 240, 0.85)",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#D4B483", marginBottom: "4px" }}>
                    Compte Séquestre UEMOA certifié Ojarket
                  </div>
                  <div>Banque : Bank of Africa (BOA) Bénin / UEMOA</div>
                  <div>IBAN / RIB : BJ061 01001 001234567890 42</div>
                  <div style={{ fontSize: "11.5px", color: "rgba(248, 246, 240, 0.6)", marginTop: "6px" }}>
                    Le forfait s&apos;activera immédiatement après confirmation de la référence de virement.
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", display: "block", marginBottom: "6px" }}>
                    Numéro de Téléphone Mobile Money
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#F8F6F0",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      letterSpacing: "0.04em",
                    }}
                  />
                  <div style={{ fontSize: "11.5px", color: "rgba(248, 246, 240, 0.55)", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span>Une requête d&apos;autorisation sécurisée s&apos;affichera sur votre écran mobile. Saisissez votre code PIN secret pour confirmer.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCloseModal}
                className="seller-secondary-btn"
                style={{ flex: 1, padding: "12px", justifyContent: "center", fontSize: "13px" }}
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isSubmitting || corridors.length === 0}
                onClick={handleConfirmCheckout}
                className="seller-action-btn"
                style={{
                  flex: 2,
                  padding: "12px 18px",
                  justifyContent: "center",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  opacity: isSubmitting || corridors.length === 0 ? 0.65 : 1,
                }}
              >
                {isSubmitting ? "Validation de la Transaction..." : "Confirmer & Activer l'Abonnement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
