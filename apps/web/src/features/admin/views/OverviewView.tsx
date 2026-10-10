"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";
import { AdminIconAlertTriangle } from "../components/shared/AdminIcons";

export function OverviewView() {
  const { isEn } = useAdmin();

  // Temporary constants for overview UI (will be replaced by API calls)
  const shopsCount = 28;
  const pendingKycsCount = 3;
  const activeCorridorsCount = 3;

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

      {/* 4 Metric Cards */}
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
            <span className="oj-kpi-trend positive">↗ +28.4%</span>
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
            54 800 000 FCFA
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            {isEn ? "Total committed sales (30d)" : "CA engagé sur 30 jours"}
          </small>
        </div>

        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
          <div className="oj-kpi-header">
            <span>{isEn ? "Active Stores" : "Boutiques & Commerces"}</span>
            <span className="oj-kpi-trend positive">28 vérifiés</span>
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
            {shopsCount} {isEn ? "Stores" : "Boutiques"}
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            Bénin (3), Mali (1), Côte d'Ivoire (1)
          </small>
        </div>

        <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-accent)" }}>
          <div className="oj-kpi-header">
            <span>{isEn ? "KYC Pending Reviews" : "Dossiers KYC à Contrôler"}</span>
            <span className="oj-kpi-trend negative" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><AdminIconAlertTriangle size={12} /> {pendingKycsCount} requis</span>
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
            <span>{isEn ? "Active Payment Corridors" : "Corridors Ouverts"}</span>
            <span className="oj-kpi-trend positive">3 / 6</span>
          </div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
            {activeCorridorsCount} Canaux
          </strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
            MTN MoMo, Moov, Celtiis
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
