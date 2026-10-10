"use client";

import React, { useState, useEffect } from "react";
import { getStoredToken } from "@/lib/api";
import { sellerTranslations, SellerLocale } from "@/lib/seller-i18n";

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
  const [filter, setFilter] = useState<"ALL" | "PREPARING" | "SHIPPED" | "DELIVERED">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ojarket_seller_locale") as SellerLocale;
      if (saved === "en" || saved === "fr") setLocale(saved);
    } catch {}

    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    const token = getStoredToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

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

    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fulfillmentStatus: nextStatus }),
      });

      if (!res.ok) {
        throw new Error("Erreur de mise à jour du statut");
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

  const t = sellerTranslations[locale];

  const formatPrice = (minor: number) => {
    return (minor / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " FCFA";
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "PREPARING") return o.fulfillmentStatus === "PENDING" || o.fulfillmentStatus === "PREPARING";
    return o.fulfillmentStatus === filter;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 6px 0" }}>
            {t.nav.orders}
          </h1>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
            Suivi des encaissements certifiés et exécution physique des livraisons.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "ALL", label: "Toutes les commandes" },
            { id: "PREPARING", label: "À préparer / expédier" },
            { id: "SHIPPED", label: "En cours d'acheminement" },
            { id: "DELIVERED", label: "Livrées" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: filter === tab.id ? "1px solid #D4B483" : "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: filter === tab.id ? "rgba(173, 132, 85, 0.2)" : "rgba(0, 0, 0, 0.2)",
                color: filter === tab.id ? "#D4B483" : "rgba(248, 246, 240, 0.7)",
                fontSize: "12.5px",
                fontWeight: 500,
                cursor: "pointer",
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
                className="seller-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                {/* Left: Order Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#D4B483" }}>
                      {ord.orderNumber}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: isSettled ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 193, 7, 0.15)",
                        color: isSettled ? "#10B981" : "#FFC107",
                      }}
                    >
                      {isSettled ? "Payé & Encaissé" : "Paiement en attente"}
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

                {/* Right: Amount & Fulfillment Controls */}
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#F8F6F0", fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(ord.totalAmountMinor)}
                  </div>

                  {/* Status Progression Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {fulfillment === "PENDING" && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, "PREPARING")}
                        disabled={actionLoading === ord.id}
                        className="seller-action-btn" style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Passer en préparation
                      </button>
                    )}

                    {(fulfillment === "PENDING" || fulfillment === "PREPARING") && (
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
