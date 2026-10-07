"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../landing.css";

interface OrderItem {
  id: string;
  orderNumber: string;
  buyerName: string;
  itemTitle: string;
  totalFcfa: number;
  paymentChannel: string;
  paymentStatus: "PENDING" | "SETTLED_TO_MERCHANT";
  fulfillmentStatus: "PREPARING" | "SHIPPED" | "DELIVERED";
  time: string;
}

export default function StandaloneSellerDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "ord-01",
      orderNumber: "OJK-2026-0891",
      buyerName: "Koffi Mensah",
      itemTitle: "Sac Cabas Grand Marché — Cuir Ébène",
      totalFcfa: 185000,
      paymentChannel: "MTN MoMo",
      paymentStatus: "SETTLED_TO_MERCHANT",
      fulfillmentStatus: "PREPARING",
      time: "14:32",
    },
    {
      id: "ord-02",
      orderNumber: "OJK-2026-0892",
      buyerName: "Amina Diop",
      itemTitle: "Collier Plastron Haute Joaillerie — Bronze",
      totalFcfa: 320000,
      paymentChannel: "Moov Money",
      paymentStatus: "SETTLED_TO_MERCHANT",
      fulfillmentStatus: "SHIPPED",
      time: "12:10",
    },
    {
      id: "ord-03",
      orderNumber: "OJK-2026-0893",
      buyerName: "Marcelle Akouete",
      itemTitle: "Console Assoba — Bois d'Iroko",
      totalFcfa: 650000,
      paymentChannel: "Carte Bancaire",
      paymentStatus: "SETTLED_TO_MERCHANT",
      fulfillmentStatus: "PREPARING",
      time: "10:15",
    },
  ]);

  const [filter, setFilter] = useState<"ALL" | "PREPARING" | "SHIPPED">("ALL");

  useEffect(() => {
    fetch("http://localhost:3001/v1/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            buyerName: o.buyerName,
            itemTitle: o.lines?.[0]?.itemTitle || "Article de boutique",
            totalFcfa: Math.round(o.totalAmountMinor / 100),
            paymentChannel: o.paymentChannel,
            paymentStatus: o.paymentStatus,
            fulfillmentStatus: o.fulfillmentStatus,
            time: o.createdAt?.slice(11, 16) || "Aujourd'hui",
          }));
          setOrders(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateStatus = (id: string, newStatus: "PREPARING" | "SHIPPED" | "DELIVERED") => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, fulfillmentStatus: newStatus } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    return o.fulfillmentStatus === filter;
  });

  return (
    <div className="landing-root">
      {/* Top Luxury Bar */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand-link">
            <div className="brand-symbol">Ọ</div>
            <div className="brand-text-block">
              <span className="brand-title">OJAR盤KET</span>
              <span className="brand-sub">SELLER OS · BOUTIQUE PRO</span>
            </div>
          </Link>
          <div className="landing-header-actions">
            <Link href="/seller/subscription" className="btn-portal-secondary" style={{ padding: "8px 14px", fontSize: "13px", color: "#AD8455", borderColor: "#AD8455" }}>
              ★ Mon Abonnement SaaS (FR-37)
            </Link>
            <Link href="/seller/cashbook" className="btn-portal-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Ouvrir le Livre de Caisse (S43)</span>
            </Link>
            <Link href="/" className="btn-portal-secondary">
              ← Voir la Boutique Publique
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-container" style={{ padding: "40px 24px", maxWidth: "1240px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#AD8455", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              TABLEAU DE BORD VENDEUR PRO (S20)
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: "28px", color: "var(--oj-text-primary)", fontFamily: "Playfair Display, Georgia, serif" }}>
              Maison Ganvié & Fils · Boutique Cotonou
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#075D49", fontSize: "12px", fontWeight: 700 }}>
              ✓ Boutique Vérifiée Ojarket
            </span>
          </div>
        </div>

        {/* 4 Sparkline KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "36px" }}>
          <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)" }}>
            <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", fontWeight: 600 }}>CHIFFRE D&apos;AFFAIRES DU MOIS</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#075D49", margin: "10px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              4 250 000 FCFA
            </div>
            <div style={{ fontSize: "12px", color: "#10B981" }}>+18% vs mois précédent</div>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)" }}>
            <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", fontWeight: 600 }}>COMMANDES DU JOUR</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--oj-text-primary)", margin: "10px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              6 expéditions
            </div>
            <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)" }}>2 en cours d&apos;emballage</div>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)" }}>
            <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", fontWeight: 600 }}>ENCAISSEMENTS DIRECTS</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#AD8455", margin: "10px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              1 155 000 FCFA
            </div>
            <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)" }}>Direct MTN & Moov</div>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)" }}>
            <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", fontWeight: 600 }}>ALERTES STOCK BOUTIQUE</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#DC2626", margin: "10px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              2 pièces
            </div>
            <div style={{ fontSize: "12px", color: "#DC2626" }}>Cuir Ébène presque épuisé</div>
          </div>
        </div>

        {/* Priority Action Tasks (S20 Section) */}
        <div style={{ marginBottom: "36px", padding: "24px", borderRadius: "16px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "var(--oj-text-primary)" }}>
            À faire aujourd&apos;hui (Priorités de boutique)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(220, 38, 38, 0.05)", borderLeft: "4px solid #DC2626" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--oj-text-primary)" }}>
                Expédier le Cabas Cuir Ébène (OJK-2026-0891) vers Haie Vive avant 17h
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626" }}>URGENT</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(212, 180, 131, 0.08)", borderLeft: "4px solid #D4B483" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--oj-text-primary)" }}>
                Répondre à la demande sur-mesure D02 pour la parure en bronze (Abomey)
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#AD8455" }}>SOUS 4H</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(7, 93, 73, 0.05)", borderLeft: "4px solid #075D49" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--oj-text-primary)" }}>
                Effectuer la clôture de caisse journalière (S44)
              </span>
              <Link href="/seller/cashbook" style={{ fontSize: "12px", fontWeight: 700, color: "#075D49", textDecoration: "underline" }}>
                Accéder au livre de caisse →
              </Link>
            </div>
          </div>
        </div>

        {/* Order Triage & Management (S28) */}
        <div style={{ borderRadius: "16px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "var(--oj-text-primary)" }}>
              Carnet de commandes & Expéditions (S28)
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["ALL", "PREPARING", "SHIPPED"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilter(st)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: filter === st ? "2px solid #075D49" : "1px solid var(--oj-border)",
                    backgroundColor: filter === st ? "rgba(7, 93, 73, 0.08)" : "var(--oj-surface)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--oj-text-primary)",
                    cursor: "pointer",
                  }}
                >
                  {st === "ALL" ? "Toutes" : st === "PREPARING" ? "En préparation" : "Expédiées"}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--oj-border)", textAlign: "left", fontSize: "12px", color: "var(--oj-text-secondary)" }}>
                <th style={{ padding: "12px 8px" }}>N° COMMANDE</th>
                <th style={{ padding: "12px 8px" }}>ACHETEUR</th>
                <th style={{ padding: "12px 8px" }}>ARTICLE</th>
                <th style={{ padding: "12px 8px" }}>PAIEMENT MARCHAND</th>
                <th style={{ padding: "12px 8px" }}>STATUT EXPÉDITION</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--oj-border)", fontSize: "14px" }}>
                  <td style={{ padding: "14px 8px", fontWeight: 700, fontFamily: "monospace", color: "var(--oj-text-primary)" }}>
                    {o.orderNumber}
                  </td>
                  <td style={{ padding: "14px 8px", color: "var(--oj-text-primary)", fontWeight: 500 }}>
                    {o.buyerName}
                  </td>
                  <td style={{ padding: "14px 8px", color: "var(--oj-text-secondary)" }}>
                    {o.itemTitle}
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#075D49" }}>
                      ✓ {o.paymentChannel} ({o.totalFcfa.toLocaleString("fr-FR")} FCFA)
                    </span>
                  </td>
                  <td style={{ padding: "14px 8px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: o.fulfillmentStatus === "SHIPPED" ? "rgba(16, 185, 129, 0.15)" : "rgba(212, 180, 131, 0.15)",
                        color: o.fulfillmentStatus === "SHIPPED" ? "#075D49" : "#AD8455",
                      }}
                    >
                      {o.fulfillmentStatus === "SHIPPED" ? "EXPÉDIÉE" : "EN PRÉPARATION"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 8px", textAlign: "right" }}>
                    {o.fulfillmentStatus === "PREPARING" ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o.id, "SHIPPED")}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#075D49",
                          color: "#FAF9F6",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Marquer expédiée
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--oj-text-secondary)" }}>Colis remis</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}