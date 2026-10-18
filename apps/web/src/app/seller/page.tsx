"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredToken, getStoredUser } from "@/lib/api";
import { sellerTranslations, SellerLocale, getInitialSellerLocale } from "@/lib/seller-i18n";

export default function SellerTodayPage() {
  const [locale, setLocale] = useState<SellerLocale>("fr");
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    salesTodayMinor: 0,
    ordersCount: 0,
    lowStockCount: 0,
    collectedMinor: 0,
    outstandingMinor: 0,
  });
  const [priorities, setPriorities] = useState<Array<{ text: string; link: string; action: string; type: string }>>([]);

  useEffect(() => {
    try {
      const initial = getInitialSellerLocale();
      setLocale(initial);
    } catch {}

    const token = getStoredToken();
    const storedUser = getStoredUser();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    };

    Promise.all([
      fetch("/api/v1/seller/shop", { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/seller/dashboard", { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/seller/cashbook", { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/seller/orders", { headers }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([shopRes, dashRes, cashbookRes, ordersRes]) => {
        if (shopRes?.shop) {
          setShop(shopRes.shop);
        }

        const taskList: Array<{ text: string; link: string; action: string; type: string }> = [];

        const orders = ordersRes?.orders || (Array.isArray(ordersRes) ? ordersRes : []);

        // 1. Check declared payments needing confirmation
        const declaredOrders = orders.filter((o: any) => o.paymentStatus === "DECLARED");
        if (declaredOrders.length > 0) {
          taskList.push({
            text: `${declaredOrders.length} preuve(s) de règlement déclarée(s) par vos clients à certifier`,
            link: "/seller/orders",
            action: "Valider l'encaissement",
            type: "urgent",
          });
        }

        // 2. Check pending payments to follow up
        const pendingPaymentOrders = orders.filter((o: any) => o.paymentStatus === "PENDING");
        if (pendingPaymentOrders.length > 0) {
          taskList.push({
            text: `${pendingPaymentOrders.length} commande(s) en attente de paiement — relancez vos clients`,
            link: "/seller/orders",
            action: "Suivre et relancer",
            type: "notice",
          });
        }

        // 3. Check paid orders pending preparation
        const paidPreparingOrders = orders.filter(
          (o: any) =>
            (o.paymentStatus === "CONFIRMED" || o.paymentStatus === "SETTLED_TO_MERCHANT") &&
            (o.fulfillmentStatus === "PREPARING" || o.fulfillmentStatus === "PENDING")
        );
        if (paidPreparingOrders.length > 0) {
          taskList.push({
            text: `${paidPreparingOrders.length} commande(s) encaissée(s) en attente d'expédition`,
            link: "/seller/orders",
            action: "Traiter les commandes",
            type: "urgent",
          });
        }

        // Check cashbook status
        const cbSummary = cashbookRes?.summary || { totalVenduMinor: 0, totalEncaisseMinor: 0, totalRestantMinor: 0 };
        taskList.push({
          text: "Clôture de caisse certifiée disponible pour la journée",
          link: "/seller/cashbook",
          action: "Clôturer le livre de caisse",
          type: "action",
        });

        // Check catalog product count
        const productCount = shopRes?.shop?.counts?.products || 0;
        if (productCount === 0) {
          taskList.push({
            text: "Votre vitrine n'a aucun produit publié. Ajoutez votre première création pour être visible.",
            link: "/seller/catalog/new",
            action: "Ajouter une création",
            type: "notice",
          });
        }

        setPriorities(taskList);

        let salesMinor = 0;
        let ordersCount = orders.length;

        orders.forEach((o: any) => {
          if (o.totalAmountMinor) salesMinor += o.totalAmountMinor;
        });

        setMetrics({
          salesTodayMinor: cbSummary.totalVenduMinor || salesMinor,
          ordersCount,
          lowStockCount: 0,
          collectedMinor: cbSummary.totalEncaisseMinor || salesMinor,
          outstandingMinor: cbSummary.totalRestantMinor || 0,
        });

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const t = sellerTranslations[locale];

  const formatPrice = (minor: number) => {
    return (minor / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " FCFA";
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Banner & Welcome */}
      <div className="seller-page-header">
        <div>
          <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 8px 0" }}>
            {t.today.title}
          </h1>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
            {shop?.name ? `${shop.name} · ` : ""}{t.today.subtitle}
          </p>
        </div>

        <div className="seller-header-btn-group">
          <Link
            href="/seller/catalog/new"
            className="seller-action-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{t.catalog.addNewButton}</span>
          </Link>
          <Link
            href="/seller/cashbook"
            className="seller-secondary-btn"
          >
            <span>{t.nav.cashbook}</span>
          </Link>
        </div>
      </div>

      {/* ==================== S20: PRIORITIES FIRST ==================== */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "13.5px", textTransform: "uppercase", letterSpacing: "1px", color: "#D4B483", marginBottom: "14px", fontWeight: 700 }}>
          {t.today.tasksTitle}
        </h2>

        {priorities.length === 0 ? (
          <div
            style={{
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#10B981",
              fontSize: "13.5px",
            }}
          >
            {t.today.noTasks}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {priorities.map((item, idx) => (
              <div
                key={idx}
                className="seller-card seller-priority-card"
                style={{
                  borderColor: item.type === "urgent" ? "rgba(229, 115, 115, 0.4)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: item.type === "urgent" ? "#E57373" : "#D4B483",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#F8F6F0", lineHeight: "1.45" }}>{item.text}</span>
                </div>

                <Link
                  href={item.link}
                  className="seller-secondary-btn"
                  style={{ padding: "8px 14px", fontSize: "12.5px", flexShrink: 0 }}
                >
                  {item.action} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== S20: CERTIFIED KPIS ==================== */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "13.5px", textTransform: "uppercase", letterSpacing: "1px", color: "#D4B483", marginBottom: "14px", fontWeight: 700 }}>
          {t.today.kpisTitle}
        </h2>

        <div className="seller-kpi-grid">
          {/* Card 1: Total Sales */}
          <div className="seller-card" style={{ padding: "20px" }}>
            <div className="kpi-label" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(248, 246, 240, 0.6)", marginBottom: "8px" }}>
              {t.today.salesToday}
            </div>
            <div className="kpi-value" style={{ fontSize: "22px", fontWeight: 700, color: "#F8F6F0", fontFamily: "var(--oj-font-editorial, serif)", fontVariantNumeric: "tabular-nums" }}>
              {formatPrice(metrics.salesTodayMinor)}
            </div>
            <div className="kpi-note" style={{ fontSize: "11px", color: "#10B981", marginTop: "8px" }}>
              Écritures certifiées en caisse
            </div>
          </div>

          {/* Card 2: Orders Count */}
          <div className="seller-card" style={{ padding: "20px" }}>
            <div className="kpi-label" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(248, 246, 240, 0.6)", marginBottom: "8px" }}>
              {t.today.ordersCount}
            </div>
            <div className="kpi-value" style={{ fontSize: "22px", fontWeight: 700, color: "#F8F6F0", fontFamily: "var(--oj-font-editorial, serif)", fontVariantNumeric: "tabular-nums" }}>
              {metrics.ordersCount}
            </div>
            <div className="kpi-note" style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.5)", marginTop: "8px" }}>
              Commandes enregistrées en base
            </div>
          </div>

          {/* Card 3: Collected */}
          <div className="seller-card" style={{ padding: "20px" }}>
            <div className="kpi-label" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(248, 246, 240, 0.6)", marginBottom: "8px" }}>
              {t.today.collectedAmount}
            </div>
            <div className="kpi-value" style={{ fontSize: "22px", fontWeight: 700, color: "#10B981", fontFamily: "var(--oj-font-editorial, serif)", fontVariantNumeric: "tabular-nums" }}>
              {formatPrice(metrics.collectedMinor)}
            </div>
            <div className="kpi-note" style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.5)", marginTop: "8px" }}>
              Liquidités en caisse &amp; virements
            </div>
          </div>

          {/* Card 4: Outstanding */}
          <div className="seller-card" style={{ padding: "20px" }}>
            <div className="kpi-label" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(248, 246, 240, 0.6)", marginBottom: "8px" }}>
              {t.today.pendingAmount}
            </div>
            <div className="kpi-value" style={{ fontSize: "22px", fontWeight: 700, color: metrics.outstandingMinor > 0 ? "#E57373" : "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", fontVariantNumeric: "tabular-nums" }}>
              {formatPrice(metrics.outstandingMinor)}
            </div>
            <div className="kpi-note" style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.5)", marginTop: "8px" }}>
              Ventes à crédit en attente
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Modules */}
      <div
        className="seller-card seller-priority-card"
        style={{
          padding: "24px 20px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "17px", color: "#F8F6F0", margin: "0 0 6px 0", fontFamily: "var(--oj-font-editorial, serif)" }}>
            Gestion Intégrale du Commerce Marchand
          </h3>
          <p style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.65)", margin: 0, lineHeight: "1.5" }}>
            Consultez votre catalogue d'artisan, configurez vos politiques ou auditez vos mouvements de stocks.
          </p>
        </div>

        <div className="seller-header-btn-group" style={{ marginTop: "4px" }}>
          <Link
            href="/seller/catalog"
            className="seller-secondary-btn"
          >
            {t.nav.catalog}
          </Link>
          <Link
            href="/seller/orders"
            className="seller-secondary-btn"
          >
            {t.nav.orders}
          </Link>
          <Link
            href="/seller/settings"
            className="seller-secondary-btn"
          >
            {t.nav.settings}
          </Link>
        </div>
      </div>
    </div>
  );
}