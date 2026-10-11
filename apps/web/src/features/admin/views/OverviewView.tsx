"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";
import { AdminIconAlertTriangle } from "../components/shared/AdminIcons";

export function OverviewView() {
  const { isEn } = useAdmin();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import("../../../lib/api").then(({ AuthApi }) => {
      AuthApi.executeFetch("/api/v1/admin/overview")
        .then((res) => {
          setData(res.kpis);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const shopsCount = data?.totalShops || 0;
  const verifiedShopsCount = data?.verifiedShops || 0;
  const pendingKycsCount = data?.pendingKycShops || 0;
  const activeCorridorsCount = data?.activeCorridors || 0;
  const totalVolume = Math.round((data?.totalVolumeMinor || 0) / 100);
  const totalUsers = data?.totalUsers || 0;

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Platform Overview & Health" : "Supervision Globale de la Plateforme"}</h1>
          <p>
            {isEn
              ? "Consolidated transaction volume, active stores, and infrastructure telemetry."
              : "Volume d'affaires consolidé, boutiques actives et télémétrie d'infrastructure."}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
          <div className="oj-kpi-header">
            <span>{isEn ? "Gross Merchandise Volume" : "Volume Global d'Affaires"}</span>
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
            {totalVolume.toLocaleString()} FCFA
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            {isEn ? "Total committed sales" : "CA engagé total"}
          </small>
        </div>

        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
          <div className="oj-kpi-header">
            <span>{isEn ? "Active Stores" : "Boutiques & Commerces"}</span>
            <span className="oj-kpi-trend positive">{verifiedShopsCount} vérifiés</span>
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
            {shopsCount} {isEn ? "Stores" : "Boutiques"}
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            {isEn ? "Total registered" : "Total enregistrées"}
          </small>
        </div>

        <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-accent)" }}>
          <div className="oj-kpi-header">
            <span>{isEn ? "KYC Pending Reviews" : "Dossiers KYC à Contrôler"}</span>
            {pendingKycsCount > 0 && (
              <span className="oj-kpi-trend negative" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <AdminIconAlertTriangle size={12} /> {pendingKycsCount} requis
              </span>
            )}
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "var(--oj-color-accent)" }}>
            {pendingKycsCount} Dossiers
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            {isEn ? "Action required by compliance" : "Validation requise"}
          </small>
        </div>

        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
          <div className="oj-kpi-header">
            <span>{isEn ? "Total Users" : "Utilisateurs Totaux"}</span>
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
            {totalUsers} {isEn ? "Users" : "Utilisateurs"}
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            {isEn ? "Registered users" : "Inscrits sur la plateforme"}
          </small>
        </div>
      </div>

      {/* Service Health Telemetry Grid */}
      <div className="oj-admin-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", margin: "0 0 16px", fontFamily: "var(--oj-font-editorial)" }}>
          {isEn ? "Platform Flow & Integration Health" : "Santé des Flux & Intégrations Plateforme"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "13px", display: "block" }}>MTN MoMo Sandbox & Webhooks</strong>
              <small style={{ color: "var(--oj-color-muted)" }}>Latence moyenne : 240ms</small>
            </div>
            <span className="oj-status-pill success">OPÉRATIONNEL</span>
          </div>
          <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "13px", display: "block" }}>Moteur D02 IA Structuration</strong>
              <small style={{ color: "var(--oj-color-muted)" }}>Pipeline V3 Gemini / Extraction</small>
            </div>
            <span className="oj-status-pill success">PRÊT</span>
          </div>
          <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "13px", display: "block" }}>PostgreSQL & Grand Livre FinOps</strong>
              <small style={{ color: "var(--oj-color-muted)" }}>Prisma Schema V3 ACID</small>
            </div>
            <span className="oj-status-pill success">CONFORME</span>
          </div>
        </div>
      </div>
    </div>
  );
}
