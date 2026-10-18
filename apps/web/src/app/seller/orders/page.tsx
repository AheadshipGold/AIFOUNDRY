"use client";

import React, { useState, useEffect } from "react";
import { getStoredToken, getStoredUser } from "@/lib/api";
import { sellerTranslations, SellerLocale, getInitialSellerLocale } from "@/lib/seller-i18n";

interface OrderRecord {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone?: string;
  deliveryAddress?: string;
  totalAmountMinor: number;
  currency: string;
  paymentChannel?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  createdAt?: string;
  lines?: Array<{
    itemTitle: string;
    quantity: number;
    unitPriceMinor: number;
  }>;
}

export default function SellerOrdersPage() {
  const [locale, setLocale] = useState<SellerLocale>("fr");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "DECLARED" | "PENDING_PAYMENT" | "PREPARING" | "SHIPPED" | "DELIVERED">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    try {
      const initial = getInitialSellerLocale();
      setLocale(initial);
    } catch {}

    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    const token = getStoredToken();
    const storedUser = getStoredUser();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    };

    fetch("/api/v1/seller/orders", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: "PREPARING" | "SHIPPED" | "DELIVERED") => {
    setActionLoading(orderId);
    const token = getStoredToken();
    const storedUser = getStoredUser();

    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
        },
        body: JSON.stringify({ fulfillmentStatus: nextStatus }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || "Erreur de mise à jour du statut");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: nextStatus } : o))
      );
    } catch (err: any) {
      alert(err.message || "Impossible de mettre à jour la commande");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setActionLoading(orderId);
    const token = getStoredToken();
    const storedUser = getStoredUser();

    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
        },
        body: JSON.stringify({ paymentStatus: "CONFIRMED" }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || "Erreur de validation de l'encaissement");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "CONFIRMED" } : o))
      );
    } catch (err: any) {
      alert(err.message || "Impossible de valider l'encaissement");
    } finally {
      setActionLoading(null);
    }
  };

  const handleContactBuyerWhatsApp = (ord: OrderRecord) => {
    const rawPhone = ord.buyerPhone || "";
    let clean = rawPhone.replace(/[^\d+]/g, "");
    if (!clean.startsWith("+") && clean.length >= 8) {
      clean = clean.length === 8 ? `+229${clean}` : `+${clean}`;
    }
    const amountStr = formatPrice(ord.totalAmountMinor);
    const msg = encodeURIComponent(
      `Bonjour ${ord.buyerName}, nous faisons suite à votre commande #${ord.orderNumber} d'un montant de ${amountStr} sur notre boutique Kingston Bio. Avez-vous besoin d'assistance pour finaliser ou vérifier votre règlement ?`
    );
    window.open(`https://wa.me/${clean.replace("+", "")}?text=${msg}`, "_blank");
  };

  const t = sellerTranslations[locale];

  const formatPrice = (minor: number) => {
    return (minor / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " FCFA";
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "DECLARED") return o.paymentStatus === "DECLARED";
    if (filter === "PENDING_PAYMENT") return o.paymentStatus === "PENDING";
    if (filter === "PREPARING") {
      return (
        o.fulfillmentStatus === "PREPARING" ||
        (o.fulfillmentStatus === "PENDING" &&
          (o.paymentStatus === "CONFIRMED" || o.paymentStatus === "SETTLED_TO_MERCHANT"))
      );
    }
    return o.fulfillmentStatus === filter;
  });

  const declaredCount = orders.filter((o) => o.paymentStatus === "DECLARED").length;
  const pendingPaymentCount = orders.filter((o) => o.paymentStatus === "PENDING").length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="seller-page-header">
        <div>
          <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 6px 0" }}>
            {t.nav.orders}
          </h1>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
            Suivi des encaissements certifiés, relances clients et exécution physique des livraisons.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="seller-filter-bar">
          {[
            { id: "ALL", label: `Toutes (${orders.length})` },
            { id: "DECLARED", label: `Preuves reçues (${declaredCount})` },
            { id: "PENDING_PAYMENT", label: `En attente (${pendingPaymentCount})` },
            { id: "PREPARING", label: "À expédier" },
            { id: "SHIPPED", label: "En cours" },
            { id: "DELIVERED", label: "Livrées" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: filter === tab.id ? "1px solid #D4B483" : "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor:
                  filter === tab.id
                    ? "rgba(173, 132, 85, 0.2)"
                    : tab.id === "DECLARED" && declaredCount > 0
                    ? "rgba(212, 180, 131, 0.12)"
                    : "rgba(0, 0, 0, 0.2)",
                color: filter === tab.id ? "#D4B483" : tab.id === "DECLARED" && declaredCount > 0 ? "#E0C38C" : "rgba(248, 246, 240, 0.7)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "64px", textAlign: "center", color: "rgba(248, 246, 240, 0.5)" }}>
          Chargement des commandes certifiées...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="seller-card"
          style={{
            padding: "64px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              backgroundColor: "rgba(173, 132, 85, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D4B483",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h3 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "20px", color: "#F8F6F0", margin: "0 0 8px 0" }}>
            Aucune commande enregistrée
          </h3>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", maxWidth: "460px", margin: "0 auto" }}>
            Les commandes passées par vos clients apparaîtront ici dès confirmation de leur paiement certifié (Mobile Money / Carte).
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredOrders.map((ord) => {
            const isSettled = ord.paymentStatus === "CONFIRMED" || ord.paymentStatus === "SETTLED_TO_MERCHANT";
            const fulfillment = ord.fulfillmentStatus || "PENDING";

            return (
              <div
                key={ord.id}
                className="seller-card seller-order-card"
              >
                {/* Left: Order Info */}
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#D4B483" }}>
                      {ord.orderNumber}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: isSettled
                          ? "rgba(16, 185, 129, 0.15)"
                          : ord.paymentStatus === "DECLARED"
                          ? "rgba(212, 180, 131, 0.2)"
                          : "rgba(255, 193, 7, 0.15)",
                        color: isSettled
                          ? "#10B981"
                          : ord.paymentStatus === "DECLARED"
                          ? "#E0C38C"
                          : "#FFC107",
                        border: ord.paymentStatus === "DECLARED" ? "1px solid rgba(212, 180, 131, 0.5)" : "none",
                      }}
                    >
                      {isSettled ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Payé &amp; Encaissé</span>
                        </span>
                      ) : ord.paymentStatus === "DECLARED" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                          <span>Preuve déclarée (À encaisser)</span>
                        </span>
                      ) : (
                        <span>Paiement en attente</span>
                      )}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor:
                          fulfillment === "DELIVERED"
                            ? "rgba(16, 185, 129, 0.15)"
                            : fulfillment === "SHIPPED"
                            ? "rgba(33, 150, 243, 0.15)"
                            : "rgba(173, 132, 85, 0.15)",
                        color:
                          fulfillment === "DELIVERED"
                            ? "#10B981"
                            : fulfillment === "SHIPPED"
                            ? "#64B5F6"
                            : "#D4B483",
                      }}
                    >
                      {fulfillment === "DELIVERED"
                        ? "Livré au client"
                        : fulfillment === "SHIPPED"
                        ? "En cours de livraison"
                        : "En préparation atelier"}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.8)", marginBottom: "4px" }}>
                    Client : <strong>{ord.buyerName}</strong> {ord.buyerPhone ? `(${ord.buyerPhone})` : ""}
                  </div>

                  {ord.deliveryAddress && (
                    <div style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.55)" }}>
                      Livraison : {ord.deliveryAddress}
                    </div>
                  )}

                  {ord.lines && ord.lines.length > 0 && (
                    <div style={{ fontSize: "12.5px", color: "#F8F6F0", marginTop: "6px" }}>
                      Articles : {ord.lines.map((l) => `${l.quantity}x ${l.itemTitle}`).join(", ")}
                    </div>
                  )}
                </div>

                {/* Right: Amount & Action Controls */}
                <div className="seller-order-card-right">
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#F8F6F0", fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(ord.totalAmountMinor)}
                  </div>

                  {/* Payment & Relance Controls */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {!isSettled && (
                      <button
                        onClick={() => handleConfirmPayment(ord.id)}
                        disabled={actionLoading === ord.id}
                        className="seller-action-btn"
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #075D49 0%, #10B981 100%)",
                          borderColor: "rgba(16, 185, 129, 0.5)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Valider l'encaissement</span>
                      </button>
                    )}

                    {ord.buyerPhone && (
                      <button
                        onClick={() => handleContactBuyerWhatsApp(ord)}
                        className="seller-action-btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          background: "rgba(37, 211, 102, 0.15)",
                          borderColor: "rgba(37, 211, 102, 0.4)",
                          color: "#25D366",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <span>Relancer client</span>
                      </button>
                    )}
                  </div>

                  {/* Status Progression Buttons */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {fulfillment === "PENDING" && isSettled && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, "PREPARING")}
                        disabled={actionLoading === ord.id}
                        className="seller-action-btn" style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Passer en préparation
                      </button>
                    )}

                    {(fulfillment === "PENDING" || fulfillment === "PREPARING") && isSettled && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, "SHIPPED")}
                        disabled={actionLoading === ord.id}
                        className="seller-action-btn" style={{ padding: "6px 12px", fontSize: "12px", background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)", borderColor: "rgba(33, 150, 243, 0.5)" }}
                      >
                        Expédier
                      </button>
                    )}

                    {fulfillment === "SHIPPED" && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, "DELIVERED")}
                        disabled={actionLoading === ord.id}
                        className="seller-action-btn" style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Confirmer la remise
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
